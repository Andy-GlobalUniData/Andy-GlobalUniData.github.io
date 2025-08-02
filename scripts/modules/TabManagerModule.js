/**
 * 標籤頁管理模塊 - Tab Manager Module
 * 負責三個主要標籤頁的切換和管理
 */

class TabManagerModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.currentTab = 'department-data'; // 預設標籤頁
        this.tabHistory = ['department-data'];
        this.maxHistoryLength = 10;
        this.isInitialized = false;
        
        // 標籤頁配置
        this.tabs = {
            'department-data': {
                name: '📋 科系資料',
                description: '瀏覽和搜尋各大學的科系資料',
                icon: '📋',
                shortcut: '1'
            },
            'school-data': {
                name: '🏫 學校資料',
                description: '瀏覽學校資訊和統計數據',
                icon: '🏫',
                shortcut: '2'
            },
            'map-view': {
                name: '🗺️ 地圖檢視',
                description: '在地圖上查看學校位置',
                icon: '🗺️',
                shortcut: '3'
            }
        };
        
        console.log('TabManagerModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('tabManager', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        
        console.log('TabManagerModule: Event listeners registered');
    }

    // 設置
    setup() {
        if (this.isInitialized) return;
        
        console.log('TabManagerModule: Setting up...');
        
        this.setupTabButtons();
        this.setupKeyboardShortcuts();
        this.setupBreadcrumb();
        this.initializeDefaultTab();
        
        this.isInitialized = true;
        console.log('TabManagerModule: Setup complete');
    }

    // 設置標籤頁按鈕
    setupTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            const tabConfig = this.tabs[tabId];
            
            if (tabConfig) {
                // 更新按鈕文字
                button.innerHTML = `
                    <span class="tab-icon">${tabConfig.icon}</span>
                    <span class="tab-text">${tabConfig.name}</span>
                    <span class="tab-shortcut">Alt+${tabConfig.shortcut}</span>
                `;
                
                // 設置 title 屬性
                button.title = `${tabConfig.description} (Alt+${tabConfig.shortcut})`;
            }
            
            // 按鈕點擊事件
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tabId);
            });
        });
        
        console.log('TabManagerModule: Tab buttons setup complete');
    }

    // 設置鍵盤快捷鍵
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + 數字鍵切換標籤頁
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch (e.code) {
                    case 'Digit1':
                        e.preventDefault();
                        this.switchTab('department-data');
                        break;
                    case 'Digit2':
                        e.preventDefault();
                        this.switchTab('school-data');
                        break;
                    case 'Digit3':
                        e.preventDefault();
                        this.switchTab('map-view');
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.goToPreviousTab();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.goToNextTab();
                        break;
                }
            }
        });
        
        console.log('TabManagerModule: Keyboard shortcuts setup complete');
    }

    // 設置麵包屑導航
    setupBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumb-nav');
        if (!breadcrumbContainer) {
            console.warn('TabManagerModule: Breadcrumb container not found');
            return;
        }
        
        this.updateBreadcrumb();
        console.log('TabManagerModule: Breadcrumb setup complete');
    }

    // 初始化預設標籤頁
    initializeDefaultTab() {
        // 檢查 URL hash 是否指定了標籤頁
        const hash = window.location.hash.replace('#', '');
        if (hash && this.tabs[hash]) {
            this.currentTab = hash;
        }
        
        this.switchTab(this.currentTab, false); // 不加入歷史記錄
        
        // 監聽浏覽器返回/前進按鈕
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.replace('#', '');
            if (newHash && this.tabs[newHash] && newHash !== this.currentTab) {
                this.switchTab(newHash, false);
            }
        });
        
        console.log('TabManagerModule: Default tab initialized:', this.currentTab);
    }

    // 切換標籤頁
    switchTab(tabId, addToHistory = true) {
        if (!this.tabs[tabId]) {
            console.error('TabManagerModule: Invalid tab ID:', tabId);
            return;
        }
        
        if (tabId === this.currentTab) {
            console.log('TabManagerModule: Already on tab:', tabId);
            return;
        }
        
        console.log('TabManagerModule: Switching to tab:', tabId);
        
        // 隱藏當前標籤頁
        this.hideTab(this.currentTab);
        
        // 更新當前標籤頁
        const previousTab = this.currentTab;
        this.currentTab = tabId;
        
        // 顯示新標籤頁
        this.showTab(tabId);
        
        // 更新按鈕狀態
        this.updateTabButtons();
        
        // 更新麵包屑
        this.updateBreadcrumb();
        
        // 更新 URL hash
        if (window.location.hash !== `#${tabId}`) {
            window.history.pushState(null, null, `#${tabId}`);
        }
        
        // 加入歷史記錄
        if (addToHistory) {
            this.addToHistory(tabId);
        }
        
        // 觸發標籤頁切換事件
        this.core.emit('tabChanged', {
            previousTab: previousTab,
            currentTab: tabId,
            tabConfig: this.tabs[tabId]
        });
        
        // 特殊處理：地圖標籤頁需要觸發地圖初始化
        if (tabId === 'map-view') {
            this.onTabActivated(tabId);
        }
        
        console.log('TabManagerModule: Tab switched successfully');
    }

    // 隱藏標籤頁
    hideTab(tabId) {
        const tabContent = document.getElementById(tabId);
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (tabContent) {
            tabContent.classList.remove('active');
            tabContent.style.display = 'none';
        }
        
        if (tabButton) {
            tabButton.classList.remove('active');
        }
    }

    // 顯示標籤頁
    showTab(tabId) {
        const tabContent = document.getElementById(tabId);
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (tabContent) {
            tabContent.style.display = 'block';
            // 使用 setTimeout 確保動畫效果
            setTimeout(() => {
                tabContent.classList.add('active');
            }, 10);
        }
        
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }

    // 更新標籤頁按鈕狀態
    updateTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            
            if (tabId === this.currentTab) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });
    }

    // 更新麵包屑導航
    updateBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumb-nav');
        if (!breadcrumbContainer) return;
        
        const tabConfig = this.tabs[this.currentTab];
        if (!tabConfig) return;
        
        breadcrumbContainer.innerHTML = `
            <div class="breadcrumb">
                <span class="breadcrumb-home">🏠</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">
                    ${tabConfig.icon} ${tabConfig.name}
                </span>
                <span class="breadcrumb-description">${tabConfig.description}</span>
            </div>
        `;
    }

    // 加入歷史記錄
    addToHistory(tabId) {
        // 移除重複的記錄
        const existingIndex = this.tabHistory.indexOf(tabId);
        if (existingIndex > -1) {
            this.tabHistory.splice(existingIndex, 1);
        }
        
        // 加入到最前面
        this.tabHistory.unshift(tabId);
        
        // 保持歷史長度限制
        if (this.tabHistory.length > this.maxHistoryLength) {
            this.tabHistory = this.tabHistory.slice(0, this.maxHistoryLength);
        }
        
        console.log('TabManagerModule: Tab history updated:', this.tabHistory);
    }

    // 前往上一個標籤頁
    goToPreviousTab() {
        const tabOrder = Object.keys(this.tabs);
        const currentIndex = tabOrder.indexOf(this.currentTab);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabOrder.length - 1;
        
        this.switchTab(tabOrder[previousIndex]);
    }

    // 前往下一個標籤頁
    goToNextTab() {
        const tabOrder = Object.keys(this.tabs);
        const currentIndex = tabOrder.indexOf(this.currentTab);
        const nextIndex = currentIndex < tabOrder.length - 1 ? currentIndex + 1 : 0;
        
        this.switchTab(tabOrder[nextIndex]);
    }

    // 回到上一個訪問的標籤頁
    goBack() {
        if (this.tabHistory.length > 1) {
            const previousTab = this.tabHistory[1]; // 第二個是上一個
            this.switchTab(previousTab);
        }
    }

    // 當標籤頁被激活時的處理
    onTabActivated(tabId) {
        console.log('TabManagerModule: Tab activated:', tabId);
        
        switch (tabId) {
            case 'map-view':
                // 觸發地圖模塊初始化
                setTimeout(() => {
                    const mapModule = this.core.getModule('map');
                    if (mapModule && mapModule.map) {
                        mapModule.map.invalidateSize();
                        console.log('TabManagerModule: Map size invalidated for proper display');
                    }
                }, 100);
                break;
                
            case 'department-data':
                // 觸發科系表格重新繪製
                setTimeout(() => {
                    const departmentModule = this.core.getModule('department');
                    if (departmentModule && departmentModule.dataTable) {
                        departmentModule.dataTable.columns.adjust().draw();
                    }
                }, 100);
                break;
                
            case 'school-data':
                // 觸發學校表格重新繪製
                setTimeout(() => {
                    const schoolModule = this.core.getModule('school');
                    if (schoolModule && schoolModule.schoolDataTable) {
                        schoolModule.schoolDataTable.columns.adjust().draw();
                    }
                }, 100);
                break;
        }
    }

    // 獲取當前標籤頁
    getCurrentTab() {
        return this.currentTab;
    }

    // 獲取標籤頁配置
    getTabConfig(tabId) {
        return this.tabs[tabId] || null;
    }

    // 獲取所有標籤頁
    getAllTabs() {
        return { ...this.tabs };
    }

    // 獲取標籤頁歷史
    getTabHistory() {
        return [...this.tabHistory];
    }

    // 設置標籤頁切換動畫
    setTabTransition(enable = true) {
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabContents.forEach(content => {
            if (enable) {
                content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            } else {
                content.style.transition = 'none';
            }
        });
        
        console.log('TabManagerModule: Tab transition', enable ? 'enabled' : 'disabled');
    }

    // 重置標籤頁管理器
    reset() {
        this.currentTab = 'department-data';
        this.tabHistory = ['department-data'];
        this.switchTab(this.currentTab, false);
        
        console.log('TabManagerModule: Reset to default state');
    }

    // 銷毀
    destroy() {
        // 移除事件監聽器
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        window.removeEventListener('hashchange', this.handleHashChange);
        
        this.isInitialized = false;
        
        console.log('TabManagerModule: Destroyed');
    }
}

// 匯出模塊
window.TabManagerModule = TabManagerModule;