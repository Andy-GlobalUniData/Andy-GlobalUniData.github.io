/**
 * TagFilterManager - 科系標籤篩選管理器
 * 使用 TDD 開發,實現標籤的新增、刪除和篩選功能
 */

class TagFilterManager {
    constructor() {
        this.tags = [];
        this.inputElement = null;
        this.addButton = null;
        this.tagContainer = null;
        this.dataTable = null;
        
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
            console.error('TagFilterManager: 缺少必要的 DOM 元素');
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
        
        console.log('TagFilterManager 初始化完成');
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
     */
    addTag(tagText) {
        // 驗證標籤
        if (!tagText || tagText.trim() === '') {
            console.warn('TagFilterManager: 無效的標籤文字');
            return;
        }
        
        const normalizedTag = tagText.trim();
        
        // 檢查重複
        if (this.tags.includes(normalizedTag)) {
            console.warn(`TagFilterManager: 標籤 "${normalizedTag}" 已存在`);
            return;
        }
        
        // 添加到陣列
        this.tags.push(normalizedTag);
        
        // 更新 UI
        this.renderTags();
        
        // 觸發表格篩選
        this.filterTable();
        
        console.log(`TagFilterManager: 新增標籤 "${normalizedTag}"`);
    }
    
    /**
     * 刪除標籤
     * @param {string} tagText - 要刪除的標籤文字
     */
    removeTag(tagText) {
        const index = this.tags.indexOf(tagText);
        
        if (index > -1) {
            this.tags.splice(index, 1);
            this.renderTags();
            this.filterTable();
            console.log(`TagFilterManager: 刪除標籤 "${tagText}"`);
        }
    }
    
    /**
     * 清除所有標籤
     */
    clearAllTags() {
        this.tags = [];
        this.renderTags();
        this.filterTable();
        console.log('TagFilterManager: 清除所有標籤');
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
     */
    registerDataTableFilter() {
        // 確保 DataTable 已載入
        if (typeof $ === 'undefined' || typeof $.fn.dataTable === 'undefined') {
            console.warn('TagFilterManager: DataTable 尚未載入,延遲註冊篩選器');
            setTimeout(() => this.registerDataTableFilter(), 500);
            return;
        }
        
        const self = this;
        
        // 自定義搜尋函數
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            // 只對 json-table 應用此篩選器
            if (settings.nTable.id !== 'json-table') {
                return true;
            }
            
            // 如果沒有標籤,顯示所有資料
            if (self.tags.length === 0) {
                return true;
            }
            
            // 取得科系名稱欄位 (第4欄,索引3)
            const departmentName = data[3] || '';
            
            // 檢查是否匹配任一標籤
            const matches = self.tags.some(tag => {
                // 使用不區分大小寫的包含檢查
                return departmentName.toLowerCase().includes(tag.toLowerCase());
            });
            
            return matches;
        });
        
        console.log('TagFilterManager: DataTable 篩選器已註冊');
    }
    
    /**
     * 觸發表格篩選
     */
    filterTable() {
        // 確保 DataTable 已初始化
        if (typeof $ === 'undefined' || !$.fn.dataTable.isDataTable('#json-table')) {
            console.warn('TagFilterManager: DataTable 尚未初始化');
            return false;
        }
        
        try {
            const table = $('#json-table').DataTable();
            table.draw();
            
            // 顯示篩選結果資訊
            const info = table.page.info();
            console.log(`TagFilterManager: 篩選完成 - 顯示 ${info.recordsDisplay} / ${info.recordsTotal} 筆資料`);
            
            return true;
        } catch (error) {
            console.error('TagFilterManager: 篩選時發生錯誤', error);
            return false;
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
}

// 當 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 將 TagFilterManager 暴露到全域,以便測試使用
    window.TagFilterManager = TagFilterManager;
    
    // 創建實例
    window.tagFilterManager = new TagFilterManager();
    
    console.log('🏷️ Tag Filter System 已啟動');
});
