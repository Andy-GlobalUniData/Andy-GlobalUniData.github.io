/**
 * 主應用程序入口 - App Entry Point
 * 負責初始化和協調所有模塊
 */

class AppManager {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
        this.initStartTime = Date.now();
        
        console.log('AppManager: Application starting...');
    }

    // 初始化應用程序
    async init() {
        try {
            console.log('AppManager: Initializing application...');
            
            // 等待 DOM 準備
            await this.waitForDOM();
            
            // 初始化核心模塊
            await this.initCoreModule();
            
            // 初始化功能模塊
            await this.initFeatureModules();
            
            // 初始化 UI 模塊
            await this.initUIModules();
            
            // 設置全局事件監聽器
            this.setupGlobalEventListeners();
            
            // 應用程序就緒
            this.onAppReady();
            
            this.isInitialized = true;
            
            const initTime = Date.now() - this.initStartTime;
            console.log(`AppManager: Application initialized successfully in ${initTime}ms`);
            
        } catch (error) {
            console.error('AppManager: Application initialization failed:', error);
            this.showInitError(error);
        }
    }

    // 等待 DOM 準備
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // 初始化核心模塊
    async initCoreModule() {
        console.log('AppManager: Initializing core module...');
        
        // 確保 CoreModule 已載入
        if (typeof CoreModule === 'undefined') {
            throw new Error('CoreModule not loaded');
        }
        
        // 創建核心模塊實例
        this.coreModule = new CoreModule();
        this.modules.set('core', this.coreModule);
        
        // 初始化核心模塊
        await this.coreModule.init();
        
        // 等待核心模塊就緒
        await new Promise((resolve) => {
            this.coreModule.on('coreReady', resolve);
        });
        
        console.log('AppManager: Core module initialized');
    }

    // 初始化功能模塊
    async initFeatureModules() {
        console.log('AppManager: Initializing feature modules...');
        
        // 科系資料模塊
        if (typeof DepartmentModule !== 'undefined') {
            const departmentModule = new DepartmentModule(this.coreModule);
            this.modules.set('department', departmentModule);
            departmentModule.init();
            console.log('AppManager: Department module initialized');
        }
        
        // 學校資料模塊
        if (typeof SchoolModule !== 'undefined') {
            const schoolModule = new SchoolModule(this.coreModule);
            this.modules.set('school', schoolModule);
            schoolModule.init();
            console.log('AppManager: School module initialized');
        }
        
        // 地圖檢視模塊
        if (typeof MapModule !== 'undefined') {
            const mapModule = new MapModule(this.coreModule);
            this.modules.set('map', mapModule);
            mapModule.init();
            console.log('AppManager: Map module initialized');
        }
        
        // 匯出管理模塊
        if (typeof ExportManagerModule !== 'undefined') {
            const exportModule = new ExportManagerModule(this.coreModule);
            this.modules.set('export', exportModule);
            exportModule.init();
            console.log('AppManager: Export module initialized');
        }
    }

    // 初始化 UI 模塊
    async initUIModules() {
        console.log('AppManager: Initializing UI modules...');
        
        // 標籤頁管理模塊
        if (typeof TabManagerModule !== 'undefined') {
            const tabManagerModule = new TabManagerModule(this.coreModule);
            this.modules.set('tabManager', tabManagerModule);
            tabManagerModule.init();
            console.log('AppManager: Tab manager module initialized');
        }
        
        // 初始化其他現有的 UI 功能
        this.initLegacyUIFeatures();
    }

    // 初始化現有的 UI 功能
    initLegacyUIFeatures() {
        // 主題切換
        this.initThemeToggle();
        
        // 浮動導航
        this.initFloatingNav();
        
        // 更新日誌
        this.initChangelog();
        
        // GitHub 推送時間
        this.initGitHubPushTime();
        
        console.log('AppManager: Legacy UI features initialized');
    }

    // 初始化主題切換
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                const isDark = document.body.classList.contains('dark-theme');
                
                // 更新按鈕文字
                const icon = themeToggle.querySelector('.icon');
                const text = themeToggle.querySelector('.text');
                if (icon && text) {
                    icon.textContent = isDark ? '☀️' : '🌙';
                    text.textContent = isDark ? '淺色模式' : '深色模式';
                }
                
                // 保存主題設置
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
            
            // 載入保存的主題
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                const icon = themeToggle.querySelector('.icon');
                const text = themeToggle.querySelector('.text');
                if (icon && text) {
                    icon.textContent = '☀️';
                    text.textContent = '淺色模式';
                }
            }
        }
    }

    // 初始化浮動導航
    initFloatingNav() {
        const navToggle = document.getElementById('floating-nav-toggle');
        const nav = document.getElementById('floating-nav');
        
        if (navToggle && nav) {
            navToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
            
            // 點擊導航鏈接後關閉導航
            const navLinks = nav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // 初始化更新日誌
    initChangelog() {
        const showChangelogBtn = document.getElementById('show-changelog');
        const changelogModal = document.getElementById('changelog-modal');
        const closeBtn = changelogModal?.querySelector('.changelog-close');
        
        if (showChangelogBtn && changelogModal) {
            showChangelogBtn.addEventListener('click', () => {
                changelogModal.style.display = 'block';
                this.loadChangelog();
            });
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    changelogModal.style.display = 'none';
                });
            }
            
            // 點擊模態框背景關閉
            changelogModal.addEventListener('click', (e) => {
                if (e.target === changelogModal) {
                    changelogModal.style.display = 'none';
                }
            });
        }
    }

    // 載入更新日誌
    loadChangelog() {
        const changelogList = document.getElementById('changelog-list');
        if (!changelogList) return;
        
        // 這裡可以實作從 API 或檔案載入更新日誌
        const mockChangelog = [
            {
                version: 'v2.0.0',
                date: '2025-08-02',
                changes: [
                    '✨ 重構為模塊化架構',
                    '🏫 獨立的學校資料模塊',
                    '📋 獨立的科系資料模塊',
                    '🗺️ 獨立的地圖檢視模塊',
                    '⚡ 性能優化和載入速度提升'
                ]
            },
            {
                version: 'v1.5.0',
                date: '2025-07-30',
                changes: [
                    '🔍 新增科系搜尋功能',
                    '📊 改進資料篩選系統',
                    '🎨 UI/UX 優化'
                ]
            }
        ];
        
        const html = mockChangelog.map(entry => `
            <div class="changelog-entry">
                <div class="changelog-header">
                    <h4>${entry.version}</h4>
                    <span class="changelog-date">${entry.date}</span>
                </div>
                <ul class="changelog-items">
                    ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>
        `).join('');
        
        changelogList.innerHTML = html;
    }

    // 初始化 GitHub 推送時間
    initGitHubPushTime() {
        const pushTimeElement = document.getElementById('github-push-time');
        if (pushTimeElement) {
            // 這裡可以實作從 GitHub API 獲取最後推送時間
            // 暫時顯示當前時間
            const now = new Date();
            pushTimeElement.textContent = now.toLocaleString('zh-TW');
            pushTimeElement.classList.remove('loading');
        }
    }

    // 設置全局事件監聽器
    setupGlobalEventListeners() {
        // 錯誤處理
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });
        
        // Promise 拒絕處理
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
        
        // 視窗大小變化
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        console.log('AppManager: Global event listeners setup complete');
    }

    // 應用程序就緒
    onAppReady() {
        console.log('AppManager: Application is ready!');
        
        // 觸發應用程序就緒事件
        const readyEvent = new CustomEvent('appReady', {
            detail: {
                modules: Array.from(this.modules.keys()),
                initTime: Date.now() - this.initStartTime
            }
        });
        document.dispatchEvent(readyEvent);
        
        // 隱藏載入指示器
        this.hideLoadingIndicator();
        
        // 顯示歡迎提示
        this.showWelcomeToast();
    }

    // 隱藏載入指示器
    hideLoadingIndicator() {
        const loadingIndicators = document.querySelectorAll('.loading-placeholder');
        loadingIndicators.forEach(indicator => {
            if (indicator.textContent === '載入中...') {
                indicator.style.display = 'none';
            }
        });
    }

    // 顯示歡迎提示
    showWelcomeToast() {
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary-color);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-weight: 500;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            toast.textContent = '🎉 Andy Global Uni Data 已就緒！';
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 500);
    }

    // 處理全局錯誤
    handleGlobalError(error) {
        console.error('AppManager: Handling global error:', error);
        
        // 可以在這裡實作錯誤報告、用戶通知等
        const errorToast = document.createElement('div');
        errorToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color, #ef4444);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 500;
        `;
        errorToast.textContent = '❌ 發生錯誤，請重新整理頁面';
        
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
            document.body.removeChild(errorToast);
        }, 5000);
    }

    // 處理視窗大小變化
    handleWindowResize() {
        // 通知地圖模塊更新大小
        const mapModule = this.modules.get('map');
        if (mapModule && typeof mapModule.invalidateSize === 'function') {
            mapModule.invalidateSize();
        }
    }

    // 處理頁面可見性變化
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('AppManager: Page hidden');
        } else {
            console.log('AppManager: Page visible');
            // 頁面重新可見時可能需要重新整理某些資料
        }
    }

    // 顯示初始化錯誤
    showInitError(error) {
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        errorContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #1f2937; border-radius: 12px; max-width: 500px;">
                <h2 style="color: #ef4444; margin-bottom: 20px;">❌ 應用程序載入失敗</h2>
                <p style="margin-bottom: 20px;">很抱歉，應用程序無法正常載入。</p>
                <p style="font-size: 14px; color: #9ca3af; margin-bottom: 30px;">錯誤詳情: ${error.message}</p>
                <button onclick="location.reload()" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">重新載入頁面</button>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }

    // 獲取模塊
    getModule(name) {
        return this.modules.get(name);
    }

    // 獲取所有模塊
    getAllModules() {
        return new Map(this.modules);
    }

    // 應用程序統計
    getAppStats() {
        return {
            isInitialized: this.isInitialized,
            moduleCount: this.modules.size,
            modules: Array.from(this.modules.keys()),
            initTime: Date.now() - this.initStartTime,
            version: '2.0.0'
        };
    }

    // 重啟應用程序
    async restart() {
        console.log('AppManager: Restarting application...');
        
        // 銷毀所有模塊
        this.destroy();
        
        // 重新初始化
        await this.init();
    }

    // 銷毀應用程序
    destroy() {
        console.log('AppManager: Destroying application...');
        
        // 銷毀所有模塊
        this.modules.forEach((module, name) => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
                console.log(`AppManager: Destroyed module '${name}'`);
            }
        });
        
        this.modules.clear();
        this.isInitialized = false;
        
        console.log('AppManager: Application destroyed');
    }
}

// 創建全局應用程序實例
window.AppManager = AppManager;
window.app = new AppManager();

// 自動初始化應用程序
window.app.init();
