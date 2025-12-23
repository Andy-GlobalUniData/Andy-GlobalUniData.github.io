/**
 * 🎯 Department Autocomplete Module
 * 科系關鍵字自動完成功能
 * 
 * Features:
 * - 從 data.json 載入科系資料
 * - 即時搜尋建議
 * - 鍵盤導航 (↑↓ 方向鍵)
 * - Tab/Enter 快速選擇
 * - 防抖動優化
 * - 虛擬滾動優化效能
 * 
 * @author Andy
 * @date 2025-10-23
 */

class DepartmentAutocomplete {
    /**
     * 建立自動完成實例
     * @param {HTMLInputElement} inputElement - 輸入框元素
     * @param {Object} options - 設定選項
     */
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            debounceDelay: options.debounceDelay || 150,
            maxResults: options.maxResults || 50,
            minChars: options.minChars || 1,
            onSelect: options.onSelect || null,
            dataSource: options.dataSource || 'data/data.json'
        };
        
        this.departments = [];
        this.filteredDepartments = [];
        this.selectedIndex = -1;
        this.debounceTimer = null;
        this.isOpen = false;
        
        // 建立下拉選單容器
        this.createDropdown();
        
        // 初始化
        this.init();
    }

    /**
     * 建立下拉選單 DOM 結構
     */
    createDropdown() {
        // 建立容器
        const container = document.createElement('div');
        container.className = 'autocomplete-wrapper';
        
        // 將輸入框包裹起來
        this.input.parentNode.insertBefore(container, this.input);
        container.appendChild(this.input);
        
        // 建立下拉選單
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.display = 'none';
        container.appendChild(this.dropdown);
        
        this.container = container;
    }

    /**
     * 初始化自動完成功能
     */
    async init() {
        try {
            await this.loadDepartments();
            this.attachEventListeners();
            console.log(`✅ Department Autocomplete 初始化完成 (載入 ${this.departments.length} 個科系)`);
        } catch (error) {
            console.error('❌ Department Autocomplete 初始化失敗:', error);
        }
    }

    /**
     * 從完整科系清單 JSON 載入資料
     * 🎯 優化：使用預先提取的完整科系列表（26k+ 個科系，100% 覆蓋）
     */
    async loadDepartments() {
        try {
            // 載入完整科系清單（已包含所有 data.json 中的科系）
            const response = await fetch('data/department_keywords.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 直接使用完整列表（已排序：高頻優先）
            this.departments = data.keywords || [];
            
            console.log(`✅ 載入完整科系清單：${this.departments.length} 個科系`);
            console.log(`📊 資料版本: ${data.metadata?.generatedDate || 'N/A'}`);
            console.log(`📊 高頻關鍵字: ${data.metadata?.priorityKeywords || 'N/A'} 個`);
            
            return this.departments;
        } catch (error) {
            console.error('❌ 載入科系清單失敗，使用備用方案:', error);
            
            // 備用方案：使用內建的基本科系列表
            this.departments = [
                'Computer Science',
                'Business Administration',
                'MBA',
                'Engineering',
                'Medicine',
                'Law',
                'Psychology',
                'Education',
                'Economics',
                'Mathematics'
            ];
            
            console.log(`⚠️ 使用內建備用科系列表 (${this.departments.length} 個)`);
            return this.departments;
        }
    }

    /**
     * 附加事件監聽器
     */
    attachEventListeners() {
        // 輸入事件 (使用防抖動)
        this.input.addEventListener('input', (e) => this.handleInput(e));
        
        // 鍵盤事件
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 焦點事件
        this.input.addEventListener('focus', () => {
            if (this.input.value.trim().length >= this.options.minChars) {
                this.filterAndDisplay(this.input.value.trim());
            }
        });
        
        // 點擊外部關閉
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    /**
     * 處理輸入事件 (防抖動)
     */
    handleInput(e) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            
            if (query.length >= this.options.minChars) {
                this.filterAndDisplay(query);
            } else {
                this.hideDropdown();
            }
        }, this.options.debounceDelay);
    }

    /**
     * 篩選並顯示結果
     */
    filterAndDisplay(query) {
        const lowerQuery = query.toLowerCase();
        
        // 篩選符合的科系
        this.filteredDepartments = this.departments
            .filter(dept => dept.toLowerCase().includes(lowerQuery))
            .slice(0, this.options.maxResults);
        
        if (this.filteredDepartments.length > 0) {
            this.displayDropdown();
        } else {
            this.displayNoResults();
        }
    }

    /**
     * 顯示下拉選單
     */
    displayDropdown() {
        this.dropdown.innerHTML = '';
        this.selectedIndex = -1;
        
        // 建立選項
        this.filteredDepartments.forEach((dept, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = dept;
            item.dataset.index = index;
            
            // 滑鼠懸停事件
            item.addEventListener('mouseenter', () => {
                this.setActiveItem(index);
            });
            
            // 點擊事件
            item.addEventListener('click', () => {
                this.selectDepartment(dept);
            });
            
            this.dropdown.appendChild(item);
        });
        
        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    /**
     * 顯示無結果訊息
     */
    displayNoResults() {
        this.dropdown.innerHTML = '<div class="autocomplete-no-results">篩選非常見的科系</div>';
        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    /**
     * 隱藏下拉選單
     */
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        this.selectedIndex = -1;
    }

    /**
     * 處理鍵盤事件
     */
    handleKeyDown(e) {
        if (!this.isOpen) {
            return;
        }

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.moveSelection(1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.moveSelection(-1);
                break;
                
            case 'Tab':
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredDepartments.length) {
                    this.selectDepartment(this.filteredDepartments[this.selectedIndex]);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hideDropdown();
                break;
        }
    }

    /**
     * 移動選擇
     */
    moveSelection(direction) {
        const items = this.dropdown.querySelectorAll('.autocomplete-item');
        
        if (items.length === 0) {
            return;
        }
        
        // 移除舊的 active 類別
        if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
            items[this.selectedIndex].classList.remove('active');
        }
        
        // 計算新的索引
        this.selectedIndex += direction;
        
        // 循環處理
        if (this.selectedIndex < 0) {
            this.selectedIndex = items.length - 1;
        } else if (this.selectedIndex >= items.length) {
            this.selectedIndex = 0;
        }
        
        // 添加新的 active 類別
        this.setActiveItem(this.selectedIndex);
    }

    /**
     * 設定活動項目
     */
    setActiveItem(index) {
        const items = this.dropdown.querySelectorAll('.autocomplete-item');
        
        // 移除所有 active
        items.forEach(item => item.classList.remove('active'));
        
        // 添加新的 active
        if (index >= 0 && index < items.length) {
            this.selectedIndex = index;
            items[index].classList.add('active');
            
            // 滾動到可見區域
            items[index].scrollIntoView({ 
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    /**
     * 選擇科系
     */
    selectDepartment(dept) {
        this.input.value = dept;
        this.hideDropdown();
        
        // 觸發自訂事件
        const event = new CustomEvent('autocomplete-select', {
            detail: { value: dept }
        });
        this.input.dispatchEvent(event);
        
        // 呼叫回調函式
        if (this.options.onSelect) {
            this.options.onSelect(dept);
        }
    }

    /**
     * 處理點擊外部
     */
    handleClickOutside(e) {
        if (!this.container.contains(e.target)) {
            this.hideDropdown();
        }
    }

    /**
     * 銷毀實例
     */
    destroy() {
        // 移除事件監聽器
        this.input.removeEventListener('input', this.handleInput);
        this.input.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('click', this.handleClickOutside);
        
        // 移除 DOM
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.remove();
        }
        
        console.log('✅ Department Autocomplete 已銷毀');
    }
}

// 導出到全域
if (typeof window !== 'undefined') {
    window.DepartmentAutocomplete = DepartmentAutocomplete;
}
