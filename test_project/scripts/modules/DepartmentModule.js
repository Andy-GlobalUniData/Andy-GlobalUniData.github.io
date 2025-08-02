/**
 * 科系資料模塊 - Department Module
 * 負責科系資料的顯示、搜索和操作
 */

class DepartmentModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.dataTable = null;
        this.selectedRowURLs = [];
        this.isInitialized = false;
        
        console.log('DepartmentModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('department', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        this.core.on('dataFiltered', (e) => this.updateTable(e.detail.filteredData));
        this.core.on('searchCompleted', (e) => this.handleSearchResults(e.detail));
        
        console.log('DepartmentModule: Event listeners registered');
    }

    setup() {
        if (this.isInitialized) return;
        
        console.log('DepartmentModule: Setting up...');
        
        this.initDataTable();
        this.setupSearchFunctionality();
        this.setupExportFunctionality();
        
        this.isInitialized = true;
        console.log('DepartmentModule: Setup complete');
    }

    // 初始化 DataTable
    initDataTable() {
        const tableElement = document.getElementById('json-table');
        if (!tableElement) {
            console.error('DepartmentModule: Table element not found');
            return;
        }

        console.log('DepartmentModule: Initializing DataTable...');

        this.dataTable = $('#json-table').DataTable({
            data: this.core.data,
            columns: [
                {
                    title: "選擇",
                    data: null,
                    orderable: false,
                    render: (data, type, row) => {
                        const url = row.URL || '';
                        const isSelected = this.selectedRowURLs.includes(url);
                        return `<input type="checkbox" class="row-select-checkbox" data-url="${url}" ${isSelected ? 'checked' : ''}>`;
                    }
                },
                { title: "國家", data: "Country" },
                { title: "學校名稱", data: "School Name" },
                { title: "科系名稱", data: "Department Name" },
                { title: "學位等級", data: "Degree Level" },
                {
                    title: "網址",
                    data: "URL",
                    render: (data) => {
                        if (!data) return 'N/A';
                        const displayUrl = data.length > 50 ? data.substring(0, 50) + '...' : data;
                        return `<a href="${data}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
                    }
                },
                {
                    title: "操作",
                    data: null,
                    orderable: false,
                    render: (data, type, row) => {
                        const url = row.URL || '';
                        return `
                            <button class="copy-btn secondary-btn" data-url="${url}" title="複製網址">
                                <span class="btn-icon">📋</span>
                                Copy URL
                            </button>
                        `;
                    }
                }
            ],
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "全部"]],
            language: {
                lengthMenu: "顯示 _MENU_ 筆資料",
                zeroRecords: "找不到符合條件的資料",
                info: "顯示第 _START_ 到 _END_ 筆資料，共 _TOTAL_ 筆",
                infoEmpty: "沒有資料",
                infoFiltered: "(從 _MAX_ 筆資料中篩選)",
                search: "搜尋:",
                paginate: {
                    first: "第一頁",
                    last: "最後一頁",
                    next: "下一頁",
                    previous: "上一頁"
                }
            },
            dom: '<"table-controls"<"table-controls-left"l><"table-controls-right"f>>rtip',
            order: [[1, 'asc']],
            drawCallback: () => {
                this.setupTableEventListeners();
            }
        });

        console.log('DepartmentModule: DataTable initialized successfully');
    }

    // 設置表格事件監聽器
    setupTableEventListeners() {
        // 複製 URL 按鈕
        $('.copy-btn').off('click').on('click', (e) => {
            const url = $(e.currentTarget).data('url');
            this.copyToClipboard(url);
        });

        // 行選擇 checkbox
        $('.row-select-checkbox').off('change').on('change', (e) => {
            const url = $(e.currentTarget).data('url');
            if (e.target.checked) {
                if (!this.selectedRowURLs.includes(url)) {
                    this.selectedRowURLs.push(url);
                }
            } else {
                const index = this.selectedRowURLs.indexOf(url);
                if (index > -1) {
                    this.selectedRowURLs.splice(index, 1);
                }
            }
            
            this.updateSelectionInfo();
        });
    }

    // 更新表格數據
    updateTable(data) {
        if (!this.dataTable) return;
        
        console.log('DepartmentModule: Updating table with', data.length, 'rows');
        this.dataTable.clear().rows.add(data).draw();
    }

    // 設置搜索功能
    setupSearchFunctionality() {
        const searchInput = document.getElementById('department-search');
        const clearButton = document.getElementById('clear-search');
        const searchInfo = document.getElementById('search-results-info');

        if (!searchInput || !clearButton) {
            console.warn('DepartmentModule: Search elements not found');
            return;
        }

        // 搜索輸入
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query) {
                    this.performSearch(query);
                } else {
                    this.clearSearch();
                }
            }, 300);
        });

        // 清除搜索
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            this.clearSearch();
        });

        console.log('DepartmentModule: Search functionality setup complete');
    }

    // 執行搜索
    performSearch(query) {
        const results = this.core.searchData(query, ['Department Name', 'School Name']);
        
        // 更新搜索信息
        const searchInfo = document.getElementById('search-results-info');
        if (searchInfo) {
            searchInfo.innerHTML = `
                <div class="search-results">
                    <span class="search-icon">🔍</span>
                    找到 <strong>${results.length}</strong> 筆包含 "<strong>${query}</strong>" 的資料
                </div>
            `;
        }
        
        this.updateTable(results);
    }

    // 清除搜索
    clearSearch() {
        const searchInfo = document.getElementById('search-results-info');
        if (searchInfo) {
            searchInfo.innerHTML = '';
        }
        
        this.updateTable(this.core.applyFilters());
    }

    // 處理搜索結果
    handleSearchResults(detail) {
        const { query, results, totalResults } = detail;
        console.log(`DepartmentModule: Search completed for "${query}", found ${totalResults} results`);
    }

    // 設置匯出功能
    setupExportFunctionality() {
        // 這部分將在 ExportModule 中處理，這裡只是預留接口
        console.log('DepartmentModule: Export functionality will be handled by ExportModule');
    }

    // 複製到剪貼板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('✅ 網址已複製到剪貼板');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // 備用方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('✅ 網址已複製到剪貼板');
        }
    }

    // 顯示提示
    showToast(message, duration = 3000) {
        // 檢查是否已有 toast
        let toast = document.getElementById('toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-message';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-color);
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

    // 更新選擇信息
    updateSelectionInfo() {
        console.log(`DepartmentModule: ${this.selectedRowURLs.length} rows selected`);
        
        // 觸發選擇更新事件
        this.core.emit('selectionChanged', {
            selectedCount: this.selectedRowURLs.length,
            selectedURLs: [...this.selectedRowURLs]
        });
    }

    // 獲取選中的數據
    getSelectedData() {
        if (!this.dataTable) return [];
        
        const allData = this.dataTable.data().toArray();
        return allData.filter(row => this.selectedRowURLs.includes(row.URL));
    }

    // 獲取當前顯示的數據
    getCurrentData() {
        if (!this.dataTable) return [];
        return this.dataTable.data().toArray();
    }

    // 重新載入數據
    reload() {
        if (!this.dataTable) return;
        
        const filteredData = this.core.applyFilters();
        this.updateTable(filteredData);
    }

    // 清除選擇
    clearSelection() {
        this.selectedRowURLs = [];
        if (this.dataTable) {
            $('.row-select-checkbox').prop('checked', false);
        }
        this.updateSelectionInfo();
    }

    // 全選當前頁面
    selectAllVisible() {
        if (!this.dataTable) return;
        
        const visibleData = this.dataTable.rows({ page: 'current' }).data().toArray();
        visibleData.forEach(row => {
            if (row.URL && !this.selectedRowURLs.includes(row.URL)) {
                this.selectedRowURLs.push(row.URL);
            }
        });
        
        $('.row-select-checkbox').prop('checked', true);
        this.updateSelectionInfo();
    }

    // 銷毀
    destroy() {
        if (this.dataTable) {
            this.dataTable.destroy();
            this.dataTable = null;
        }
        
        this.selectedRowURLs = [];
        this.isInitialized = false;
        
        console.log('DepartmentModule: Destroyed');
    }
}

// 匯出模塊
window.DepartmentModule = DepartmentModule;
