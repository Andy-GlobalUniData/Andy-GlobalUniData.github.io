/**
 * 全新的學位篩選系統
 * 完全重寫，解決載入問題
 */

class DegreeFilterManager {
    constructor() {
        this.isInitialized = false;
        this.degreeData = null;
        this.container = null;
        this.selectedDegrees = new Set(['No Filter']);

        // 硬編碼的學位數據，確保總是有數據可用
        this.defaultDegreeData = {
            "Undergraduate / Bachelor": [
                "Undergraduate", "Bachelor", "BSc", "BA", "BEng", "BBA", "BFA", "LLB", "BEd",
                "B.Sc", "B.A", "B.Eng", "B.B.A", "B.F.A", "LL.B", "B.Ed", "Majors", "Minors"
            ],
            "Graduate / Master Degrees": [
                "Graduate", "Master", "MSc", "MA", "MEng", "MBA", "MFA", "LLM", "MEd",
                "M.Sc", "M.A", "M.Eng", "M.B.A", "M.F.A", "LL.M", "M.Ed", "Postgraduate"
            ],
            "Doctoral Degrees / Ph.D.": [
                "PhD", "Ph.D.", "Doctoral", "DPhil", "D.Phil"
            ]
        };

        this.init();
    }

    init() {
        console.log('DegreeFilterManager: Starting initialization');

        // 等待DOM載入
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAfterDOM());
        } else {
            this.setupAfterDOM();
        }
    }

    setupAfterDOM() {
        console.log('DegreeFilterManager: DOM ready, setting up');

        // 找到容器
        this.container = document.getElementById('degree-selector-content');
        if (!this.container) {
            console.error('DegreeFilterManager: Container not found');
            return;
        }

        // 立即顯示載入狀態
        this.showLoading();

        // 延遲初始化，確保其他腳本已載入
        setTimeout(() => this.loadDegreeData(), 100);
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 20px;">
                    <div>🎓 載入學位資料中...</div>
                    <div style="font-size: 12px; margin-top: 5px;">正在初始化學位篩選器</div>
                </div>
            `;
        }
    }

    async loadDegreeData() {
        console.log('DegreeFilterManager: Loading degree data');

        try {
            // 先嘗試從文件載入
            const response = await fetch('data/Degree_data.json');
            if (response.ok) {
                const text = await response.text();
                this.degreeData = JSON.parse(text);
                console.log('DegreeFilterManager: Loaded data from file', this.degreeData);
            } else {
                throw new Error('File not found or not accessible');
            }
        } catch (error) {
            console.warn('DegreeFilterManager: Failed to load from file, using default data', error);
            this.degreeData = this.defaultDegreeData;
        }

        this.renderDegreeSelector();
    }

    renderDegreeSelector() {
        console.log('DegreeFilterManager: Rendering selector');

        if (!this.container || !this.degreeData) {
            console.error('DegreeFilterManager: Missing container or data');
            return;
        }

        const degreeLevels = Object.keys(this.degreeData);

        // 生成HTML
        const optionsHTML = degreeLevels.map(degree => `
            <div class="school-item">
                <label>
                    <input type="checkbox" 
                           class="degree-checkbox" 
                           value="${degree}"
                           data-level="${degree}"> 
                    ${degree}
                </label>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="school-item" style="border-bottom: 1px solid var(--border-color, #ddd); padding-bottom: 8px; margin-bottom: 8px;">
                <label>
                    <input type="checkbox" 
                           class="degree-checkbox" 
                           value="No Filter" 
                           checked
                           data-level="none"> 
                    <strong>🚫 不篩選學位</strong>
                </label>
            </div>
            ${optionsHTML}
        `;

        this.setupEventListeners();
        this.isInitialized = true;

        console.log('DegreeFilterManager: Initialization complete');

        // 通知其他系統學位篩選器已就緒
        window.dispatchEvent(new CustomEvent('degreeFilterReady'));
    }

    setupEventListeners() {
        if (!this.container) return;

        this.container.addEventListener('change', (event) => {
            if (event.target.classList.contains('degree-checkbox')) {
                this.handleDegreeChange(event.target);
            }
        });
    }

    handleDegreeChange(checkbox) {
        const value = checkbox.value;
        const isChecked = checkbox.checked;

        console.log('DegreeFilterManager: Degree selection changed', { value, isChecked });

        if (value === 'No Filter') {
            if (isChecked) {
                // 選擇"不篩選"時，取消並禁用其他選項
                this.selectedDegrees.clear();
                this.selectedDegrees.add('No Filter');

                this.container.querySelectorAll('.degree-checkbox').forEach(cb => {
                    if (cb.value !== 'No Filter') {
                        cb.checked = false;
                        cb.disabled = true;
                    }
                });

                this.clearDataTableFilter();
            }
        } else {
            // 選擇具體學位時
            if (isChecked) {
                // 取消"不篩選"選項
                const noFilterBox = this.container.querySelector('.degree-checkbox[value="No Filter"]');
                if (noFilterBox) {
                    noFilterBox.checked = false;
                }

                // 啟用所有選項
                this.container.querySelectorAll('.degree-checkbox').forEach(cb => {
                    cb.disabled = false;
                });

                this.selectedDegrees.delete('No Filter');
                this.selectedDegrees.add(value);
            } else {
                this.selectedDegrees.delete(value);
            }

            this.applyDegreeFilter();
        }

        // 觸發更新事件
        this.notifyFilterChange();
    }

    clearDataTableFilter() {
        console.log('DegreeFilterManager: Clearing DataTable filter');
        if (window.dataTable && $.fn.dataTable.isDataTable('#json-table')) {
            window.dataTable.column(4).search("").draw();
        }
    }

    applyDegreeFilter() {
        const selectedArray = Array.from(this.selectedDegrees);
        console.log('DegreeFilterManager: Applying filter', selectedArray);

        if (selectedArray.length === 0 || selectedArray.includes('No Filter')) {
            this.clearDataTableFilter();
            return;
        }

        // 建立篩選條件
        const filterPattern = selectedArray.join('|');

        if (window.dataTable && $.fn.dataTable.isDataTable('#json-table')) {
            window.dataTable.column(4).search(filterPattern, true, false).draw();
        }
    }

    notifyFilterChange() {
        // 觸發主系統的篩選更新
        if (typeof updateSelectedFilters === 'function') {
            updateSelectedFilters();
        }

        // 發送自定義事件
        window.dispatchEvent(new CustomEvent('degreeFilterChanged', {
            detail: { selectedDegrees: Array.from(this.selectedDegrees) }
        }));
    }

    // 公共方法：獲取選中的學位
    getSelectedDegrees() {
        return Array.from(this.selectedDegrees);
    }

    // 公共方法：檢查是否已初始化
    isReady() {
        return this.isInitialized;
    }
}

// 創建全局實例
window.degreeFilterManager = new DegreeFilterManager();

// 向後兼容性：保持原有的函數調用方式
window.updateSelectedDepartments = function () {
    if (window.degreeFilterManager && window.degreeFilterManager.isReady()) {
        return window.degreeFilterManager.getSelectedDegrees();
    }
    return ['No Filter'];
};
