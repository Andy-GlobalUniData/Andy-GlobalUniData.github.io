/**
 * 地圖檢視模塊 - Map Module
 * 負責地圖顯示和學校位置標記
 */

class MapModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.map = null;
        this.markersLayer = null;
        this.isLeafletLoaded = false;
        this.isInitialized = false;
        this.mapContainer = null;
        
        console.log('MapModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('map', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        this.core.on('filterChanged', () => this.updateMapMarkers());
        
        // 監聽標籤頁切換事件
        this.setupTabListener();
        
        console.log('MapModule: Event listeners registered');
    }

    setup() {
        if (this.isInitialized) return;
        
        console.log('MapModule: Setting up...');
        
        this.createMapContainer();
        this.loadLeafletLibrary();
        
        this.isInitialized = true;
        console.log('MapModule: Setup complete');
    }

    // 設置標籤頁監聽器
    setupTabListener() {
        // 監聽標籤頁切換到地圖檢視時
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button') && 
                e.target.getAttribute('data-tab') === 'map-view') {
                setTimeout(() => this.onMapTabActivated(), 100);
            }
        });
    }

    // 當地圖標籤頁被激活時
    onMapTabActivated() {
        console.log('MapModule: Map tab activated');
        
        if (!this.isLeafletLoaded) {
            this.loadLeafletLibrary();
        } else if (this.map) {
            // 重新調整地圖大小
            this.map.invalidateSize();
        } else {
            this.initializeMap();
        }
    }

    // 創建地圖容器
    createMapContainer() {
        let mapContainer = document.getElementById("school-map-container");
        
        if (!mapContainer) {
            mapContainer = document.createElement("div");
            mapContainer.id = "school-map-container";
            mapContainer.style.cssText = "width: 100%; margin: 20px 0;";
            
            // 找到地圖標籤面板並添加容器
            const mapPanel = document.getElementById("map-view");
            if (mapPanel) {
                const existingContent = mapPanel.querySelector('.table-container');
                if (existingContent) {
                    existingContent.appendChild(mapContainer);
                } else {
                    mapPanel.appendChild(mapContainer);
                }
            }
        }
        
        this.mapContainer = mapContainer;
        console.log('MapModule: Map container created');
    }

    // 載入 Leaflet 庫
    loadLeafletLibrary() {
        if (this.isLeafletLoaded && window.L && window.L.map) {
            this.initializeMap();
            return;
        }

        console.log('MapModule: Loading Leaflet library...');

        // 載入 CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
            const leafletCss = document.createElement('link');
            leafletCss.rel = 'stylesheet';
            leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(leafletCss);
        }

        // 載入 JS
        if (!window.L) {
            const leafletJs = document.createElement('script');
            leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletJs.onload = () => {
                this.isLeafletLoaded = true;
                console.log('MapModule: Leaflet library loaded');
                this.initializeMap();
            };
            leafletJs.onerror = () => {
                console.error('MapModule: Failed to load Leaflet library');
                this.showError('地圖庫載入失敗，請重新整理頁面');
            };
            document.head.appendChild(leafletJs);
        } else {
            this.isLeafletLoaded = true;
            this.initializeMap();
        }
    }

    // 初始化地圖
    initializeMap() {
        if (!this.mapContainer || !window.L) {
            console.error('MapModule: Cannot initialize map - missing dependencies');
            return;
        }

        console.log('MapModule: Initializing map...');

        // 清空容器
        this.mapContainer.innerHTML = '';

        // 創建標題
        const title = document.createElement('h3');
        title.textContent = '🗺️ 學校位置地圖';
        title.style.cssText = 'margin-bottom: 15px; color: var(--text-color);';
        this.mapContainer.appendChild(title);

        // 創建地圖控制面板
        const controlPanel = document.createElement('div');
        controlPanel.className = 'map-control-panel';
        controlPanel.style.cssText = `
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        `;
        
        controlPanel.innerHTML = `
            <button id="show-all-schools" class="map-control-btn primary">顯示所有學校</button>
            <button id="show-filtered-schools" class="map-control-btn secondary-btn">顯示篩選結果</button>
            <button id="cluster-markers" class="map-control-btn secondary-btn">標記聚合</button>
            <span class="map-info" id="map-info">準備載入地圖...</span>
        `;
        
        this.mapContainer.appendChild(controlPanel);

        // 創建地圖 div
        const mapDiv = document.createElement('div');
        mapDiv.id = 'leaflet-map';
        mapDiv.style.cssText = `
            width: 100%; 
            height: 500px; 
            border-radius: 8px;
            border: 1px solid var(--border-color);
        `;
        this.mapContainer.appendChild(mapDiv);

        // 銷毀現有地圖
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // 創建新地圖
        this.map = L.map('leaflet-map').setView([25.0330, 121.5654], 2); // 台灣為中心

        // 添加地圖圖層
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        // 創建標記圖層
        this.markersLayer = L.layerGroup().addTo(this.map);

        // 設置控制按鈕事件
        this.setupMapControls();

        // 初始載入學校標記
        this.loadSchoolMarkers();

        console.log('MapModule: Map initialized successfully');
    }

    // 設置地圖控制按鈕
    setupMapControls() {
        const showAllBtn = document.getElementById('show-all-schools');
        const showFilteredBtn = document.getElementById('show-filtered-schools');
        const clusterBtn = document.getElementById('cluster-markers');

        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAllSchools());
        }

        if (showFilteredBtn) {
            showFilteredBtn.addEventListener('click', () => this.showFilteredSchools());
        }

        if (clusterBtn) {
            clusterBtn.addEventListener('click', () => this.toggleMarkerClustering());
        }
    }

    // 載入學校標記
    loadSchoolMarkers() {
        if (!this.map || !this.markersLayer || !this.core.schoolData) {
            console.warn('MapModule: Cannot load markers - missing dependencies');
            return;
        }

        console.log('MapModule: Loading school markers...');

        // 清除現有標記
        this.markersLayer.clearLayers();

        const schoolsWithCoordinates = this.core.schoolData.filter(school => 
            school.Latitude && school.Longitude && 
            !isNaN(parseFloat(school.Latitude)) && !isNaN(parseFloat(school.Longitude))
        );

        console.log(`MapModule: Found ${schoolsWithCoordinates.length} schools with coordinates`);

        const markers = [];
        
        schoolsWithCoordinates.forEach((school, index) => {
            const lat = parseFloat(school.Latitude);
            const lng = parseFloat(school.Longitude);

            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                // 計算該學校的科系數量
                const departmentCount = this.core.data.filter(dept => 
                    dept['School Name'] === school['School Name']
                ).length;

                // 創建標記
                const marker = L.marker([lat, lng]);
                
                // 創建彈出視窗內容
                const popupContent = `
                    <div class="school-popup">
                        <h4 class="school-popup-title">${school['School Name']}</h4>
                        <div class="school-popup-info">
                            <p><strong>國家:</strong> ${school.Country}</p>
                            <p><strong>城市:</strong> ${school.City || 'N/A'}</p>
                            <p><strong>科系數量:</strong> ${departmentCount}</p>
                            ${school.Group ? `<p><strong>集團:</strong> ${school.Group}</p>` : ''}
                            ${school['School URL'] && school['School URL'] !== 'N/A' ? 
                                `<p><a href="${school['School URL']}" target="_blank" rel="noopener noreferrer" class="school-popup-link">🔗 學校官網</a></p>` : ''
                            }
                        </div>
                        <div class="school-popup-actions">
                            <button class="filter-by-school-btn" data-school="${school['School Name']}">篩選此學校</button>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);
                
                // 添加點擊事件
                marker.on('popupopen', () => {
                    this.setupPopupEventListeners();
                });

                markers.push(marker);
                this.markersLayer.addLayer(marker);
            }
        });

        // 調整地圖視野以包含所有標記
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }

        this.updateMapInfo(`顯示 ${markers.length} 所學校`);
    }

    // 設置彈出視窗事件監聽器
    setupPopupEventListeners() {
        const filterBtns = document.querySelectorAll('.filter-by-school-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const schoolName = e.target.getAttribute('data-school');
                this.filterBySchool(schoolName);
            });
        });
    }

    // 根據學校篩選
    filterBySchool(schoolName) {
        console.log('MapModule: Filtering by school:', schoolName);
        
        // 使用核心模塊的篩選功能
        this.core.setFilter('schools', [schoolName]);
        
        // 更新 UI 中的學校選擇器
        const schoolCheckboxes = document.querySelectorAll('.school-checkbox');
        const selectAllSchools = document.getElementById('select-all-schools');
        
        if (selectAllSchools) {
            selectAllSchools.checked = false;
        }
        
        schoolCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === schoolName;
        });
        
        // 切換到科系資料標籤頁
        this.switchToDepartmentTab();
        
        this.showToast(`已篩選學校: ${schoolName}`);
    }

    // 切換到科系資料標籤頁
    switchToDepartmentTab() {
        const departmentTabButton = document.querySelector('.tab-button[data-tab="department-data"]');
        if (departmentTabButton) {
            departmentTabButton.click();
        }
    }

    // 顯示所有學校
    showAllSchools() {
        this.loadSchoolMarkers();
    }

    // 顯示篩選結果
    showFilteredSchools() {
        if (!this.map || !this.markersLayer) return;

        const filters = this.core.getAllFilters();
        let filteredSchools = [...this.core.schoolData];

        // 根據國家篩選
        if (filters.countries.length > 0) {
            filteredSchools = filteredSchools.filter(school => 
                filters.countries.includes(school.Country)
            );
        }

        // 根據學校篩選
        if (filters.schools.length > 0) {
            filteredSchools = filteredSchools.filter(school => 
                filters.schools.includes(school['School Name'])
            );
        }

        // 清除現有標記
        this.markersLayer.clearLayers();

        const markers = [];
        filteredSchools.forEach(school => {
            const lat = parseFloat(school.Latitude);
            const lng = parseFloat(school.Longitude);

            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                const departmentCount = this.core.data.filter(dept => 
                    dept['School Name'] === school['School Name']
                ).length;

                const marker = L.marker([lat, lng]);
                
                const popupContent = `
                    <div class="school-popup">
                        <h4 class="school-popup-title">${school['School Name']}</h4>
                        <div class="school-popup-info">
                            <p><strong>國家:</strong> ${school.Country}</p>
                            <p><strong>城市:</strong> ${school.City || 'N/A'}</p>
                            <p><strong>科系數量:</strong> ${departmentCount}</p>
                        </div>
                    </div>
                `;

                marker.bindPopup(popupContent);
                markers.push(marker);
                this.markersLayer.addLayer(marker);
            }
        });

        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }

        this.updateMapInfo(`顯示篩選結果: ${markers.length} 所學校`);
    }

    // 更新地圖標記（響應篩選變化）
    updateMapMarkers() {
        // 如果地圖標籤頁是活動的，更新標記
        const mapTab = document.getElementById('map-view');
        if (mapTab && mapTab.classList.contains('active')) {
            this.showFilteredSchools();
        }
    }

    // 切換標記聚合（預留功能）
    toggleMarkerClustering() {
        this.showToast('標記聚合功能開發中...');
    }

    // 更新地圖信息
    updateMapInfo(message) {
        const mapInfo = document.getElementById('map-info');
        if (mapInfo) {
            mapInfo.textContent = message;
        }
    }

    // 顯示錯誤
    showError(message) {
        if (this.mapContainer) {
            this.mapContainer.innerHTML = `
                <div class="map-error">
                    <h3>🗺️ 地圖載入錯誤</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">重新載入</button>
                </div>
            `;
        }
    }

    // 顯示提示
    showToast(message, duration = 3000) {
        let toast = document.getElementById('map-toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'map-toast-message';
            toast.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                background: var(--accent-color);
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-weight: 500;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.transform = 'translateX(0)';

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, duration);
    }

    // 重新調整地圖大小
    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    // 銷毀
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        this.markersLayer = null;
        this.isInitialized = false;
        this.isLeafletLoaded = false;
        
        console.log('MapModule: Destroyed');
    }
}

// 匯出模塊
window.MapModule = MapModule;
