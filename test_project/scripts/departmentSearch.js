// 科系查詢功能 - 修正版本，配合實際數據結構
class DepartmentSearch {
    constructor() {
        this.isInitialized = false;
        this.searchInput = null;
        this.clearBtn = null;
        this.searchInfo = null;
        this.originalSearchFunction = null;

        console.log('DepartmentSearch: 建構子被調用');
        this.init();
    }

    init() {
        // 如果已經初始化過，直接返回
        if (this.isInitialized) {
            console.log('DepartmentSearch: 已經初始化過，跳過重複初始化');
            return;
        }

        const initSearch = () => {
            console.log('DepartmentSearch: 開始初始化');
            this.searchInput = document.getElementById('department-search');
            this.clearBtn = document.getElementById('clear-search');
            this.searchInfo = document.getElementById('search-results-info');

            if (this.searchInput && this.clearBtn && this.searchInfo) {
                console.log('DepartmentSearch: 找到所有必要元素，綁定事件');
                this.bindEvents();
                this.isInitialized = true;

                // 檢查 DataTable 是否已經準備好
                this.waitForDataTable();
            } else {
                console.log('DepartmentSearch: 缺少必要元素', {
                    searchInput: !!this.searchInput,
                    clearBtn: !!this.clearBtn,
                    searchInfo: !!this.searchInfo
                });
            }
        };

        // 監聽 DataTable 準備完成事件
        document.addEventListener('dataTableReady', () => {
            console.log('DepartmentSearch: 收到 DataTable 準備完成事件');
            this.waitForDataTable();
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSearch);
        } else {
            initSearch();
        }
    }

    waitForDataTable() {
        // 等待 DataTable 準備好
        const checkDataTable = () => {
            if (window.dataTable && window.dataTable.search) {
                console.log('DepartmentSearch: DataTable 已準備好');
                this.setupSearch();
            } else {
                console.log('DepartmentSearch: 等待 DataTable...');
                setTimeout(checkDataTable, 100);
            }
        };
        checkDataTable();
    }

    bindEvents() {
        // 即時搜尋 - 使用防抖動技術
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300); // 300ms 延遲
        });

        // 清除搜尋
        this.clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // Enter鍵搜尋
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                this.performSearch(this.searchInput.value);
            }
        });

        console.log('DepartmentSearch: 事件綁定完成');
    }

    setupSearch() {
        // 保存原始的搜尋功能（如果存在）
        if (window.dataTable && window.dataTable.search) {
            this.originalSearchFunction = window.dataTable.search.bind(window.dataTable);
        }

        // 添加自定義搜尋功能到 DataTable
        if (window.dataTable && $.fn.dataTable) {
            $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
                // 如果沒有科系搜尋詞，顯示所有行
                const searchTerm = this.getCurrentSearchTerm().toLowerCase();
                if (!searchTerm) {
                    return true;
                }

                // 獲取科系名稱（第4欄，索引3）
                const departmentName = data[3] || '';

                // 執行不區分大小寫的搜尋
                return departmentName.toLowerCase().includes(searchTerm);
            });
        }
    }

    // 執行搜尋
    performSearch(query) {
        console.log('DepartmentSearch: 執行搜尋:', query);

        if (!window.dataTable) {
            console.log('DepartmentSearch: DataTable 尚未準備好');
            this.updateSearchInfo(query, 0, 0);
            return;
        }

        const searchTerm = query.trim();

        try {
            // 清除 DataTable 內建搜尋
            window.dataTable.search('').columns().search('');

            // 觸發重繪，自定義搜尋函數會自動應用
            window.dataTable.draw();

            // 更新搜尋結果資訊
            setTimeout(() => {
                const filteredCount = window.dataTable.rows({ search: 'applied' }).count();
                const totalCount = window.dataTable.rows().count();
                console.log('DepartmentSearch: 搜尋結果', {
                    searchTerm,
                    filteredCount,
                    totalCount
                });
                this.updateSearchInfo(searchTerm, filteredCount, totalCount);
            }, 50);

        } catch (error) {
            console.error('DepartmentSearch: 搜尋過程中出現錯誤:', error);
            this.updateSearchInfo(searchTerm, 0, 0);
        }
    }

    // 清除搜尋
    clearSearch() {
        console.log('DepartmentSearch: 清除搜尋');
        this.searchInput.value = '';
        this.performSearch('');
        this.searchInput.focus();
    }

    // 更新搜尋資訊顯示
    updateSearchInfo(query, resultCount, totalCount) {
        if (!this.searchInfo) return;

        if (!query.trim()) {
            this.searchInfo.innerHTML = `<span style="color: var(--text-secondary, #6b7280);">顯示全部 ${totalCount} 筆科系資料</span>`;
        } else {
            if (resultCount === 0) {
                this.searchInfo.innerHTML = `<span style="color: var(--error-color, #ef4444);">❌ 未找到包含 "<strong>${query}</strong>" 的科系</span>`;
            } else {
                this.searchInfo.innerHTML = `<span style="color: var(--success-color, #10b981);">✅ 找到 <strong>${resultCount}</strong> 個包含 "<strong>${query}</strong>" 的科系 (共 ${totalCount} 個科系)</span>`;
            }
        }
    }

    // 獲取當前搜尋詞
    getCurrentSearchTerm() {
        return this.searchInput ? this.searchInput.value.trim() : '';
    }

    // 檢查是否有搜尋條件
    hasActiveSearch() {
        return this.getCurrentSearchTerm().length > 0;
    }
}

// 確保只創建一個實例
if (!window.departmentSearch) {
    console.log('DepartmentSearch: 創建新實例');
    window.departmentSearch = new DepartmentSearch();
} else {
    console.log('DepartmentSearch: 使用現有實例');
}

// 搜尋除錯工具
window.searchDebug = {
    checkDataTable: () => {
        console.log('DataTable 狀態:', {
            exists: !!window.dataTable,
            hasSearch: !!(window.dataTable && window.dataTable.search),
            rowCount: window.dataTable ? window.dataTable.rows().count() : 0
        });
    },

    testSearch: (term) => {
        if (window.departmentSearch) {
            window.departmentSearch.performSearch(term);
        } else {
            console.log('departmentSearch 實例不存在');
        }
    },

    checkElements: () => {
        console.log('頁面元素狀態:', {
            searchInput: !!document.getElementById('department-search'),
            clearBtn: !!document.getElementById('clear-search'),
            searchInfo: !!document.getElementById('search-results-info')
        });
    }
};

console.log('DepartmentSearch: 腳本載入完成');
console.log('可用的除錯指令: window.searchDebug.checkDataTable(), window.searchDebug.testSearch("computer"), window.searchDebug.checkElements()');
