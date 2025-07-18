// 科系查詢功能 - 獨立於DataTable的查詢系統
class DepartmentSearch {
    constructor() {
        this.allData = [];
        this.filteredData = [];
        this.searchInput = null;
        this.clearBtn = null;
        this.searchInfo = null;
        this.dataTable = null;

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.searchInput = document.getElementById('department-search');
            this.clearBtn = document.getElementById('clear-search');
            this.searchInfo = document.getElementById('search-results-info');

            if (this.searchInput && this.clearBtn && this.searchInfo) {
                this.bindEvents();
            }
        });
    }

    bindEvents() {
        // 即時搜尋
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // 清除搜尋
        this.clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // Enter鍵搜尋
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(this.searchInput.value);
            }
        });
    }

    // 設置資料源
    setData(data) {
        this.allData = data;
        this.filteredData = [...data];
    }

    // 設置DataTable實例
    setDataTable(table) {
        this.dataTable = table;
    }

    // 執行搜尋
    performSearch(query) {
        if (!query.trim()) {
            this.showAllResults();
            return;
        }

        const searchTerm = query.toLowerCase().trim();

        // 在所有資料中搜尋科系名稱
        this.filteredData = this.allData.filter(item => {
            return item.科系名稱 && item.科系名稱.toLowerCase().includes(searchTerm);
        });

        this.updateSearchInfo(query, this.filteredData.length);
        this.updateTable();
    }

    // 顯示所有結果
    showAllResults() {
        this.filteredData = [...this.allData];
        this.updateSearchInfo('', this.allData.length);
        this.updateTable();
    }

    // 清除搜尋
    clearSearch() {
        this.searchInput.value = '';
        this.showAllResults();
    }

    // 更新搜尋資訊顯示
    updateSearchInfo(query, resultCount) {
        if (!query.trim()) {
            this.searchInfo.textContent = `顯示全部 ${this.allData.length} 筆科系資料`;
        } else {
            this.searchInfo.textContent = `搜尋 "${query}" 找到 ${resultCount} 筆結果`;
        }
    }

    // 更新表格顯示
    updateTable() {
        if (this.dataTable) {
            // 清除現有資料
            this.dataTable.clear();

            // 添加篩選後的資料
            this.filteredData.forEach((item, index) => {
                const rowData = [
                    `<input type="checkbox" class="row-checkbox" data-index="${index}">`,
                    item.國家 || '',
                    item.學校名稱 || '',
                    item.科系名稱 || '',
                    item.網址 ? `<a href="${item.網址}" target="_blank">查看網站</a>` : '',
                    `<button class="btn-detail" onclick="showDetails(${index})">詳細</button>`
                ];
                this.dataTable.row.add(rowData);
            });

            // 重繪表格
            this.dataTable.draw();
        }
    }

    // 獲取當前篩選的資料
    getFilteredData() {
        return this.filteredData;
    }

    // 根據其他篩選條件進一步篩選
    applyAdditionalFilters(countryFilter, schoolFilter, degreeFilter) {
        let filtered = [...this.allData];

        // 應用科系搜尋
        const searchQuery = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.科系名稱 && item.科系名稱.toLowerCase().includes(searchQuery)
            );
        }

        // 應用國家篩選
        if (countryFilter && countryFilter.length > 0) {
            filtered = filtered.filter(item => countryFilter.includes(item.國家));
        }

        // 應用學校篩選
        if (schoolFilter && schoolFilter.length > 0) {
            filtered = filtered.filter(item => schoolFilter.includes(item.學校名稱));
        }

        // 應用學位篩選
        if (degreeFilter && degreeFilter.length > 0) {
            filtered = filtered.filter(item => {
                return degreeFilter.some(degree =>
                    item.科系名稱 && item.科系名稱.toLowerCase().includes(degree.toLowerCase())
                );
            });
        }

        this.filteredData = filtered;
        this.updateSearchInfo(searchQuery, filtered.length);
        this.updateTable();
    }
}

// 創建全域實例
window.departmentSearch = new DepartmentSearch();

// 顯示詳細資訊的函數
function showDetails(index) {
    const data = window.departmentSearch.getFilteredData()[index];
    if (data) {
        const details = `
      學校: ${data.學校名稱 || '無資料'}
      國家: ${data.國家 || '無資料'}
      科系: ${data.科系名稱 || '無資料'}
      網址: ${data.網址 || '無資料'}
    `;
        alert(details);
    }
}
document.addEventListener('DOMContentLoaded', function () {
    let allData = [];
    let currentDisplayedData = [];

    // 初始化科系查詢功能
    function initDepartmentSearch() {
        const searchInput = document.getElementById('department-search');
        const clearBtn = document.getElementById('clear-search');
        const searchInfo = document.getElementById('search-results-info');

        if (!searchInput || !clearBtn || !searchInfo) return;

        // 即時搜尋功能
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.trim().toLowerCase();
            performDepartmentSearch(searchTerm);
        });

        // 清除搜尋
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            performDepartmentSearch('');
            searchInput.focus();
        });

        // Enter鍵搜尋
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim().toLowerCase();
                performDepartmentSearch(searchTerm);
            }
        });
    }

    // 執行科系搜尋
    function performDepartmentSearch(searchTerm) {
        const searchInfo = document.getElementById('search-results-info');

        if (!searchTerm) {
            // 清除搜尋，顯示所有資料
            if (window.dataTable) {
                window.dataTable.search('').draw();
                searchInfo.textContent = '';
            }
            return;
        }

        if (window.dataTable) {
            // 使用DataTable的搜尋功能，但只針對科系名稱欄位（第3欄）
            window.dataTable.column(3).search(searchTerm).draw();

            // 顯示搜尋結果資訊
            const filteredCount = window.dataTable.rows({ search: 'applied' }).count();
            const totalCount = window.dataTable.rows().count();

            if (filteredCount === 0) {
                searchInfo.innerHTML = `<span style="color: var(--error-color, #ef4444);">未找到包含 "${searchTerm}" 的科系</span>`;
            } else {
                searchInfo.innerHTML = `找到 <strong>${filteredCount}</strong> 個包含 "${searchTerm}" 的科系 (共 ${totalCount} 個科系)`;
            }
        }
    }

    // 監聽DataTable初始化完成事件
    document.addEventListener('dataTableReady', function () {
        initDepartmentSearch();
    });

    // 如果DataTable已經存在，直接初始化
    if (window.dataTable) {
        initDepartmentSearch();
    }

    // 公開搜尋函數供外部使用
    window.performDepartmentSearch = performDepartmentSearch;
});
