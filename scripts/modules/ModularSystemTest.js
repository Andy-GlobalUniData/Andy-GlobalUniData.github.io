/**
 * 模塊化系統測試框架 - Modular System Test
 * 用於測試和驗證所有模塊的功能和整合性
 */

class ModularSystemTest {
    constructor() {
        this.tests = [];
        this.results = [];
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        
        // 測試配置
        this.config = {
            timeoutMs: 10000, // 10秒超時
            retryCount: 3,
            enablePerformanceTest: true,
            enableIntegrationTest: true,
            enableUITest: true
        };
        
        this.initializeTests();
        console.log('ModularSystemTest: Initialized with', this.tests.length, 'tests');
    }

    // 初始化測試用例
    initializeTests() {
        // 核心模塊測試
        this.addTest('CoreModule Initialization', this.testCoreModuleInit.bind(this));
        this.addTest('CoreModule Data Loading', this.testCoreModuleDataLoading.bind(this));
        this.addTest('CoreModule Filter System', this.testCoreModuleFilters.bind(this));
        
        // 科系模塊測試
        this.addTest('DepartmentModule Initialization', this.testDepartmentModuleInit.bind(this));
        this.addTest('DepartmentModule DataTable', this.testDepartmentModuleDataTable.bind(this));
        this.addTest('DepartmentModule Search', this.testDepartmentModuleSearch.bind(this));
        
        // 學校模塊測試
        this.addTest('SchoolModule Initialization', this.testSchoolModuleInit.bind(this));
        this.addTest('SchoolModule Data Processing', this.testSchoolModuleDataProcessing.bind(this));
        
        // 地圖模塊測試
        this.addTest('MapModule Initialization', this.testMapModuleInit.bind(this));
        this.addTest('MapModule Leaflet Integration', this.testMapModuleLeaflet.bind(this));
        
        // 標籤頁管理測試
        this.addTest('TabManagerModule Initialization', this.testTabManagerInit.bind(this));
        this.addTest('TabManagerModule Tab Switching', this.testTabManagerSwitching.bind(this));
        
        // 匯出管理測試
        this.addTest('ExportManagerModule Initialization', this.testExportManagerInit.bind(this));
        
        // 應用程式管理測試
        this.addTest('AppManager Initialization', this.testAppManagerInit.bind(this));
        
        // 整合測試
        this.addTest('Module Integration', this.testModuleIntegration.bind(this));
        this.addTest('Event System', this.testEventSystem.bind(this));
        this.addTest('Data Flow', this.testDataFlow.bind(this));
        
        // 性能測試
        if (this.config.enablePerformanceTest) {
            this.addTest('Performance - Data Loading', this.testPerformanceDataLoading.bind(this));
            this.addTest('Performance - Table Rendering', this.testPerformanceTableRendering.bind(this));
            this.addTest('Performance - Memory Usage', this.testPerformanceMemoryUsage.bind(this));
        }
        
        // UI 測試
        if (this.config.enableUITest) {
            this.addTest('UI - Element Existence', this.testUIElementExistence.bind(this));
            this.addTest('UI - Tab Functionality', this.testUITabFunctionality.bind(this));
        }
    }

    // 加入測試用例
    addTest(name, testFunction) {
        this.tests.push({
            name: name,
            function: testFunction,
            timeout: this.config.timeoutMs
        });
    }

    // 執行所有測試
    async runAllTests() {
        if (this.isRunning) {
            console.warn('ModularSystemTest: Tests are already running');
            return this.results;
        }

        this.isRunning = true;
        this.startTime = Date.now();
        this.results = [];

        console.log('ModularSystemTest: Starting test suite with', this.tests.length, 'tests');

        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            console.log(`ModularSystemTest: Running test ${i + 1}/${this.tests.length}: ${test.name}`);
            
            const result = await this.runSingleTest(test);
            this.results.push(result);
            
            // 如果是關鍵測試失敗，可以選擇停止
            if (!result.passed && test.name.includes('Initialization')) {
                console.warn(`ModularSystemTest: Critical test failed: ${test.name}`);
            }
        }

        this.endTime = Date.now();
        this.isRunning = false;

        const summary = this.generateSummary();
        console.log('ModularSystemTest: Test suite completed');
        console.log(summary);

