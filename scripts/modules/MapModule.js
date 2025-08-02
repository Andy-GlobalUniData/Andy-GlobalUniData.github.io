/**
 * 地圖模塊 - Map Module
 * 負責地圖功能和學校位置標記的顯示
 */

class MapModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.map = null;
        this.markers = [];
        this.markerLayer = null;
        this.leafletLoaded = false;
        this.isInitialized = false;
        
        console.log('MapModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('map', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        this.core.on('dataLoaded', (e) => this.loadSchoolMarkers(e.detail.schoolData));
        this.core.on('filterChanged', (e) => this.updateMarkers());
        
        console.log('MapModule: Event listeners registered');
    }

    // 設置
    async setup() {
        if (this.isInitialized) return;
        
        console.log('MapModule: Setting up...');
        
        try {
            await this.loadLeafletLibrary();
            this.initializeMap();
            this.setupMapControls();
            
            // 如果已經有學校數據，就載入標記
            if (this.core.schoolData && this.core.schoolData.length > 0) {
                this.loadSchoolMarkers(this.core.schoolData);
            }
            
            this.isInitialized = true;
            console.log('MapModule: Setup complete');
        } catch (error) {
            console.error('MapModule: Setup failed:', error);
        }
    }

    // 載入 Leaflet 庫
    async loadLeafletLibrary() {
        if (this.leafletLoaded) return;
        
        console.log('MapModule: Loading Leaflet library...');
        
        return new Promise((resolve, reject) => {
            // 檢查是否已經載入
            if (window.L) {
                this.leafletLoaded = true;
                resolve();
                return;
            }

            // 載入 CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            cssLink.crossOrigin = '';
            document.head.appendChild(cssLink);

            // 載入 JavaScript
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            
            script.onload = () => {
                this.leafletLoaded = true;
                console.log('MapModule: Leaflet library loaded successfully');
                resolve();
            };
            
            script.onerror = () => {
                console.error('MapModule: Failed to load Leaflet library');
                reject(new Error('Failed to load Leaflet library'));
            };
            
            document.head.appendChild(script);
        });
    }

    // 初始化地圖
    initializeMap() {
        const mapContainer = document.getElementById('school-map');
        if (!mapContainer) {
            console.error('MapModule: Map container not found');
            return;
        }

        console.log('MapModule: Initializing map...');

        try {
            // 初始化地圖（以台灣為中心）
            this.map = L.map('school-map').setView([23.8, 121.0], 7);

            // 加入 OpenStreetMap 圖層
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(this.map);

            // 初始化標記圖層
            this.markerLayer = L.layerGroup().addTo(this.map);

            console.log('MapModule: Map initialized successfully');
        } catch (error) {
            console.error('MapModule: Failed to initialize map:', error);
        }
    }

    // 設置地圖控制
    setupMapControls() {
        if (!this.map) return;
        
        console.log('MapModule: Setting up map controls...');
        
        // 加入縮放控制
        L.control.zoom({
            position: 'topleft'
        }).addTo(this.map);

        // 加入比例尺
        L.control.scale({
            position: 'bottomleft',
            imperial: false
        }).addTo(this.map);

        // 地圖事件監聽
        this.map.on('zoomend', () => {
            console.log('MapModule: Zoom level changed to', this.map.getZoom());
        });

        console.log('MapModule: Map controls setup complete');
    }

    // 載入學校標記
    loadSchoolMarkers(schoolData) {
        if (!this.map || !this.markerLayer || !schoolData) {
            console.log('MapModule: Map not ready or no school data available');
            return;
        }

        console.log('MapModule: Loading school markers...', schoolData.length, 'schools');

        // 清除既有標記
        this.clearMarkers();

        let markersLoaded = 0;
        let markersSkipped = 0;

        schoolData.forEach(school => {
            const lat = parseFloat(school.Latitude);
            const lng = parseFloat(school.Longitude);
            
            // 檢查座標是否有效
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                markersSkipped++;
                return;
            }

            // 計算該學校的科系數量
            const departmentCount = this.calculateDepartmentCount(school['School Name']);

            // 創建標記
            const marker = L.marker([lat, lng], {
                title: school['School Name']
            });

            // 創建彈出窗內容
            const popupContent = this.createPopupContent(school, departmentCount);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'school-popup'
            });

            // 標記事件
            marker.on('click', () => {
                console.log('MapModule: Marker clicked for', school['School Name']);
            });

            marker.on('popupopen', () => {
                this.setupPopupEventListeners(school);
            });

            this.markers.push({
                marker: marker,
                schoolData: school,
                departmentCount: departmentCount
            });

            markersLoaded++;
        });

        // 更新標記顯示
        this.updateMarkersDisplay();

        console.log(`MapModule: Loaded ${markersLoaded} markers, skipped ${markersSkipped} invalid coordinates`);
    }

    // 計算學校的科系數量
    calculateDepartmentCount(schoolName) {
        if (!this.core.data) return 0;
        
        return this.core.data.filter(item => 
            item['School Name'] === schoolName
        ).length;
    }

    // 創建彈出窗內容
    createPopupContent(school, departmentCount) {
        const schoolUrl = school['School URL'];
        const hasValidUrl = schoolUrl && schoolUrl !== 'N/A' && schoolUrl.trim() !== '';
        
        return `
            <div class="school-popup-content">
                <h3 class="school-name">${school['School Name']}</h3>
                <div class="school-info">
                    <p><strong>🇨🇳 國家:</strong> ${school.Country}</p>
                    <p><strong>🏢 城市:</strong> ${school.City || 'N/A'}</p>
                    <p><strong>🏫 科系數量:</strong> <span class="department-count">${departmentCount}</span></p>
                    ${school.Group ? `<p><strong>🌐 合作集團:</strong> ${school.Group}</p>` : ''}
                </div>
                <div class="popup-actions">
                    ${hasValidUrl ? `
                        <a href="${schoolUrl}" target="_blank" rel="noopener noreferrer" class="school-website-btn">
                            <span class="btn-icon">🔗</span>
                            學校網站
                        </a>
                    ` : ''}
                    <button class="filter-by-school-btn" data-school="${school['School Name']}">
                        <span class="btn-icon">🔍</span>
                        查看科系
                    </button>
                    ${hasValidUrl ? `
                        <button class="copy-school-url-btn" data-url="${schoolUrl}">
                            <span class="btn-icon">📋</span>
                            複製網址
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 設置彈出窗事件監聽器
    setupPopupEventListeners(school) {
        // 篩選學校按鈕
        $('.filter-by-school-btn').off('click').on('click', (e) => {
            const schoolName = $(e.currentTarget).data('school');
            this.filterBySchool(schoolName);
        });

        // 複製學校 URL 按鈕
        $('.copy-school-url-btn').off('click').on('click', (e) => {
            const url = $(e.currentTarget).data('url');
            this.copyToClipboard(url);
        });
    }

    // 根據學校篩選
    filterBySchool(schoolName) {
        console.log('MapModule: Filtering by school:', schoolName);
        
        // 更新核心篩選器
        this.core.setFilter('schools', [schoolName]);
        
        // 更新 UI 中的學校選擇器
        this.updateSchoolFilterUI(schoolName);
        
        // 切換到科系資料標籤頁
        this.switchToDepartmentTab();
        
        // 關閉彈出窗
        this.map.closePopup();
        
        this.showToast(`已篩選學校: ${schoolName}`);
    }

    // 更新學校篩選器 UI
    updateSchoolFilterUI(schoolName) {
        const schoolCheckboxes = document.querySelectorAll('.school-checkbox');
        const selectAllSchools = document.getElementById('select-all-schools');
        
        if (selectAllSchools) {
            selectAllSchools.checked = false;
        }
        
        schoolCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === schoolName;
        });
    }

    // 切換到科系資料標籤頁
    switchToDepartmentTab() {
        const departmentTabButton = document.querySelector('.tab-button[data-tab="department-data"]');
        if (departmentTabButton) {
            departmentTabButton.click();
        }
    }

    // 更新標記顯示
    updateMarkers() {
        if (!this.map || !this.markerLayer) return;
        
        console.log('MapModule: Updating markers based on current filters...');
        
        const currentFilters = this.core.getAllFilters();
        const filteredDepartmentData = this.core.applyFilters();
        
        // 獲取當前篩選的學校名單
        const visibleSchools = [...new Set(filteredDepartmentData.map(item => item['School Name']))];
        
        // 更新標記顯示
        this.markers.forEach(markerData => {
            const schoolName = markerData.schoolData['School Name'];
            const shouldShow = visibleSchools.includes(schoolName);
            
            if (shouldShow) {
                // 更新科系數量
                const newDepartmentCount = filteredDepartmentData.filter(item => 
                    item['School Name'] === schoolName
                ).length;
                
                markerData.departmentCount = newDepartmentCount;
                
                // 更新彈出窗內容
                const popupContent = this.createPopupContent(markerData.schoolData, newDepartmentCount);
                markerData.marker.setPopupContent(popupContent);
                
                // 顯示標記
                if (!this.markerLayer.hasLayer(markerData.marker)) {
                    this.markerLayer.addLayer(markerData.marker);
                }
            } else {
                // 隱藏標記
                if (this.markerLayer.hasLayer(markerData.marker)) {
                    this.markerLayer.removeLayer(markerData.marker);
                }
            }
        });
        
        console.log(`MapModule: Updated markers, showing ${visibleSchools.length} schools`);
    }

    // 更新標記顯示（初始載入時使用）
    updateMarkersDisplay() {
        if (!this.markerLayer) return;
        
        this.markers.forEach(markerData => {
            this.markerLayer.addLayer(markerData.marker);
        });
    }

    // 清除所有標記
    clearMarkers() {
        if (this.markerLayer) {
            this.markerLayer.clearLayers();
        }
        this.markers = [];
        console.log('MapModule: All markers cleared');
    }

    // 複製到剪貼板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('✅ 學校網址已複製到剪貼板');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // 備用方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('✅ 學校網址已複製到剪貼板');
        }
    }

    // 顯示提示
    showToast(message, duration = 3000) {
        // 檢查是否已有 toast
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

    // 縮放到所有標記
    fitToMarkers() {
        if (!this.map || this.markers.length === 0) return;
        
        const visibleMarkers = this.markers.filter(markerData => 
            this.markerLayer.hasLayer(markerData.marker)
        );
        
        if (visibleMarkers.length === 0) return;
        
        const group = new L.featureGroup(visibleMarkers.map(m => m.marker));
        this.map.fitBounds(group.getBounds(), {
            padding: [20, 20]
        });
        
        console.log('MapModule: Fitted map to', visibleMarkers.length, 'visible markers');
    }

    // 縮放到特定學校
    focusOnSchool(schoolName) {
        const schoolMarker = this.markers.find(markerData => 
            markerData.schoolData['School Name'] === schoolName
        );
        
        if (schoolMarker && this.markerLayer.hasLayer(schoolMarker.marker)) {
            const marker = schoolMarker.marker;
            this.map.setView(marker.getLatLng(), 12);
            marker.openPopup();
            
            console.log('MapModule: Focused on school:', schoolName);
        }
    }

    // 獲取地圖狀態
    getMapStatus() {
        if (!this.map) return null;
        
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
            totalMarkers: this.markers.length,
            visibleMarkers: this.markers.filter(m => this.markerLayer.hasLayer(m.marker)).length
        };
    }

    // 重新載入地圖
    reload() {
        if (this.core.schoolData) {
            this.loadSchoolMarkers(this.core.schoolData);
            this.updateMarkers();
        }
    }

    // 銷毀
    destroy() {
        this.clearMarkers();
        
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        this.markerLayer = null;
        this.isInitialized = false;
        
        console.log('MapModule: Destroyed');
    }
}

// 匯出模塊
window.MapModule = MapModule;