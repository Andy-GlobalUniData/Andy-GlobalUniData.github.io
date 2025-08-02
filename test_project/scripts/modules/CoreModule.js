/**
 * 核心模塊 - Core Module
 * 負責數據管理、篩選器和全局狀態管理
 */

class CoreModule {
    constructor() {
        this.data = [];
        this.schoolData = [];
        this.degreeData = {};
        this.filters = {
            countries: [],
            schools: [],
            degrees: ['No Filter']
        };
        this.eventBus = new EventTarget();
        
        // 模塊註冊表
        this.modules = new Map();
        
        console.log('CoreModule: Initialized');
    }

    // 模塊註冊系統
    registerModule(name, moduleInstance) {
        this.modules.set(name, moduleInstance);
        console.log(`CoreModule: Registered module '${name}'`);
    }

    getModule(name) {
        return this.modules.get(name);
    }

    // 事件系統
    emit(eventType, data = {}) {
        const event = new CustomEvent(eventType, { detail: data });
        this.eventBus.dispatchEvent(event);
        console.log(`CoreModule: Emitted event '${eventType}'`, data);
    }

    on(eventType, callback) {
        this.eventBus.addEventListener(eventType, callback);
    }

    off(eventType, callback) {
        this.eventBus.removeEventListener(eventType, callback);
    }

    // 數據載入
    async loadData() {
        try {
            console.log('CoreModule: Loading core data...');
            
            // 載入主要數據
            const dataResponse = await fetch('data/data.json');
            if (!dataResponse.ok) {
                throw new Error(`Failed to load data.json: ${dataResponse.status}`);
            }
            this.data = await dataResponse.json();
            
            // 載入學校數據
            const schoolResponse = await fetch('data/School_data.json');
            if (!schoolResponse.ok) {
                throw new Error(`Failed to load School_data.json: ${schoolResponse.status}`);
            }
            this.schoolData = await schoolResponse.json();
            
            // 載入學位數據
            const degreeResponse = await fetch('data/Degree_data.json');
            if (!degreeResponse.ok) {
                throw new Error(`Failed to load Degree_data.json: ${degreeResponse.status}`);
            }
            this.degreeData = await degreeResponse.json();
            
            console.log('CoreModule: All data loaded successfully');
            this.emit('dataLoaded', {
                data: this.data,
                schoolData: this.schoolData,
                degreeData: this.degreeData
            });
            
            return true;
        } catch (error) {
            console.error('CoreModule: Failed to load data:', error);
            this.emit('dataLoadError', { error });
            return false;
        }
    }

    // 篩選器管理
    setFilter(type, values) {
        if (!Array.isArray(values)) {
            values = [values];
        }
        
        this.filters[type] = values;
        console.log(`CoreModule: Updated ${type} filter:`, values);
        
        this.emit('filterChanged', {
            type,
            values,
            allFilters: { ...this.filters }
        });
    }

    getFilter(type) {
        return this.filters[type] || [];
    }

    getAllFilters() {
        return { ...this.filters };
    }

    // 應用篩選
    applyFilters() {
        let filteredData = [...this.data];
        
        // 國家篩選
        if (this.filters.countries.length > 0) {
            filteredData = filteredData.filter(item => 
                this.filters.countries.includes(item.Country)
            );
        }
        
        // 學校篩選
        if (this.filters.schools.length > 0) {
            filteredData = filteredData.filter(item => 
                this.filters.schools.includes(item['School Name'])
            );
        }
        
        // 學位篩選
        if (!this.filters.degrees.includes('No Filter') && this.filters.degrees.length > 0) {
            filteredData = filteredData.filter(item => 
                this.filters.degrees.includes(item['Degree Level'])
            );
        }
        
        this.emit('dataFiltered', { filteredData });
        return filteredData;
    }

    // 獲取唯一值
    getUniqueValues(field) {
        return [...new Set(this.data.map(item => item[field]))].sort();
    }