        return this.results;
    }

    // 執行單一測試
    async runSingleTest(test) {
        const startTime = Date.now();
        const result = {
            name: test.name,
            passed: false,
            error: null,
            duration: 0,
            details: null
        };

        try {
            // 設置超時
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), test.timeout);
            });

            // 執行測試
            const testPromise = test.function();
            const testResult = await Promise.race([testPromise, timeoutPromise]);

            result.passed = true;
            result.details = testResult;

        } catch (error) {
            result.passed = false;
            result.error = error.message;
            console.error(`ModularSystemTest: Test failed - ${test.name}:`, error);
        }

        result.duration = Date.now() - startTime;
        return result;
    }

    // 測試 CoreModule 初始化
    async testCoreModuleInit() {
        const coreModule = window.appManager?.getModule('core');
        if (!coreModule) {
            throw new Error('CoreModule not found');
        }
        
        if (!coreModule.isInitialized) {
            throw new Error('CoreModule not initialized');
        }
        
        return { status: 'CoreModule initialized successfully' };
    }

    // 測試 CoreModule 數據載入
    async testCoreModuleDataLoading() {
        const coreModule = window.appManager?.getModule('core');
        if (!coreModule) {
            throw new Error('CoreModule not found');
        }
        
        if (!coreModule.data || coreModule.data.length === 0) {
            throw new Error('No data loaded in CoreModule');
        }
        
        if (!coreModule.schoolData || coreModule.schoolData.length === 0) {
            throw new Error('No school data loaded in CoreModule');
        }
        
        return {
            dataCount: coreModule.data.length,
            schoolCount: coreModule.schoolData.length
        };
    }

    // 測試 CoreModule 篩選系統
    async testCoreModuleFilters() {
        const coreModule = window.appManager?.getModule('core');
        if (!coreModule) {
            throw new Error('CoreModule not found');
        }
        
        // 測試設置篩選器
        const originalCount = coreModule.data.length;
        
        // 設置國家篩選器
        coreModule.setFilter('countries', ['美國']);
        const filteredData = coreModule.applyFilters();
        
        if (filteredData.length >= originalCount) {
            throw new Error('Filter did not reduce data');
        }
        
        // 清除篩選器
        coreModule.clearAllFilters();
        const clearedData = coreModule.applyFilters();
        
        if (clearedData.length !== originalCount) {
            throw new Error('Clear filters did not restore original data');
        }
        
        return {
            originalCount: originalCount,
            filteredCount: filteredData.length,
            clearedCount: clearedData.length
        };
    }

    // 測試 DepartmentModule 初始化
    async testDepartmentModuleInit() {
        const departmentModule = window.appManager?.getModule('department');
        if (!departmentModule) {
            throw new Error('DepartmentModule not found');
        }
        
        if (!departmentModule.isInitialized) {
            throw new Error('DepartmentModule not initialized');
        }
        
        return { status: 'DepartmentModule initialized successfully' };
    }

    // 測試 DepartmentModule DataTable
    async testDepartmentModuleDataTable() {
        const departmentModule = window.appManager?.getModule('department');
        if (!departmentModule) {
            throw new Error('DepartmentModule not found');
        }
        
        if (!departmentModule.dataTable) {
            throw new Error('DataTable not initialized');
        }
        
        const rowCount = departmentModule.dataTable.rows().count();
        if (rowCount === 0) {
            throw new Error('DataTable has no rows');
        }
        
        return { rowCount: rowCount };
    }

    // 測試 DepartmentModule 搜尋
    async testDepartmentModuleSearch() {
        const departmentModule = window.appManager?.getModule('department');
        if (!departmentModule) {
            throw new Error('DepartmentModule not found');
        }
        
        // 模擬搜尋
        departmentModule.performSearch('電腦');
        
        // 等待搜尋完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { status: 'Search functionality tested' };
    }

    // 測試 SchoolModule 初始化
    async testSchoolModuleInit() {
        const schoolModule = window.appManager?.getModule('school');
        if (!schoolModule) {
            throw new Error('SchoolModule not found');
        }
        
        if (!schoolModule.isInitialized) {
            throw new Error('SchoolModule not initialized');
        }
        
        return { status: 'SchoolModule initialized successfully' };
    }

    // 測試 SchoolModule 數據處理
    async testSchoolModuleDataProcessing() {
        const schoolModule = window.appManager?.getModule('school');
        if (!schoolModule) {
            throw new Error('SchoolModule not found');
        }
        
        if (!schoolModule.schoolDataTable) {
            throw new Error('School DataTable not initialized');
        }
        
        const schoolCount = schoolModule.schoolDataTable.rows().count();
        return { schoolCount: schoolCount };
    }

    // 測試 MapModule 初始化
    async testMapModuleInit() {
        const mapModule = window.appManager?.getModule('map');
        if (!mapModule) {
            throw new Error('MapModule not found');
        }
        
        if (!mapModule.isInitialized) {
            throw new Error('MapModule not initialized');
        }
        
        return { status: 'MapModule initialized successfully' };
    }

    // 測試 MapModule Leaflet 整合
    async testMapModuleLeaflet() {
        const mapModule = window.appManager?.getModule('map');
        if (!mapModule) {
            throw new Error('MapModule not found');
        }
        
        if (!mapModule.leafletLoaded) {
            throw new Error('Leaflet library not loaded');
        }
        
        if (!window.L) {
            throw new Error('Leaflet global object not found');
        }
        
        return { status: 'Leaflet integration successful' };
    }

    // 測試 TabManagerModule 初始化
    async testTabManagerInit() {
        const tabManager = window.appManager?.getModule('tabmanager');
        if (!tabManager) {
            throw new Error('TabManagerModule not found');
        }
        
        if (!tabManager.isInitialized) {
            throw new Error('TabManagerModule not initialized');
        }
        
        return { status: 'TabManagerModule initialized successfully' };
    }

    // 測試 TabManagerModule 標籤頁切換
    async testTabManagerSwitching() {
        const tabManager = window.appManager?.getModule('tabmanager');
        if (!tabManager) {
            throw new Error('TabManagerModule not found');
        }
        
        const originalTab = tabManager.getCurrentTab();
        
        // 測試切換到不同標籤頁
        tabManager.switchTab('school-data');
        if (tabManager.getCurrentTab() !== 'school-data') {
            throw new Error('Tab switching failed');
        }
        
        // 切回原始標籤頁
        tabManager.switchTab(originalTab);
        
        return { status: 'Tab switching tested successfully' };
    }

    // 測試 ExportManagerModule 初始化
    async testExportManagerInit() {
        const exportManager = window.appManager?.getModule('exportmanager');
        if (!exportManager) {
            throw new Error('ExportManagerModule not found');
        }
        
        if (!exportManager.isInitialized) {
            throw new Error('ExportManagerModule not initialized');
        }
        
        return { status: 'ExportManagerModule initialized successfully' };
    }

    // 測試 AppManager 初始化
    async testAppManagerInit() {
        if (!window.appManager) {
            throw new Error('AppManager not found');
        }
        
        if (!window.appManager.isInitialized) {
            throw new Error('AppManager not initialized');
        }
        
        const moduleCount = window.appManager.getAllModules().size;
        if (moduleCount === 0) {
            throw new Error('No modules registered in AppManager');
        }
        
        return { moduleCount: moduleCount };
    }

    // 測試模塊整合
    async testModuleIntegration() {
        const coreModule = window.appManager?.getModule('core');
        const departmentModule = window.appManager?.getModule('department');
        const schoolModule = window.appManager?.getModule('school');
        
        if (!coreModule || !departmentModule || !schoolModule) {
            throw new Error('Required modules not found');
        }
        
        // 測試模塊間的數據同步
        const coreDataCount = coreModule.data.length;
        const departmentDataCount = departmentModule.getCurrentData().length;
        
        if (Math.abs(coreDataCount - departmentDataCount) > 100) {
            throw new Error('Data synchronization issue between modules');
        }
        
        return {
            coreDataCount: coreDataCount,
            departmentDataCount: departmentDataCount
        };
    }

    // 測試事件系統
    async testEventSystem() {
        const coreModule = window.appManager?.getModule('core');
        if (!coreModule) {
            throw new Error('CoreModule not found');
        }
        
        let eventReceived = false;
        
        // 設置事件監聽器
        const testListener = () => {
            eventReceived = true;
        };
        
        coreModule.on('testEvent', testListener);
        
        // 觸發事件
        coreModule.emit('testEvent', { test: true });
        
        // 等待事件處理
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!eventReceived) {
            throw new Error('Event system not working');
        }
        
        return { status: 'Event system working correctly' };
    }

    // 測試數據流
    async testDataFlow() {
        const coreModule = window.appManager?.getModule('core');
        const departmentModule = window.appManager?.getModule('department');
        
        if (!coreModule || !departmentModule) {
            throw new Error('Required modules not found');
        }
        
        // 設置篩選器並測試數據流
        const originalCount = departmentModule.getCurrentData().length;
        
        coreModule.setFilter('countries', ['英國']);
        
        // 等待數據更新
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const filteredCount = departmentModule.getCurrentData().length;
        
        // 清除篩選器
        coreModule.clearAllFilters();
        
        if (filteredCount >= originalCount) {
            throw new Error('Data flow not working properly');
        }
        
        return {
            originalCount: originalCount,
            filteredCount: filteredCount
        };
    }

    // 性能測試 - 數據載入
    async testPerformanceDataLoading() {
        const startTime = performance.now();
        
        const coreModule = window.appManager?.getModule('core');
        if (!coreModule) {
            throw new Error('CoreModule not found');
        }
        
        await coreModule.loadData();
        
        const loadTime = performance.now() - startTime;
        
        if (loadTime > 5000) { // 5秒以上算慢
            throw new Error(`Data loading too slow: ${loadTime}ms`);
        }
        
        return { loadTime: loadTime };
    }

    // 性能測試 - 表格渲染
    async testPerformanceTableRendering() {
        const departmentModule = window.appManager?.getModule('department');
        if (!departmentModule || !departmentModule.dataTable) {
            throw new Error('DepartmentModule or DataTable not found');
        }
        
        const startTime = performance.now();
        
        // 觸發表格重新繪製
        departmentModule.dataTable.draw();
        
        const renderTime = performance.now() - startTime;
        
        if (renderTime > 1000) { // 1秒以上算慢
            throw new Error(`Table rendering too slow: ${renderTime}ms`);
        }
        
        return { renderTime: renderTime };
    }

    // 性能測試 - 記憶體使用
    async testPerformanceMemoryUsage() {
        if (!performance.memory) {
            return { status: 'Memory API not available' };
        }
        
        const memoryInfo = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        // 檢查記憶體使用率
        const memoryUsageRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
        
        if (memoryUsageRatio > 0.8) { // 80%以上算高
            throw new Error(`Memory usage too high: ${(memoryUsageRatio * 100).toFixed(2)}%`);
        }
        
        return memoryInfo;
    }

    // UI 測試 - 元素存在
    async testUIElementExistence() {
        const requiredElements = [
            'json-table',
            'school-data-table',
            'school-map',
            'department-search',
            'country-filters',
            'school-filters'
        ];
        
        const missingElements = [];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                missingElements.push(elementId);
            }
        }
        
        if (missingElements.length > 0) {
            throw new Error(`Missing UI elements: ${missingElements.join(', ')}`);
        }
        
        return { status: 'All required UI elements found' };
    }

    // UI 測試 - 標籤頁功能
    async testUITabFunctionality() {
        const tabButtons = document.querySelectorAll('.tab-button');
        if (tabButtons.length === 0) {
            throw new Error('No tab buttons found');
        }
        
        // 測試標籤頁切換
        const firstTab = tabButtons[0];
        firstTab.click();
        
        // 等待切換完成
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!firstTab.classList.contains('active')) {
            throw new Error('Tab button activation not working');
        }
        
        return { tabCount: tabButtons.length };
    }

    // 生成測試結果摘要
    generateSummary() {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const totalDuration = this.endTime - this.startTime;
        const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;
        
        return {
            totalTests: totalTests,
            passedTests: passedTests,
            failedTests: failedTests,
            successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) + '%' : '0%',
            totalDuration: totalDuration + 'ms',
            averageDuration: averageDuration.toFixed(2) + 'ms',
            timestamp: new Date().toISOString()
        };
    }

    // 生成詳細報告
    generateReport() {
        const summary = this.generateSummary();
        
        const report = {
            summary: summary,
            results: this.results,
            failedTests: this.results.filter(r => !r.passed),
            performanceTests: this.results.filter(r => r.name.includes('Performance')),
            integrationTests: this.results.filter(r => r.name.includes('Integration') || r.name.includes('Event') || r.name.includes('Data Flow'))
        };
        
        return report;
    }

    // 顯示測試結果
    displayResults() {
        const report = this.generateReport();
        
        console.group('Modular System Test Results');
        console.log('Summary:', report.summary);
        
        if (report.failedTests.length > 0) {
            console.group('Failed Tests');
            report.failedTests.forEach(test => {
                console.error(`❌ ${test.name}: ${test.error}`);
            });
            console.groupEnd();
        }
        
        if (report.performanceTests.length > 0) {
            console.group('Performance Tests');
            report.performanceTests.forEach(test => {
                const status = test.passed ? '✅' : '❌';
                console.log(`${status} ${test.name}: ${test.duration}ms`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        return report;
    }

    // 快速測試（只測試關鍵功能）
    async runQuickTest() {
        const quickTests = this.tests.filter(test => 
            test.name.includes('Initialization') || 
            test.name.includes('Data Loading') ||
            test.name === 'Module Integration'
        );
        
        const originalTests = this.tests;
        this.tests = quickTests;
        
        const results = await this.runAllTests();
        
        this.tests = originalTests;
        return results;
    }
}

// 全局測試實例
window.modularSystemTest = new ModularSystemTest();

// 自動測試功能（在開發模式下）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 等待應用程式初始化完成後自動執行測試
    setTimeout(() => {
        if (window.appManager && window.appManager.isInitialized) {
            console.log('ModularSystemTest: Starting automatic test suite...');
            window.modularSystemTest.runQuickTest().then(() => {
                console.log('ModularSystemTest: Automatic test completed');
            });
        }
    }, 3000); // 等待 3 秒讓應用程式完全初始化
}

// 匯出測試框架
window.ModularSystemTest = ModularSystemTest;