/**
 * 全新的主系統控制器
 * 完全重寫，與新的學位篩選系統整合
 */

class DataManager {
    constructor() {
        this.dataTable = null;
        this.totalData = [];
        this.processedData = [];
        this.index = 0;
        this.chunkSize = 500;

        // 篩選狀態
        this.selectedCountries = [];
        this.selectedSchools = [];
        this.selectedDegrees = ['No Filter'];

        // 跨頁選擇追蹤
        this.selectedRowURLs = [];

        this.init();
    }

    init() {
        console.log('DataManager: Initializing...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAfterDOM());
        } else {
            this.setupAfterDOM();
        }
    }

    async setupAfterDOM() {
        console.log('DataManager: DOM ready, setting up...');

        // 等待學位篩選器就緒
        this.waitForDegreeFilter();

        // 載入數據
        await this.loadData();

        // 設置事件監聽器
        this.setupEventListeners();

        // 設置默認選擇
        this.setupDefaultSelections();

        console.log('DataManager: Setup complete');
    }

    waitForDegreeFilter() {
        // 監聽學位篩選器就緒事件
        window.addEventListener('degreeFilterReady', () => {
            console.log('DataManager: Degree filter is ready');
        });

        // 監聽學位篩選變更事件
        window.addEventListener('degreeFilterChanged', (event) => {
            this.selectedDegrees = event.detail.selectedDegrees;
            this.updateTableData();
        });
    }

    async loadData() {
        console.log('DataManager: Loading data...');

        try {
            const response = await fetch('data/data.json');
            const rawData = await response.json();

            // 載入學位分類數據
            const degreeResponse = await fetch('data/Degree_data.json');
            const degreeData = await degreeResponse.json();

            console.log('DataManager: Processing data with degree levels...');
            this.totalData = this.processDataWithDegreeLevel(rawData, degreeData);

            console.log('DataManager: Data processed, total items:', this.totalData.length);

            this.initializeDataTable();
            this.loadTableData();

        } catch (error) {
            console.error('DataManager: Failed to load data:', error);
            alert('數據載入失敗: ' + error.message);
        }
    }

    processDataWithDegreeLevel(rawData, degreeData) {
        console.log('DataManager: Processing degree levels for', rawData.length, 'items');

        // 創建學位關鍵字映射
        const degreeMapping = {};
        Object.keys(degreeData).forEach(degreeLevel => {
            degreeData[degreeLevel].forEach(keyword => {
                degreeMapping[keyword.toLowerCase()] = degreeLevel;
            });
        });

        return rawData.map((item, index) => {
            const departmentName = item["Department Name"] || "";
            let degreeLevel = "Other";

            const deptLower = departmentName.toLowerCase();

            // 智能學位等級識別
            if (deptLower.includes('phd') || deptLower.includes('ph.d') || deptLower.includes('doctoral')) {
                degreeLevel = "Doctoral Degrees / Ph.D.";
            } else if (deptLower.includes('msc') || deptLower.includes('m.sc') ||
                deptLower.includes('ma ') || deptLower.includes('m.a') ||
                deptLower.includes('mba') || deptLower.includes('m.b.a') ||
                deptLower.includes('med') || deptLower.includes('m.ed') ||
                deptLower.includes('meng') || deptLower.includes('m.eng') ||
                deptLower.includes('mfa') || deptLower.includes('m.f.a') ||
                deptLower.includes('llm') || deptLower.includes('ll.m') ||
                deptLower.includes('master') || deptLower.includes('graduate') ||
                deptLower.includes('postgraduate')) {
                degreeLevel = "Graduate / Master Degrees";
            } else if (deptLower.includes('bsc') || deptLower.includes('b.sc') ||
                deptLower.includes('ba ') || deptLower.includes('b.a') ||
                deptLower.includes('bba') || deptLower.includes('b.b.a') ||
                deptLower.includes('bed') || deptLower.includes('b.ed') ||
                deptLower.includes('beng') || deptLower.includes('b.eng') ||
                deptLower.includes('bfa') || deptLower.includes('b.f.a') ||
                deptLower.includes('llb') || deptLower.includes('ll.b') ||
                deptLower.includes('bachelor') || deptLower.includes('undergraduate') ||
                deptLower.includes('majors') || deptLower.includes('minors')) {
                degreeLevel = "Undergraduate / Bachelor";
            }

            if (index < 5) {
                console.log(`Sample ${index + 1}: "${departmentName}" -> ${degreeLevel}`);
            }

            return {
                ...item,
                "Degree Level": degreeLevel
            };
        });
    }

