/**
 * 應用程式管理器 - App Manager
 * 負責統一管理所有模塊和應用程式生命周期
 */

class AppManager {
    constructor() {
        this.modules = new Map();
        this.coreModule = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.startTime = Date.now();
        
        // 應用程式配置
        this.config = {
            appName: 'Andy Global Uni Data',
            version: '2.0.0',
            modules: [
                'CoreModule',
                'DepartmentModule', 
                'SchoolModule',
                'MapModule',
                'TabManagerModule',
                'ExportManagerModule'
            ],
            features: {
                autoSave: true,
                darkMode: false,
                analytics: false
            }
        };
        
        console.log('AppManager: Initialized');
    }

    // 初始化應用程式
    async init() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }

    // 執行初始化
    async performInitialization() {
        try {
            console.log('AppManager: Starting application initialization...');
            
            // 1. 初始化核心模塊
            await this.initCoreModule();
            
            // 2. 初始化功能模塊
            await this.initFeatureModules();
            
            // 3. 設置全局事件監聽器
            this.setupGlobalEventListeners();
            
            // 4. 設置 UI 及主題
            this.setupUIAndTheme();
            
            // 5. 載入數據
            await this.loadInitialData();
            
            // 6. 完成初始化
            this.completeInitialization();
            
            console.log('AppManager: Application initialization completed successfully');
            
        } catch (error) {
            console.error('AppManager: Application initialization failed:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }

    // 初始化核心模塊
    async initCoreModule() {
        console.log('AppManager: Initializing core module...');
        
        if (!window.CoreModule) {
            throw new Error('CoreModule not found. Please ensure CoreModule.js is loaded.');
        }
        
        this.coreModule = new CoreModule();
        this.modules.set('core', this.coreModule);
        
        await this.coreModule.init();
        
        console.log('AppManager: Core module initialized successfully');
    }

    // 初始化功能模塊
    async initFeatureModules() {
        console.log('AppManager: Initializing feature modules...');
        
        const moduleClasses = {
            'DepartmentModule': window.DepartmentModule,
            'SchoolModule': window.SchoolModule,
            'MapModule': window.MapModule,
            'TabManagerModule': window.TabManagerModule,
            'ExportManagerModule': window.ExportManagerModule
        };
        
        const initPromises = [];
        
        for (const [moduleName, ModuleClass] of Object.entries(moduleClasses)) {
            if (!ModuleClass) {
                console.warn(`AppManager: ${moduleName} not found, skipping...`);
                continue;
            }
            
            try {
                console.log(`AppManager: Initializing ${moduleName}...`);
                
                const moduleInstance = new ModuleClass(this.coreModule);
                const moduleKey = moduleName.replace('Module', '').toLowerCase();
                
                this.modules.set(moduleKey, moduleInstance);
                
                // 非同步初始化模塊
                const initPromise = Promise.resolve(moduleInstance.init());
                initPromises.push(initPromise);
                
                console.log(`AppManager: ${moduleName} initialized`);
                
            } catch (error) {
                console.error(`AppManager: Failed to initialize ${moduleName}:`, error);
                // 繼續初始化其他模塊
            }
        }
        
        // 等待所有模塊初始化完成
        await Promise.allSettled(initPromises);
        
        console.log('AppManager: Feature modules initialization completed');
    }

    // 設置全局事件監聽器
    setupGlobalEventListeners() {
        console.log('AppManager: Setting up global event listeners...');
        
        // 監聽窗口大小變化
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        // 監聽網路狀態變化
        window.addEventListener('online', this.handleOnlineStatus.bind(this));
        window.addEventListener('offline', this.handleOfflineStatus.bind(this));
        
        // 監聽網頁離開
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // 監聽鍵盤快捷鍵
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // 監聽核心模塊事件
        if (this.coreModule) {
            this.coreModule.on('error', this.handleCoreError.bind(this));
            this.coreModule.on('dataLoaded', this.handleDataLoaded.bind(this));
        }
        
        console.log('AppManager: Global event listeners setup completed');
    }

    // 設置 UI 和主題
    setupUIAndTheme() {
        console.log('AppManager: Setting up UI and theme...');
        
        // 設置應用程式標題
        document.title = `${this.config.appName} v${this.config.version}`;
        
        // 加入版本信息
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = `v${this.config.version}`;
        }
        
        // 加入加載狀態提示
        this.updateLoadingStatus('初始化完成', 100);
        
        console.log('AppManager: UI and theme setup completed');
    }

    // 載入初始數據
    async loadInitialData() {
        console.log('AppManager: Loading initial data...');
        
        if (this.coreModule) {
            this.updateLoadingStatus('正在載入數據...', 80);
            await this.coreModule.loadData();
            this.updateLoadingStatus('數據載入完成', 90);
        }
        
        console.log('AppManager: Initial data loaded successfully');
    }

    // 完成初始化
    completeInitialization() {
        this.isInitialized = true;
        
        const initTime = Date.now() - this.startTime;
        console.log(`AppManager: Initialization completed in ${initTime}ms`);
        
        // 隱藏加載畫面
        this.hideLoadingScreen();
        
        // 觸發初始化完成事件
        if (this.coreModule) {
            this.coreModule.emit('appReady', {
                initTime: initTime,
                modules: Array.from(this.modules.keys()),
                version: this.config.version
            });
        }
        
        // 顯示歡迎信息
        this.showWelcomeMessage();
    }

    // 更新加載狀態
    updateLoadingStatus(message, progress = 0) {
        const statusElement = document.getElementById('loading-status');
        const progressElement = document.getElementById('loading-progress');
        
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
        
        console.log(`AppManager: Loading status - ${message} (${progress}%)`);
    }

    // 隱藏加載畫面
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // 顯示歡迎信息
    showWelcomeMessage() {
        const totalData = this.coreModule ? this.coreModule.data.length : 0;
        const totalSchools = this.coreModule ? this.coreModule.schoolData.length : 0;
        
        console.log(`
🎉 歡迎使用 ${this.config.appName}!
📊 已載入 ${totalData} 筆科系資料
🏫 已載入 ${totalSchools} 所學校資料
🚀 所有功能已就緒！
        `);
    }

    // 處理初始化錯誤
    handleInitializationError(error) {
        console.error('AppManager: Initialization error:', error);
        
        // 顯示錯誤信息
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = `初始化失敗: ${error.message}`;
            errorElement.style.display = 'block';
        }
        
        // 隱藏加載畫面
        this.hideLoadingScreen();
    }

    // 處理窗口大小變化
    handleWindowResize() {
        // 通知所有模塊窗口大小已變化
        if (this.coreModule) {
            this.coreModule.emit('windowResize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }

    // 處理網路連線狀態
    handleOnlineStatus() {
        console.log('AppManager: Network online');
        if (this.coreModule) {
            this.coreModule.emit('networkStatus', { online: true });
        }
    }

    handleOfflineStatus() {
        console.log('AppManager: Network offline');
        if (this.coreModule) {
            this.coreModule.emit('networkStatus', { online: false });
        }
    }

    // 處理網頁離開
    handleBeforeUnload(event) {
        // 如果有未儲存的數據，提示用戶
        const hasUnsavedData = this.hasUnsavedData();
        if (hasUnsavedData) {
            const message = '您有未儲存的變更，確定要離開嗎？';
            event.returnValue = message;
            return message;
        }
    }

    // 處理全局鍵盤事件
    handleGlobalKeydown(event) {
        // Ctrl/Cmd + K: 快速搜尋
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusSearch();
        }
        
        // Ctrl/Cmd + R: 重新載入數據
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            this.reloadData();
        }
        
        // ESC: 關閉模態窗或清除搜尋
        if (event.key === 'Escape') {
            this.handleEscapeKey();
        }
    }

    // 處理核心模塊錯誤
    handleCoreError(event) {
        const error = event.detail;
        console.error('AppManager: Core module error:', error);
        
        // 可以在這裡加入錯誤報告或統計
    }

    // 處理數據載入完成
    handleDataLoaded(event) {
        const { data, schoolData } = event.detail;
        console.log(`AppManager: Data loaded - ${data.length} departments, ${schoolData.length} schools`);
    }

    // 聚焦搜尋框
    focusSearch() {
        const searchInput = document.getElementById('department-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // 重新載入數據
    async reloadData() {
        if (this.coreModule) {
            console.log('AppManager: Reloading data...');
            await this.coreModule.loadData();
            console.log('AppManager: Data reloaded successfully');
        }
    }

    // 處理 ESC 鍵
    handleEscapeKey() {
        // 關閉模態窗
        const modals = document.querySelectorAll('.modal, .export-modal');
        modals.forEach(modal => {
            if (modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        });
        
        // 清除搜尋
        const searchInput = document.getElementById('department-search');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    // 檢查是否有未儲存數據
    hasUnsavedData() {
        // 目前版本沒有未儲存狀態，這裡可以擴展
        return false;
    }

    // 獲取模塊
    getModule(moduleKey) {
        return this.modules.get(moduleKey);
    }

    // 獲取所有模塊
    getAllModules() {
        return new Map(this.modules);
    }

    // 獲取應用程式狀態
    getAppStatus() {
        return {
            isInitialized: this.isInitialized,
            modules: Array.from(this.modules.keys()),
            version: this.config.version,
            startTime: this.startTime,
            uptime: Date.now() - this.startTime
        };
    }

    // 重啟應用程式
    async restart() {
        console.log('AppManager: Restarting application...');
        
        // 銷毀所有模塊
        this.destroy();
        
        // 重新初始化
        this.isInitialized = false;
        this.initializationPromise = null;
        this.startTime = Date.now();
        
        await this.init();
        
        console.log('AppManager: Application restarted successfully');
    }

    // 銷毀應用程式
    destroy() {
        console.log('AppManager: Destroying application...');
        
        // 銷毀所有模塊
        for (const [key, module] of this.modules) {
            try {
                if (module && typeof module.destroy === 'function') {
                    module.destroy();
                }
            } catch (error) {
                console.error(`AppManager: Error destroying module ${key}:`, error);
            }
        }
        
        // 清理模塊映射
        this.modules.clear();
        this.coreModule = null;
        
        // 移除事件監聽器
        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('online', this.handleOnlineStatus);
        window.removeEventListener('offline', this.handleOfflineStatus);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        
        this.isInitialized = false;
        
        console.log('AppManager: Application destroyed');
    }
}

// 全局應用程式管理器實例
window.appManager = new AppManager();

// DOM 載入完成後自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appManager.init().catch(error => {
            console.error('Failed to initialize application:', error);
        });
    });
} else {
    // DOM 已經載入完成
    window.appManager.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
}

// 匯出應用程式管理器
window.AppManager = AppManager;