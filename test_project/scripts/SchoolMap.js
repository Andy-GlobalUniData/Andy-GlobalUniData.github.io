// SchoolMap.js
// 顯示所有學校在 Google Map 上

document.addEventListener("DOMContentLoaded", function () {
    // 載入 Leaflet CSS/JS
    function loadLeaflet(callback) {
        if (window.L && window.L.map) { callback(); return; }
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);
        const leafletJs = document.createElement('script');
        leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJs.onload = callback;
        document.head.appendChild(leafletJs);
    }

    let mapContainer = document.getElementById("school-map-container");
    if (!mapContainer) {
        mapContainer = document.createElement("div");
        mapContainer.id = "school-map-container";
        mapContainer.style = "width: 100%; margin: 30px 0;";
        const tableContainer = document.getElementById("school-data-table-container");
        tableContainer.parentNode.insertBefore(mapContainer, tableContainer.nextSibling);
    }

    let allSchools = [];
    let map, markersLayer;

    function renderLeafletMap(checkedNames) {
        mapContainer.innerHTML = '';
        const title = document.createElement('h3');
        title.textContent = 'School Locations on Map';
        title.style = 'margin-bottom: 8px;';
        mapContainer.appendChild(title);

        const mapDiv = document.createElement('div');
        mapDiv.id = 'leaflet-map';
        mapDiv.style = 'width: 100%; height: 500px;';
        mapContainer.appendChild(mapDiv);

        if (!window.L || !window.L.map) return;

        if (map) { map.remove(); map = null; }
        map = L.map('leaflet-map');
        // 使用 CartoDB Positron 近似 Google Maps 樣式
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(map);

        const checkedSchools = allSchools.filter(s => checkedNames.includes(s.School_name) && !isNaN(parseFloat(s.latitude)) && !isNaN(parseFloat(s.longitude)));
        if (checkedSchools.length === 0) {
            map.setView([30, 0], 2);
            return;
        }

        const bounds = [];
        // Google Maps 樣式紅色 marker 圖示
        const redIcon = L.icon({
            iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        checkedSchools.forEach(school => {
            const lat = parseFloat(school.latitude);
            const lng = parseFloat(school.longitude);
            if (isNaN(lat) || isNaN(lng)) return;
            const marker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
            const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            marker.bindPopup(`
                <b>${school.School_name}</b><br>
                ${school.Country}, ${school.City}<br>
                <a href='${school.URL}' target='_blank'>School Website</a><br>
                <a href='${googleMapUrl}' target='_blank' style='color:#4285F4;font-weight:bold;'>Google Map Link</a>
            `);
            // 在 marker 上方顯示學校名稱 label
            const label = L.tooltip({ permanent: true, direction: 'top', className: 'school-label' })
                .setContent(school.School_name)
                .setLatLng([lat, lng]);
            map.addLayer(label);
            bounds.push([lat, lng]);
        });
        if (bounds.length === 1) {
            map.setView(bounds[0], 10);
        } else {
            map.fitBounds(bounds, { padding: [30, 30] });
        }
    }

    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            allSchools = data.filter(s => s.School_name && s.City && s.Country);
            function updateMapByChecked() {
                const checkedNames = Array.from(document.querySelectorAll('.school-checkbox:checked')).map(cb => cb.value);
                renderLeafletMap(checkedNames);
            }
            document.addEventListener("schoolSelectionChanged", updateMapByChecked);
            loadLeaflet(updateMapByChecked);
        })
        .catch(error => {
            mapContainer.innerHTML = "地圖載入失敗";
        });
});
