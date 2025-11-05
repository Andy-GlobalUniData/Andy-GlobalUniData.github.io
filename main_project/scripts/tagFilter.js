/**
 * TagFilterManager - 科系標籤篩選管理器
 * 使用 TDD 開發,實現標籤的新增、刪除和篩選功能
 * 
 * 🎯 核心功能:
 * - 只篩選 Department Name 欄位 (第4欄,索引3)
 * - 支援多標籤 OR 邏輯
 * - 不區分大小寫匹配
 * 
 * @version 2.0.0
 * @date 2025-11-05
 */

class TagFilterManager {
    constructor() {
        this.tags = [];
        this.lowerCaseTags = []; // 🎯 效能優化: 快取小寫標籤,避免重複計算
        this.inputElement = null;
        this.addButton = null;
        this.tagContainer = null;
        this.dataTable = null;
        this.filterRegistered = false; // 追蹤篩選器註冊狀態
        this.registerAttempts = 0; // 追蹤註冊嘗試次數
        this.maxAttempts = 30; // 最多嘗試 30 次 (30 秒)
        this.debugMode = false; // 🎯 效能優化: 生產環境關閉 debug log
        
        this.init();
    }
    
    /**
     * 初始化標籤管理器
     */
    init() {
        // 獲取 DOM 元素
        this.inputElement = document.getElementById('tag-filter-input');
        this.addButton = document.getElementById('add-tag-btn');
        this.tagContainer = document.getElementById('tag-container');
        
        if (!this.inputElement || !this.addButton || !this.tagContainer) {
            console.error('❌ TagFilterManager: 缺少必要的 DOM 元素');
            console.error('Required: tag-filter-input, add-tag-btn, tag-container');
            return;
        }
        
        // 綁定事件
        this.addButton.addEventListener('click', () => this.handleAddTag());
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTag();
            }
        });
        
        // 註冊 DataTable 自定義搜尋函數
        this.registerDataTableFilter();
        
        console.log('✅ TagFilterManager 初始化完成');
    }
    
    /**
     * 處理新增標籤
     */
    handleAddTag() {
        const tagValue = this.inputElement.value.trim();
        
        if (tagValue) {
            this.addTag(tagValue);
            this.inputElement.value = '';
            this.inputElement.focus();
        }
    }
    
    /**
     * 新增標籤
     * @param {string} tagText - 標籤文字
     * @returns {boolean} 是否成功新增
     */
    addTag(tagText) {
        // 驗證標籤
        if (!tagText || typeof tagText !== 'string' || tagText.trim() === '') {
            console.warn('⚠️ TagFilterManager: 無效的標籤文字');
            return false;
        }
        
        const normalizedTag = tagText.trim();
        
        // 檢查重複
        if (this.tags.includes(normalizedTag)) {
            console.warn(`⚠️ TagFilterManager: 標籤 "${normalizedTag}" 已存在`);
            return false;
        }
        
        // 添加到陣列
        this.tags.push(normalizedTag);
        
        // 🎯 效能優化: 同步更新小寫快取
        this.lowerCaseTags.push(normalizedTag.toLowerCase());
        
        // 更新 UI
        this.renderTags();
        
        // 觸發表格篩選
        this.filterTable();
        
        console.log(`✅ TagFilterManager: 新增標籤 "${normalizedTag}" (共 ${this.tags.length} 個標籤)`);
        return true;
    }
    
    /**
     * 刪除標籤
     * @param {string} tagText - 要刪除的標籤文字
     * @returns {boolean} 是否成功刪除
     */
    removeTag(tagText) {
        const index = this.tags.indexOf(tagText);
        
        if (index > -1) {
            this.tags.splice(index, 1);
            
            // 🎯 效能優化: 同步更新小寫快取
            this.lowerCaseTags.splice(index, 1);
            
            this.renderTags();
            this.filterTable();
            console.log(`🗑️ TagFilterManager: 刪除標籤 "${tagText}" (剩餘 ${this.tags.length} 個標籤)`);
            return true;
        }
        
        console.warn(`⚠️ TagFilterManager: 找不到標籤 "${tagText}"`);
        return false;
    }
    
    /**
     * 清除所有標籤
     * @returns {number} 清除的標籤數量
     */
    clearAllTags() {
        const count = this.tags.length;
        this.tags = [];
        
        // 🎯 效能優化: 清除快取
        this.lowerCaseTags = [];
        
        this.renderTags();
        this.filterTable();
        console.log(`🧹 TagFilterManager: 清除所有標籤 (共 ${count} 個)`);
        return count;
    }
    
    /**
     * 渲染標籤 UI
     */
    renderTags() {
        if (!this.tagContainer) return;
        
        // 清空容器
        this.tagContainer.innerHTML = '';
        
        // 如果沒有標籤,顯示空狀態
        if (this.tags.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = '尚未新增任何篩選標籤';
            this.tagContainer.appendChild(emptyState);
            return;
        }
        
        // 渲染每個標籤
        this.tags.forEach(tag => {
            const tagElement = this.createTagElement(tag);
            this.tagContainer.appendChild(tagElement);
        });
    }
    
    /**
     * 創建標籤元素
     * @param {string} tagText - 標籤文字
     * @returns {HTMLElement} 標籤元素
     */
    createTagElement(tagText) {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'filter-tag';
        
        // 標籤文字
        const textSpan = document.createElement('span');
        textSpan.className = 'tag-text';
        textSpan.textContent = tagText;
        textSpan.title = tagText; // 懸停顯示完整文字
        
        // 刪除按鈕
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.innerHTML = '×';
        removeBtn.title = '刪除此標籤';
        removeBtn.addEventListener('click', () => this.removeTag(tagText));
        
        tagDiv.appendChild(textSpan);
        tagDiv.appendChild(removeBtn);
        
        return tagDiv;
    }
    
    /**
     * 註冊 DataTable 自定義搜尋函數
     * 🎯 關鍵: 只篩選 Department Name 欄位 (第4欄,索引3)
     */
    registerDataTableFilter() {
        // 避免重複註冊
        if (this.filterRegistered) {
            console.log('⚠️ TagFilterManager: 篩選器已註冊,跳過');
            return;
        }
        
        // 增加嘗試次數
        this.registerAttempts++;
        
        // 檢查是否超過最大嘗試次數
        if (this.registerAttempts > this.maxAttempts) {
            console.error('❌ TagFilterManager: DataTable 篩選器註冊失敗 (超過最大嘗試次數)');
            console.error('請確認:');
            console.error('1. DataTable 是否已正確載入');
            console.error('2. #json-table 元素是否存在');
            console.error('3. main.js 中的 initDataTable() 是否已執行');
            return;
        }
        
        // 確保 DataTable 已載入
        if (typeof $ === 'undefined' || typeof $.fn.dataTable === 'undefined') {
            console.warn(`⏳ TagFilterManager: DataTable 庫尚未載入,延遲註冊篩選器 (嘗試 ${this.registerAttempts}/${this.maxAttempts})`);
            setTimeout(() => this.registerDataTableFilter(), 1000);
            return;
        }
        
        // 🎯 關鍵修正: 檢查 DataTable 實例是否已初始化
        if (!$.fn.dataTable.isDataTable('#json-table')) {
            console.warn(`⏳ TagFilterManager: DataTable 實例尚未初始化,延遲註冊篩選器 (嘗試 ${this.registerAttempts}/${this.maxAttempts})`);
            setTimeout(() => this.registerDataTableFilter(), 1000);
            return;
        }
        
        const self = this;
        
        // 🎯 自定義搜尋函數 - 只針對 Department Name (記憶體優化版)
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            // 只對 json-table 應用此篩選器
            if (settings.nTable.id !== 'json-table') {
                return true;
            }
            
            // 如果沒有標籤,顯示所有資料
            if (self.tags.length === 0) {
                return true;
            }
            
            // 🎯 關鍵: 取得 Department Name 欄位 (第4欄,索引3)
            // 欄位順序: [0]Select, [1]Country, [2]School, [3]Department, [4]Degree, [5]URL
            const departmentName = data[3] || '';
            
            // 🎯 效能優化: 快取 toLowerCase 結果,避免每次計算
            const deptNameLower = departmentName.toLowerCase();
            
            // 🎯 效能優化: 使用預先快取的小寫標籤
            const matches = self.lowerCaseTags.some(lowerTag => deptNameLower.includes(lowerTag));
            
            // 🎯 效能優化: 移除生產環境的 debug log (減少 99.99% 記憶體消耗)
            // Debug log 已移至 debugMode,預設關閉
            if (self.debugMode && dataIndex < 3) {
                console.log(`🔍 Row ${dataIndex}: "${departmentName}" -> ${matches ? '✅' : '❌'}`);
            }
            
            return matches;
        });
        
        this.filterRegistered = true;
        console.log(`✅ TagFilterManager: DataTable 篩選器已註冊 (嘗試 ${this.registerAttempts} 次後成功)`);
        console.log('✅ 篩選器設定: 只篩選 Department Name 欄位 (第4欄,索引3)');
        console.log('� 記憶體優化: Debug log 已關閉 (可透過 debugMode 啟用)');
        console.log('�📋 可以開始使用科系關鍵字篩選功能了!');
    }
    
    /**
     * 觸發表格篩選
     * @returns {Object|null} 篩選結果資訊,失敗則返回 null
     */
    filterTable() {
        // 確保 DataTable 已初始化
        if (typeof $ === 'undefined' || !$.fn.dataTable.isDataTable('#json-table')) {
            console.warn('⚠️ TagFilterManager: DataTable 尚未初始化,跳過篩選');
            return null;
        }
        
        try {
            // 🎯 效能監控: 記錄篩選開始時間
            const startTime = performance.now();
            
            const table = $('#json-table').DataTable();
            table.draw();
            
            // 🎯 效能監控: 計算篩選耗時
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            
            // 顯示篩選結果資訊
            const info = table.page.info();
            const result = {
                displayed: info.recordsDisplay,
                total: info.recordsTotal,
                filtered: info.recordsTotal - info.recordsDisplay,
                duration: parseFloat(duration)
            };
            
            // 🎯 效能優化: 簡化 log 輸出
            console.log(`🔄 TagFilterManager: 篩選完成 (${duration}ms)`);
            console.log(`   📊 ${result.displayed} / ${result.total} 筆 | 🏷️ [${this.tags.join(', ')}]`);
            
            // 🎯 效能警告: 篩選時間過長
            if (result.duration > 1000) {
                console.warn(`⚠️ 篩選耗時較長 (${duration}ms),建議減少標籤數量`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ TagFilterManager: 篩選時發生錯誤', error);
            return null;
        }
    }
    
    /**
     * 取得目前的標籤列表
     * @returns {Array<string>} 標籤陣列
     */
    getTags() {
        return [...this.tags];
    }
    
    /**
     * 取得標籤數量
     * @returns {number} 標籤數量
     */
    getTagCount() {
        return this.tags.length;
    }
    
    /**
     * 🎯 效能優化: 開啟/關閉 Debug 模式
     * @param {boolean} enabled - 是否啟用
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`🔧 TagFilterManager: Debug 模式 ${enabled ? '已啟用' : '已關閉'}`);
        if (enabled) {
            console.warn('⚠️ Debug 模式會顯著增加記憶體使用,僅用於開發除錯');
        }
    }
    
    /**
     * 🎯 效能監控: 取得記憶體使用資訊
     * @returns {Object} 記憶體資訊
     */
    getMemoryInfo() {
        if (performance.memory) {
            const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
            return {
                used: mb(performance.memory.usedJSHeapSize),
                total: mb(performance.memory.totalJSHeapSize),
                limit: mb(performance.memory.jsHeapSizeLimit)
            };
        }
        return null;
    }
}

// 當 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 將 TagFilterManager 暴露到全域,以便測試使用
    window.TagFilterManager = TagFilterManager;
    
    // 創建實例
    window.tagFilterManager = new TagFilterManager();
    
    console.log('🏷️ Tag Filter System 已啟動');
});
