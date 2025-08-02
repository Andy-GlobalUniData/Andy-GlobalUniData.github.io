/**
 * 標籤頁管理模塊 - Tab Manager Module  
 * 負責管理三個主要標籤頁的切換和狀態
 */

class TabManagerModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.activeTab = 'department-data';
        this.tabs = {
            'department-data': {
                name: '科系資料',
                icon: '📋',
                module: null
            },
            'school-data': {
                name: '學校資料', 
                icon: '🏫',
                module: null
            },
            'map-view': {
                name: '地圖檢視',
                icon: '🗺️', 
                module: null
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

    setup() {
        console.log('TabManagerModule: Setting up...');
        
        this.initTabButtons();
        this.setupTabEventListeners();
        this.registerModules();
        
        console.log('TabManagerModule: Setup complete');
    }

    // 註冊關聯的模塊
    registerModules() {
        // 等待其他模塊初始化完成
        setTimeout(() => {
            this.tabs['department-data'].module = this.core.getModule('department');
            this.tabs['school-data'].module = this.core.getModule('school');
            this.tabs['map-view'].module = this.core.getModule('map');
            
            console.log('TabManagerModule: Modules registered');
        }, 100);
    }

    // 初始化標籤頁按鈕
    initTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        // 確保默認標籤頁是激活狀態
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            if (tabId === this.activeTab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        tabPanels.forEach(panel => {
            if (panel.id === this.activeTab) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        console.log('TabManagerModule: Tab buttons initialized, active tab:', this.activeTab);
    }

    // 設置標籤頁事件監聽器
    setupTabEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });

            // 添加鍵盤支持
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const targetTab = button.getAttribute('data-tab');
                    this.switchTab(targetTab);
                }
            });
        });

        // 添加鍵盤快捷鍵支持
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('department-data');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('school-data');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('map-view');
                        break;
                }
            }
        });

        console.log('TabManagerModule: Event listeners setup complete');
    }

    // 切換標籤頁
    switchTab(targetTab) {
        if (!this.tabs[targetTab]) {
            console.warn(`TabManagerModule: Unknown tab: ${targetTab}`);
            return;
        }

        if (targetTab === this.activeTab) {
            console.log('TabManagerModule: Tab already active:', targetTab);
            return;
        }

        console.log(`TabManagerModule: Switching from ${this.activeTab} to ${targetTab}`);

        const previousTab = this.activeTab;
        this.activeTab = targetTab;

        // 更新UI
        this.updateTabUI(targetTab);

        // 觸發標籤頁切換事件
        this.core.emit('tabChanged', {
            from: previousTab,
            to: targetTab,
            tabInfo: this.tabs[targetTab]
        });

        // 執行標籤頁特定的初始化邏輯
        this.onTabActivated(targetTab);

        // 添加切換動畫效果
        this.addSwitchAnimation(targetTab);
    }

    // 更新標籤頁 UI
    updateTabUI(targetTab) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        // 更新按鈕狀態
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            if (tabId === targetTab) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });

        // 更新面板狀態
        tabPanels.forEach(panel => {
            if (panel.id === targetTab) {
                panel.classList.add('active');
                panel.setAttribute('aria-hidden', 'false');
            } else {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // 標籤頁激活時的處理
    onTabActivated(tabId) {
        const module = this.tabs[tabId]?.module;
        
        switch(tabId) {
            case 'department-data':
                // 科系資料標籤頁激活
                if (module && typeof module.reload === 'function') {
                    module.reload();
                }
                this.updateBreadcrumb('科系資料');
                break;

            case 'school-data':
                // 學校資料標籤頁激活
                if (module && typeof module.reload === 'function') {
                    module.reload();
                }
                this.updateBreadcrumb('學校資料');
                break;

            case 'map-view':
                // 地圖檢視標籤頁激活
                if (module) {
                    // 延遲執行以確保DOM更新完成
                    setTimeout(() => {
                        if (typeof module.onMapTabActivated === 'function') {
                            module.onMapTabActivated();
                        }
                        if (typeof module.invalidateSize === 'function') {
                            module.invalidateSize();
                        }
                    }, 100);
                }
                this.updateBreadcrumb('地圖檢視');
                break;
        }

        // 更新頁面標題
        this.updatePageTitle(this.tabs[tabId].name);
    }

    // 添加切換動畫效果
    addSwitchAnimation(targetTab) {
        const targetPanel = document.getElementById(targetTab);
        if (!targetPanel) return;

        // 添加淡入效果
        targetPanel.style.opacity = '0';
        targetPanel.style.transform = 'translateY(10px)';

        setTimeout(() => {
            targetPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            targetPanel.style.opacity = '1';
            targetPanel.style.transform = 'translateY(0)';

            // 清除過渡效果
            setTimeout(() => {
                targetPanel.style.transition = '';
            }, 300);
        }, 10);
    }

    // 更新麵包屑導航
    updateBreadcrumb(tabName) {
        let breadcrumb = document.getElementById('tab-breadcrumb');
        if (!breadcrumb) {
            // 創建麵包屑容器
            breadcrumb = document.createElement('div');
            breadcrumb.id = 'tab-breadcrumb';
            breadcrumb.className = 'tab-breadcrumb';
            breadcrumb.style.cssText = `
                background: var(--background-color);
                border-bottom: 1px solid var(--border-color);
                padding: 8px 20px;
                font-size: 14px;
                color: var(--text-color-secondary);
            `;

            // 插入到標籤頁容器之前
            const tabsContainer = document.querySelector('.tabs-container');
            if (tabsContainer) {
                tabsContainer.parentNode.insertBefore(breadcrumb, tabsContainer);
            }
        }

        breadcrumb.innerHTML = `
            <span class="breadcrumb-home">🏠 首頁</span>
            <span class="breadcrumb-separator"> > </span>
            <span class="breadcrumb-current">${tabName}</span>
        `;
    }

    // 更新頁面標題
    updatePageTitle(tabName) {
        const originalTitle = 'Andy Global Uni Data';
        document.title = `${tabName} - ${originalTitle}`;
    }

    // 獲取當前活動標籤頁
    getActiveTab() {
        return this.activeTab;
    }

    // 獲取標籤頁信息
    getTabInfo(tabId) {
        return this.tabs[tabId] || null;
    }

    // 獲取所有標籤頁信息
    getAllTabs() {
        return { ...this.tabs };
    }

    // 設置標籤頁狀態（例如顯示載入中、錯誤等）
    setTabState(tabId, state, message = '') {
        const button = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (!button) return;

        // 移除舊的狀態類
        button.classList.remove('loading', 'error', 'success');

        switch(state) {
            case 'loading':
                button.classList.add('loading');
                this.addTabIndicator(button, '⏳', message || '載入中...');
                break;
            case 'error':
                button.classList.add('error');
                this.addTabIndicator(button, '❌', message || '載入失敗');
                break;
            case 'success':
                button.classList.add('success');
                this.removeTabIndicator(button);
                break;
            default:
                this.removeTabIndicator(button);
        }
    }

    // 添加標籤頁指示器
    addTabIndicator(button, icon, message) {
        let indicator = button.querySelector('.tab-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'tab-indicator';
            indicator.style.cssText = `
                margin-left: 5px;
                font-size: 12px;
            `;
            button.appendChild(indicator);
        }
        
        indicator.textContent = icon;
        indicator.title = message;
    }

    // 移除標籤頁指示器
    removeTabIndicator(button) {
        const indicator = button.querySelector('.tab-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // 預載入標籤頁內容
    preloadTab(tabId) {
        const module = this.tabs[tabId]?.module;
        if (module && typeof module.preload === 'function') {
            module.preload();
        }
    }

    // 銷毀
    destroy() {
        // 移除事件監聽器
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

        // 重置狀態
        this.activeTab = 'department-data';
        
        // 移除麵包屑
        const breadcrumb = document.getElementById('tab-breadcrumb');
        if (breadcrumb) {
            breadcrumb.remove();
        }

        // 重置頁面標題
        document.title = 'Andy Global Uni Data';

        console.log('TabManagerModule: Destroyed');
    }
}

// 匯出模塊
window.TabManagerModule = TabManagerModule;
