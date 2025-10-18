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

        // 使用 Marker Clustering 大幅減少記憶體使用
        const markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,              // 聚合半徑
            spiderfyOnMaxZoom: true,           // 最大縮放時展開
            showCoverageOnHover: false,        // 不顯示覆蓋區域，節省記憶體
            zoomToBoundsOnClick: true,         // 點擊時縮放到邊界
            removeOutsideVisibleBounds: true,  // 移除可見範圍外的 marker，大幅節省記憶體 ✨
            chunkedLoading: true,              // 分批載入，避免阻塞 UI
            chunkInterval: 200,                // 每批間隔 200ms
            chunkDelay: 50,                    // 延遲 50ms 開始
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-';
                
                // 根據數量設定不同樣式
                if (count < 10) {
                    className += 'small';
                } else if (count < 50) {
                    className += 'medium';
                } else {
                    className += 'large';
                }
                
                return L.divIcon({
                    html: '<div><span>' + count + '</span></div>',
                    className: 'marker-cluster ' + className,
                    iconSize: L.point(40, 40)
                });
            }
        });

        const bounds = [];
        
        // Google Maps 樣式紅色 marker 圖示
        const redIcon = L.icon({
            iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        console.log(`🗺️  正在載入 ${checkedSchools.length} 個學校標記 (使用 Clustering)`);

        // 分批處理 markers 以避免阻塞 UI
        checkedSchools.forEach(school => {
            const lat = parseFloat(school.latitude);
            const lng = parseFloat(school.longitude);
            if (isNaN(lat) || isNaN(lng)) return;
            
            const marker = L.marker([lat, lng], { icon: redIcon });
            const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            
            marker.bindPopup(`
                <b>${school.School_name}</b><br>
                ${school.Country}, ${school.City}<br>
                <a href='${school.URL}' target='_blank'>School Website</a><br>
                <a href='${googleMapUrl}' target='_blank' style='color:#4285F4;font-weight:bold;'>Google Map Link</a>
            `);
            
            // 將 marker 加入 cluster group，而不是直接加到地圖
            markerClusterGroup.addLayer(marker);
            bounds.push([lat, lng]);
        });
        
        // 將整個 cluster group 一次加到地圖
        map.addLayer(markerClusterGroup);
        
        // 調整視野
        if (bounds.length === 1) {
            map.setView(bounds[0], 10);
        } else if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [30, 30] });
        }
        
        console.log(`✅ 地圖載入完成，使用 Marker Clustering 大幅節省記憶體`);
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