    // 搜尋功能
    searchData(query, fields = ['Department Name']) {
        if (!query || query.trim() === '') {
            return this.applyFilters();
        }
        
        const searchTerm = query.toLowerCase().trim();
        const filteredData = this.applyFilters();
        
        const searchResults = filteredData.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });
        
        this.emit('searchCompleted', { 
            query, 
            results: searchResults,
            totalResults: searchResults.length 
        });
        
        return searchResults;
    }

    // 初始化
    async init() {
        console.log('CoreModule: Initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAfterDOM());
        } else {
            this.setupAfterDOM();
        }
    }

    async setupAfterDOM() {
        console.log('CoreModule: DOM ready, setting up...');
        
        // 載入數據
        const dataLoaded = await this.loadData();
        if (!dataLoaded) {
            console.error('CoreModule: Failed to initialize due to data loading error');
            return;
        }
        
        // 初始化篩選器UI
        this.initFilterUI();
        
        console.log('CoreModule: Setup complete');
        this.emit('coreReady');
    }

    // 初始化篩選器UI
    initFilterUI() {
        this.initCountryFilter();
        this.initSchoolFilter();
        this.initDegreeFilter();
    }

    initCountryFilter() {
        const container = document.getElementById('country-selector-content');
        if (!container) return;

        const countries = this.getUniqueValues('Country');
        
        const html = `
            <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                <label><input type="checkbox" id="select-all-countries" checked> <strong>全選國家</strong></label>
            </div>
            ${countries.map(country => `
                <div class="school-item">
                    <label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label>
                </div>
            `).join('')}
        `;
        
        container.innerHTML = html;
        
        // 事件監聽
        container.addEventListener('change', (e) => {
            this.handleCountryFilterChange(e);
        });
    }

    initSchoolFilter() {
        const container = document.getElementById('school-selector-content');
        if (!container) return;

        const schools = this.getUniqueValues('School Name');
        
        const html = `
            <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                <label><input type="checkbox" id="select-all-schools" checked> <strong>全選學校</strong></label>
            </div>
            ${schools.map(school => `
                <div class="school-item">
                    <label><input type="checkbox" class="school-checkbox" value="${school}" checked> ${school}</label>
                </div>
            `).join('')}
        `;
        
        container.innerHTML = html;
        
        // 事件監聽
        container.addEventListener('change', (e) => {
            this.handleSchoolFilterChange(e);
        });
    }

    initDegreeFilter() {
        const container = document.getElementById('degree-selector-content');
        if (!container) return;

        const degrees = Object.keys(this.degreeData);
        
        const html = `
            <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                <label><input type="checkbox" class="degree-checkbox" value="No Filter" checked> <strong>不篩選學位</strong></label>
            </div>
            ${degrees.map(degree => `
                <div class="school-item">
                    <label><input type="checkbox" class="degree-checkbox" value="${degree}"> ${degree}</label>
                </div>
            `).join('')}
        `;
        
        container.innerHTML = html;
        
        // 事件監聽
        container.addEventListener('change', (e) => {
            this.handleDegreeFilterChange(e);
        });
    }

    handleCountryFilterChange(e) {
        const selectAllCheckbox = document.getElementById('select-all-countries');
        const countryCheckboxes = document.querySelectorAll('.country-checkbox');
        
        if (e.target.id === 'select-all-countries') {
            // 全選/取消全選
            countryCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        } else if (e.target.classList.contains('country-checkbox')) {
            // 更新全選狀態
            const allChecked = Array.from(countryCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        }
        
        // 更新篩選器
        const selectedCountries = Array.from(countryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
            
        this.setFilter('countries', selectedCountries);
    }

    handleSchoolFilterChange(e) {
        const selectAllCheckbox = document.getElementById('select-all-schools');
        const schoolCheckboxes = document.querySelectorAll('.school-checkbox');
        
        if (e.target.id === 'select-all-schools') {
            schoolCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        } else if (e.target.classList.contains('school-checkbox')) {
            const allChecked = Array.from(schoolCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        }
        
        const selectedSchools = Array.from(schoolCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
            
        this.setFilter('schools', selectedSchools);
    }

    handleDegreeFilterChange(e) {
        if (!e.target.classList.contains('degree-checkbox')) return;
        
        const degreeCheckboxes = document.querySelectorAll('.degree-checkbox');
        const noFilterCheckbox = document.querySelector('.degree-checkbox[value="No Filter"]');
        
        if (e.target.value === 'No Filter') {
            if (e.target.checked) {
                // 選擇"不篩選學位"時，取消其他選項
                degreeCheckboxes.forEach(checkbox => {
                    if (checkbox.value !== 'No Filter') {
                        checkbox.checked = false;
                        checkbox.disabled = true;
                    }
                });
                this.setFilter('degrees', ['No Filter']);
            }
        } else {
            // 取消"不篩選學位"選項
            if (noFilterCheckbox) {
                noFilterCheckbox.checked = false;
            }
            
            // 啟用所有學位選項
            degreeCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            
            const selectedDegrees = Array.from(degreeCheckboxes)
                .filter(cb => cb.checked && cb.value !== 'No Filter')
                .map(cb => cb.value);
                
            this.setFilter('degrees', selectedDegrees);
        }
    }
}

// 全局實例
window.CoreModule = CoreModule;
window.coreModule = new CoreModule();
