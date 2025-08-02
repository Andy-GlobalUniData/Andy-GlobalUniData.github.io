/**
 * 學校資料模塊 - School Module
 * 負責學校資料的顯示和管理
 */

class SchoolModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.schoolDataTable = null;
        this.isInitialized = false;
        
        console.log('SchoolModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('school', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        this.core.on('dataLoaded', (e) => this.processSchoolData(e.detail.schoolData));
        this.core.on('filterChanged', (e) => this.updateSchoolTable());
        
        console.log('SchoolModule: Event listeners registered');
    }

    setup() {
        if (this.isInitialized) return;
        
        console.log('SchoolModule: Setting up...');
        
        this.initSchoolDataTable();
        this.processSchoolData(this.core.schoolData);
        
        this.isInitialized = true;
        console.log('SchoolModule: Setup complete');
    }

    // 初始化學校數據表格
    initSchoolDataTable() {
        const tableElement = document.getElementById('school-data-table');
        if (!tableElement) {
            console.error('SchoolModule: School data table element not found');
            return;
        }

        console.log('SchoolModule: Initializing school data table...');

        this.schoolDataTable = $('#school-data-table').DataTable({
            data: [],
            columns: [
                { 
                    title: "學校名稱", 
                    data: "School Name",
                    render: (data, type, row) => {
                        const url = row['School URL'];
                        if (url && url !== 'N/A' && url.trim() !== '') {
                            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="school-link">${data}</a>`;
                        }
                        return data;
                    }
                },
                { title: "國家", data: "Country" },
                { title: "城市", data: "City" },
                { 
                    title: "科系數量", 
                    data: "Department Count",
                    className: "text-center"
                },
                { 
                    title: "合作集團", 
                    data: "Group",
                    render: (data) => data || 'N/A'
                },
                {
                    title: "學校網址",
                    data: "School URL",
                    render: (data) => {
                        if (!data || data === 'N/A' || data.trim() === '') {
                            return '<span class="text-muted">N/A</span>';
                        }
                        const displayUrl = data.length > 40 ? data.substring(0, 40) + '...' : data;
                        return `
                            <div class="url-cell">
                                <a href="${data}" target="_blank" rel="noopener noreferrer" class="school-url">${displayUrl}</a>
                                <button class="copy-url-btn" data-url="${data}" title="複製網址">
                                    <span class="btn-icon">📋</span>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            pageLength: 15,
            lengthMenu: [[10, 15, 25, 50, -1], [10, 15, 25, 50, "全部"]],
            language: {
                lengthMenu: "顯示 _MENU_ 筆資料",
                zeroRecords: "找不到符合條件的學校",
                info: "顯示第 _START_ 到 _END_ 筆資料，共 _TOTAL_ 筆學校",
                infoEmpty: "沒有學校資料",
                infoFiltered: "(從 _MAX_ 筆學校中篩選)",
                search: "搜尋學校:",
                paginate: {
                    first: "第一頁",
                    last: "最後一頁",
                    next: "下一頁",
                    previous: "上一頁"
                }
            },
            dom: '<"table-controls"<"table-controls-left"l><"table-controls-right"f>>rtip',
            order: [[3, 'desc']], // 按科系數量降序排列
            drawCallback: () => {
                this.setupSchoolTableEventListeners();
            }
        });

        console.log('SchoolModule: School data table initialized successfully');
    }

    // 處理學校數據
    processSchoolData(schoolData) {
        if (!schoolData || !Array.isArray(schoolData)) {
            console.error('SchoolModule: Invalid school data');
            return;
        }

        console.log('SchoolModule: Processing school data...');

        // 計算每個學校的科系數量
        const departmentCounts = {};
        this.core.data.forEach(item => {
            const schoolName = item['School Name'];
            if (schoolName) {
                departmentCounts[schoolName] = (departmentCounts[schoolName] || 0) + 1;
            }
        });

        // 合併學校數據和科系數量
        const processedSchoolData = schoolData.map(school => ({
            ...school,
            'Department Count': departmentCounts[school['School Name']] || 0
        }));

        // 更新表格
        if (this.schoolDataTable) {
            this.schoolDataTable.clear().rows.add(processedSchoolData).draw();
        }

        console.log('SchoolModule: School data processed, total schools:', processedSchoolData.length);
    }

    // 設置學校表格事件監聽器
    setupSchoolTableEventListeners() {
        // 複製學校 URL 按鈕
        $('.copy-url-btn').off('click').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const url = $(e.currentTarget).data('url');
            this.copyToClipboard(url);
        });

        // 學校名稱點擊篩選
        $('.school-link').off('click').on('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd + 點擊時篩選該學校
                e.preventDefault();
                const schoolName = $(e.currentTarget).text();
                this.filterBySchool(schoolName);
            }
        });
    }

    // 根據學校篩選
    filterBySchool(schoolName) {
        console.log('SchoolModule: Filtering by school:', schoolName);
        
        // 更新學校篩選器
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

    // 更新學校表格（根據當前篩選器）
    updateSchoolTable() {
        if (!this.schoolDataTable) return;
        
        const currentFilters = this.core.getAllFilters();
        let filteredSchoolData = [...this.core.schoolData];
        
        // 根據國家篩選學校
        if (currentFilters.countries.length > 0) {
            filteredSchoolData = filteredSchoolData.filter(school => 
                currentFilters.countries.includes(school.Country)
            );
        }
        
        // 重新計算科系數量（基於當前篩選的科系數據）
        const filteredDepartmentData = this.core.applyFilters();
        const departmentCounts = {};
        
        filteredDepartmentData.forEach(item => {
            const schoolName = item['School Name'];
            if (schoolName) {
                departmentCounts[schoolName] = (departmentCounts[schoolName] || 0) + 1;
            }
        });
        
        // 更新學校數據的科系數量，並過濾掉沒有科系的學校
        const processedSchoolData = filteredSchoolData
            .map(school => ({
                ...school,
                'Department Count': departmentCounts[school['School Name']] || 0
            }))
            .filter(school => school['Department Count'] > 0);
        
        this.schoolDataTable.clear().rows.add(processedSchoolData).draw();
        
        console.log('SchoolModule: Updated school table with', processedSchoolData.length, 'schools');
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
        let toast = document.getElementById('school-toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'school-toast-message';
            toast.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: var(--secondary-color);
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

    // 獲取當前顯示的學校數據
    getCurrentSchoolData() {
        if (!this.schoolDataTable) return [];
        return this.schoolDataTable.data().toArray();
    }

    // 搜尋學校
    searchSchools(query) {
        if (!this.schoolDataTable) return;
        
        this.schoolDataTable.search(query).draw();
        
        const resultsCount = this.schoolDataTable.rows({ search: 'applied' }).count();
        console.log(`SchoolModule: School search for "${query}" returned ${resultsCount} results`);
    }

    // 重新載入學校數據
    reload() {
        this.processSchoolData(this.core.schoolData);
        this.updateSchoolTable();
    }

    // 獲取學校統計信息
    getSchoolStats() {
        const currentData = this.getCurrentSchoolData();
        
        const stats = {
            totalSchools: currentData.length,
            totalDepartments: currentData.reduce((sum, school) => sum + (school['Department Count'] || 0), 0),
            countriesCount: [...new Set(currentData.map(school => school.Country))].length,
            citiesCount: [...new Set(currentData.map(school => school.City))].length
        };
        
        return stats;
    }

    // 銷毀
    destroy() {
        if (this.schoolDataTable) {
            this.schoolDataTable.destroy();
            this.schoolDataTable = null;
        }
        
        this.isInitialized = false;
        
        console.log('SchoolModule: Destroyed');
    }
}

// 匯出模塊
window.SchoolModule = SchoolModule;
