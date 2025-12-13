/**
 * TDD + PDCA 版本: Department Filter
 * 
 * 新架構:
 * - 只負責管理標籤 UI (新增、刪除、顯示)
 * - 觸發重新載入數據 (調用 main.js 的過濾邏輯)
 * - 不再使用 DataTable 的 search API (改由 main.js 在 loadNextChunk 中處理)
 */

class TagFilterManager {
    constructor() {
        this.tags = [];
        this.lowerCaseTags = []; // 🎯 記憶體優化: 快取小寫標籤，避免重複計算
        this.input = document.getElementById('tag-filter-input');
        this.btn = document.getElementById('add-tag-btn');
        this.container = document.getElementById('tag-container');
        
        if (!this.input || !this.btn || !this.container) {
            console.error('TagFilterManager: DOM 元素缺失');
            return;
        }
        
        this.btn.addEventListener('click', () => this.addTag());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });
        
        console.log('✅ TagFilterManager 初始化完成');
    }
    
    addTag() {
        const val = this.input.value.trim();
        if (!val || this.tags.includes(val)) return;
        
        this.tags.push(val);
        this.lowerCaseTags.push(val.toLowerCase()); // 🎯 記憶體優化: 預先快取小寫版本
        this.input.value = '';
        this.render();
        this.triggerReload();
    }
    
    removeTag(tag) {
        const idx = this.tags.indexOf(tag);
        if (idx > -1) {
            this.tags.splice(idx, 1);
            this.lowerCaseTags.splice(idx, 1); // 🎯 記憶體優化: 同步移除快取
        }
        this.render();
        this.triggerReload();
    }
    
    render() {
        if (this.tags.length === 0) {
            this.container.innerHTML = '<div class="empty-state">' +
                '<div class="empty-state-icon">🔍</div>' +
                '<div class="empty-state-text">輸入科系關鍵字開始篩選' +
                '<br><span class="empty-state-hint">例如：Computer Science、MBA、Engineering</span></div>' +
                '</div>';
            return;
        }
        
        let html = '';
        this.tags.forEach(tag => {
            html += '<div class="filter-tag">' +
                    '<span>' + tag + '</span>' +
                    '<button type="button" class="remove-tag" data-tag="' + tag + '">&times;</button>' +
                    '</div>';
        });
        
        this.container.innerHTML = html;
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', () => this.removeTag(btn.dataset.tag));
        });
    }
    
    /**
     * 觸發重新載入 (調用 main.js 中的 updateFilters)
     */
    triggerReload() {
        // 🎯 記憶體優化: 簡化日誌輸出
        const tagCount = this.tags.length;
        console.log('📊 Department Filter 已更改 (' + tagCount + ' 個標籤)');
        
        // 呼叫全域的 updateFilters 函數
        if (typeof window.updateFilters === 'function') {
            window.updateFilters();
        } else {
            console.warn('⚠️ window.updateFilters 不存在');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tagFilterManager = new TagFilterManager();
});