    initializeDataTable() {
        console.log('DataManager: Initializing DataTable...');

        // 銷毀現有表格
        if ($.fn.dataTable.isDataTable('#json-table')) {
            $('#json-table').DataTable().destroy();
        }

        this.dataTable = $("#json-table").DataTable({
            data: [],
            columns: [
                {
                    title: "<input type='checkbox' id='select-all'>",
                    orderable: false,
                    render: function () {
                        return '<input type="checkbox" class="row-checkbox">';
                    },
                },
                { title: "國家", data: 1 },
                { title: "學校名稱", data: 2 },
                { title: "科系名稱", data: 3 },
                { title: "學位等級", data: 4 },
                {
                    title: "網址",
                    data: 5,
                    defaultContent: "N/A",
                    render: function (data) {
                        if (!data || data === "N/A") return "N/A";
                        const displayText = data.length > 30 ? data.substring(0, 30) + "..." : data;
                        return `<a href="${data}" target="_blank">${displayText}</a>`;
                    },
                },
                {
                    title: "操作",
                    orderable: false,
                    render: function (data, type, row) {
                        const url = row[5] || "";
                        return url && url !== "N/A"
                            ? `<button class="copy-url-btn" data-url="${url}">Copy URL</button>`
                            : "N/A";
                    },
                },
            ],
            pageLength: 100,
            lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]],
            searching: true,
            destroy: true,
            language: {
                search: "搜尋科系：",
            },
            initComplete: function () {
                $('.dataTables_filter input').css({
                    'font-size': '18px',
                    'padding': '10px'
                });

                // 通知科系查詢功能 DataTable 已準備好
                console.log('DataTable 初始化完成，通知科系查詢功能');

                // 觸發自定義事件
                document.dispatchEvent(new Event('dataTableReady'));
            }
        });

        // 設為全局變量
        window.dataTable = this.dataTable;

        console.log('DataManager: DataTable initialized');
    }

    loadTableData() {
        console.log('DataManager: Loading table data...');
        this.index = 0;
        this.processedData = this.filterData();
        this.loadNextChunk();
    }

    filterData() {
        return this.totalData.filter(item => {
            const countryMatch = this.selectedCountries.length === 0 ||
                this.selectedCountries.includes(item["Country"]);
            const schoolMatch = this.selectedSchools.length === 0 ||
                this.selectedSchools.includes(item["School Name"]);
            const degreeMatch = this.selectedDegrees.includes("No Filter") ||
                this.selectedDegrees.includes(item["Degree Level"]);

            return countryMatch && schoolMatch && degreeMatch;
        });
    }

    loadNextChunk() {
        if (this.index >= this.processedData.length || !this.dataTable) return;

        const chunk = this.processedData.slice(this.index, this.index + this.chunkSize);
        this.index += this.chunkSize;

        const formattedData = chunk.map(item => [
            '<input type="checkbox" class="row-checkbox">',
            item["Country"] || "N/A",
            item["School Name"] || "N/A",
            item["Department Name"] || "N/A",
            item["Degree Level"] || "Other",
            item.URL || "N/A",
        ]);

        if (formattedData.length > 0) {
            this.dataTable.rows.add(formattedData).draw(false);
        }

        if (this.index < this.processedData.length) {
            setTimeout(() => this.loadNextChunk(), 10);
        }
    }

    updateTableData() {
        console.log('DataManager: Updating table data...');
        if (this.dataTable) {
            this.dataTable.clear();
            this.loadTableData();
        }
    }

    setupEventListeners() {
        console.log('DataManager: Setting up event listeners...');

        // 複製URL按鈕
        $(document).on("click", ".copy-url-btn", (event) => {
            const url = $(event.target).data("url");
            const row = $(event.target).closest("tr");
            const schoolName = row.find("td:nth-child(3)").text();
            const departmentName = row.find("td:nth-child(4)").text();
            const degreeLevel = row.find("td:nth-child(5)").text();

            navigator.clipboard.writeText(url).then(() => {
                alert(`URL已複製到剪貼簿！\\n\\n學校: ${schoolName}\\n科系: ${departmentName}\\n學位: ${degreeLevel}\\nURL: ${url}`);
            }).catch(err => {
                console.error("Failed to copy URL: ", err);
            });
        });

        // 行選擇追蹤
        $(document).on("change", ".row-checkbox", (event) => {
            const row = $(event.target).closest("tr");
            const url = row.find("td:nth-child(6) a").attr("href") || row.find("td:nth-child(6)").text();

            if (url && url !== "N/A") {
                if (event.target.checked) {
                    if (!this.selectedRowURLs.includes(url)) {
                        this.selectedRowURLs.push(url);
                    }
                } else {
                    this.selectedRowURLs = this.selectedRowURLs.filter(u => u !== url);
                }
            }
        });

        // 全選功能
        $(document).on("click", "#select-all", (event) => {
            const isChecked = event.target.checked;
            $(".row-checkbox").prop("checked", isChecked);

            if (isChecked) {
                // 添加所有當前頁面的URL到選擇列表
                this.dataTable.rows({ page: 'current' }).every(function () {
                    const data = this.data();
                    const url = data[5];
                    if (url && url !== "N/A" && !window.dataManager.selectedRowURLs.includes(url)) {
                        window.dataManager.selectedRowURLs.push(url);
                    }
                });
            } else {
                // 清除選擇
                this.selectedRowURLs = [];
            }
        });

        // 國家和學校篩選器變更
        $(document).on("change", ".country-checkbox, .school-checkbox", () => {
            this.updateFiltersFromUI();
        });
    }

    updateFiltersFromUI() {
        // 更新國家選擇
        this.selectedCountries = [];
        $(".country-checkbox:checked").each((i, elem) => {
            this.selectedCountries.push($(elem).val());
        });

        // 更新學校選擇
        this.selectedSchools = [];
        $(".school-checkbox:checked").each((i, elem) => {
            this.selectedSchools.push($(elem).val());
        });

        // 學位選擇由學位篩選器管理
        if (window.degreeFilterManager && window.degreeFilterManager.isReady()) {
            this.selectedDegrees = window.degreeFilterManager.getSelectedDegrees();
        }

        this.updateTableData();
    }

    setupDefaultSelections() {
        setTimeout(() => {
            console.log('DataManager: Setting default selections...');

            // 設置默認選擇
            $(".country-checkbox").prop("checked", true);
            $(".school-checkbox").prop("checked", true);

            // 學位篩選器的默認選擇由其自身管理

            this.updateFiltersFromUI();
        }, 2000); // 延遲2秒確保所有選擇器都已載入
    }

    // 公共方法：獲取選中的數據
    getSelectedData() {
        return this.totalData.filter(item => this.selectedRowURLs.includes(item.URL));
    }
}

// 創建全局實例
window.dataManager = new DataManager();

// 向後兼容性函數
window.updateSelectedFilters = function () {
    if (window.dataManager) {
        window.dataManager.updateFiltersFromUI();
    }
};

window.getSelectedData = function () {
    if (window.dataManager) {
        return window.dataManager.getSelectedData();
    }
    return [];
};
