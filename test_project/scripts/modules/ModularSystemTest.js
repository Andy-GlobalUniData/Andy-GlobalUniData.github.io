/**
 * 模塊化系統測試 - Modular System Test
 * 用於驗證新的模塊化架構是否正常運作
 */

class ModularSystemTest {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
        
        console.log('ModularSystemTest: Starting modular system tests...');
    }

    // 運行所有測試
    async runAllTests() {
        try {
            console.log('ModularSystemTest: Running comprehensive tests...');
            
            // 等待應用程序就緒
            await this.waitForApp();
            
            // 基礎測試
            this.testAppManager();
            this.testCoreModule();
            this.testEventSystem();
            
            // 功能模塊測試
            this.testDepartmentModule();
            this.testSchoolModule();
            this.testMapModule();
            this.testExportModule();
            
            // UI 模塊測試
            this.testTabManager();
            
            // 集成測試
            await this.testModuleIntegration();
            
            // 性能測試
            this.testPerformance();
            
            // 生成測試報告
            this.generateReport();
            
        } catch (error) {
            console.error('ModularSystemTest: Test suite failed:', error);
            this.addResult('Test Suite', 'FAILED', error.message);
            this.generateReport();
        }
    }

    // 等待應用程序就緒
    waitForApp() {
        return new Promise((resolve, reject) => {
            if (window.app && window.app.isInitialized) {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50; // 10秒超時
            
            const checkApp = () => {
                attempts++;
                
                if (window.app && window.app.isInitialized) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('App initialization timeout'));
                } else {
                    setTimeout(checkApp, 200);
                }
            };
            
            checkApp();
        });
    }

    // 測試 AppManager
    testAppManager() {
        console.log('ModularSystemTest: Testing AppManager...');
        
        try {
            // 檢查 AppManager 是否存在
            this.assert(typeof AppManager !== 'undefined', 'AppManager class exists');
            this.assert(window.app instanceof AppManager, 'Global app instance exists');
            this.assert(window.app.isInitialized, 'App is initialized');
            
            // 檢查模塊註冊
            const modules = window.app.getAllModules();
            this.assert(modules.size > 0, 'Modules are registered');
            
            // 檢查統計信息
            const stats = window.app.getAppStats();
            this.assert(stats.moduleCount > 0, 'Module count is valid');
            this.assert(stats.version === '2.0.0', 'Version is correct');
            
            this.addResult('AppManager', 'PASSED', `${stats.moduleCount} modules loaded`);
            
        } catch (error) {
            this.addResult('AppManager', 'FAILED', error.message);
        }
    }

    // 測試核心模塊
    testCoreModule() {
        console.log('ModularSystemTest: Testing CoreModule...');
        
        try {
            const core = window.app.getModule('core');
            this.assert(core !== undefined, 'CoreModule exists');
            
            // 檢查數據載入
            this.assert(Array.isArray(core.data), 'Main data is loaded');
            this.assert(Array.isArray(core.schoolData), 'School data is loaded');
            this.assert(typeof core.degreeData === 'object', 'Degree data is loaded');
            
            // 檢查篩選器
            const filters = core.getAllFilters();
            this.assert(typeof filters === 'object', 'Filters object exists');
            this.assert(Array.isArray(filters.countries), 'Country filter exists');
            this.assert(Array.isArray(filters.schools), 'School filter exists');
            this.assert(Array.isArray(filters.degrees), 'Degree filter exists');
            
            // 檢查數據操作
            const uniqueCountries = core.getUniqueValues('Country');
            this.assert(Array.isArray(uniqueCountries), 'Can get unique values');
            this.assert(uniqueCountries.length > 0, 'Has unique countries');
            
            this.addResult('CoreModule', 'PASSED', `${core.data.length} records loaded`);
            
        } catch (error) {
            this.addResult('CoreModule', 'FAILED', error.message);
        }
    }

    // 測試事件系統
    testEventSystem() {
        console.log('ModularSystemTest: Testing Event System...');
        
        try {
            const core = window.app.getModule('core');
            let eventFired = false;
            
            // 測試事件監聽
            core.on('testEvent', () => {
                eventFired = true;
            });
            
            // 觸發事件
            core.emit('testEvent');
            
            this.assert(eventFired, 'Event system works');
            
            this.addResult('Event System', 'PASSED', 'Events work correctly');
            
        } catch (error) {
            this.addResult('Event System', 'FAILED', error.message);
        }
    }

    // 測試科系模塊
    testDepartmentModule() {
        console.log('ModularSystemTest: Testing DepartmentModule...');
        
        try {
            const department = window.app.getModule('department');
            this.assert(department !== undefined, 'DepartmentModule exists');
            this.assert(department.isInitialized, 'Department module is initialized');
            
            // 檢查 DataTable
            this.assert(department.dataTable !== null, 'DataTable is initialized');
            
            // 檢查選擇功能
            this.assert(Array.isArray(department.selectedRowURLs), 'Selection tracking exists');
            
            // 檢查數據獲取
            const currentData = department.getCurrentData();
            this.assert(Array.isArray(currentData), 'Can get current data');
            
            this.addResult('DepartmentModule', 'PASSED', `${currentData.length} records in table`);
            
        } catch (error) {
            this.addResult('DepartmentModule', 'FAILED', error.message);
        }
    }

    // 測試學校模塊
    testSchoolModule() {
        console.log('ModularSystemTest: Testing SchoolModule...');
        
        try {
            const school = window.app.getModule('school');
            this.assert(school !== undefined, 'SchoolModule exists');
            this.assert(school.isInitialized, 'School module is initialized');
            
            // 檢查學校數據表格
            this.assert(school.schoolDataTable !== null, 'School DataTable is initialized');
            
            // 檢查統計功能
            const stats = school.getSchoolStats();
            this.assert(typeof stats === 'object', 'Can get school stats');
            this.assert(stats.totalSchools >= 0, 'Total schools count is valid');
            
            this.addResult('SchoolModule', 'PASSED', `${stats.totalSchools} schools loaded`);
            
        } catch (error) {
            this.addResult('SchoolModule', 'FAILED', error.message);
        }
    }

    // 測試地圖模塊
    testMapModule() {
        console.log('ModularSystemTest: Testing MapModule...');
        
        try {
            const map = window.app.getModule('map');
            this.assert(map !== undefined, 'MapModule exists');
            this.assert(map.isInitialized, 'Map module is initialized');
            
            // 檢查地圖容器
            this.assert(map.mapContainer !== null, 'Map container exists');
            
            // 檢查 Leaflet 庫狀態
            const leafletStatus = map.isLeafletLoaded ? 'loaded' : 'loading';
            
            this.addResult('MapModule', 'PASSED', `Leaflet ${leafletStatus}`);
            
        } catch (error) {
            this.addResult('MapModule', 'FAILED', error.message);
        }
    }

    // 測試匯出模塊
    testExportModule() {
        console.log('ModularSystemTest: Testing ExportManagerModule...');
        
        try {
            const exportManager = window.app.getModule('export');
            this.assert(exportManager !== undefined, 'ExportManagerModule exists');
            this.assert(exportManager.isInitialized, 'Export module is initialized');
            
            // 檢查匯出統計
            const stats = exportManager.getExportStats();
            this.assert(typeof stats === 'object', 'Can get export stats');
            this.assert(stats.totalData >= 0, 'Total data count is valid');
            
            this.addResult('ExportManagerModule', 'PASSED', `${stats.totalData} records available for export`);
            
        } catch (error) {
            this.addResult('ExportManagerModule', 'FAILED', error.message);
        }
    }

    // 測試標籤頁管理器
    testTabManager() {
        console.log('ModularSystemTest: Testing TabManagerModule...');
        
        try {
            const tabManager = window.app.getModule('tabManager');
            this.assert(tabManager !== undefined, 'TabManagerModule exists');
            
            // 檢查標籤頁信息
            const activeTab = tabManager.getActiveTab();
            this.assert(typeof activeTab === 'string', 'Has active tab');
            
            const allTabs = tabManager.getAllTabs();
            this.assert(typeof allTabs === 'object', 'Has tab configuration');
            
            const tabCount = Object.keys(allTabs).length;
            this.assert(tabCount === 3, 'Has 3 tabs');
            
            this.addResult('TabManagerModule', 'PASSED', `Active tab: ${activeTab}, ${tabCount} tabs total`);
            
        } catch (error) {
            this.addResult('TabManagerModule', 'FAILED', error.message);
        }
    }

    // 測試模塊集成
    async testModuleIntegration() {
        console.log('ModularSystemTest: Testing Module Integration...');
        
        try {
            const core = window.app.getModule('core');
            const department = window.app.getModule('department');
            
            // 測試篩選器集成
            const originalData = department.getCurrentData();
            const originalCount = originalData.length;
            
            // 設置國家篩選器
            const countries = core.getUniqueValues('Country');
            if (countries.length > 0) {
                const testCountry = countries[0];
                core.setFilter('countries', [testCountry]);
                
                // 等待篩選器生效
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const filteredData = department.getCurrentData();
                const filteredCount = filteredData.length;
                
                this.assert(filteredCount <= originalCount, 'Filter reduces data count');
                
                // 重置篩選器
                core.setFilter('countries', countries);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            this.addResult('Module Integration', 'PASSED', 'Filter integration works');
            
        } catch (error) {
            this.addResult('Module Integration', 'FAILED', error.message);
        }
    }

    // 性能測試
    testPerformance() {
        console.log('ModularSystemTest: Testing Performance...');
        
        try {
            const totalTime = Date.now() - this.startTime;
            const stats = window.app.getAppStats();
            const initTime = stats.initTime;
            
            // 檢查初始化時間
            this.assert(initTime < 10000, 'App initialization under 10 seconds');
            this.assert(totalTime < 15000, 'Total test time under 15 seconds');
            
            // 記憶體使用檢查
            if (performance && performance.memory) {
                const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
                this.assert(memoryMB < 100, 'Memory usage under 100MB');
                
                this.addResult('Performance', 'PASSED', 
                    `Init: ${initTime}ms, Memory: ${memoryMB.toFixed(1)}MB`);
            } else {
                this.addResult('Performance', 'PASSED', 
                    `Init: ${initTime}ms`);
            }
            
        } catch (error) {
            this.addResult('Performance', 'FAILED', error.message);
        }
    }

    // 斷言函數
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    // 添加測試結果
    addResult(testName, status, details) {
        this.testResults.push({
            name: testName,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        });
        
        const icon = status === 'PASSED' ? '✅' : '❌';
        console.log(`ModularSystemTest: ${icon} ${testName} - ${details}`);
    }

    // 生成測試報告
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASSED').length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n=== 模塊化系統測試報告 ===');
        console.log(`總測試數: ${totalTests}`);
        console.log(`通過: ${passedTests}`);
        console.log(`失敗: ${failedTests}`);
        console.log(`成功率: ${successRate}%`);
        console.log('========================\n');
        
        // 詳細結果
        this.testResults.forEach(result => {
            const icon = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.details}`);
        });
        
        // 在頁面上顯示結果
        this.displayReportOnPage(totalTests, passedTests, failedTests, successRate);
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: successRate,
            results: this.testResults
        };
    }

    // 在頁面上顯示報告
    displayReportOnPage(total, passed, failed, successRate) {
        // 創建測試報告容器
        let reportContainer = document.getElementById('test-report');
        if (!reportContainer) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'test-report';
            reportContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #1f2937;
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                font-family: monospace;
                font-size: 12px;
                border: 2px solid ${failed > 0 ? '#ef4444' : '#10b981'};
            `;
            document.body.appendChild(reportContainer);
        }
        
        const statusColor = failed > 0 ? '#ef4444' : '#10b981';
        const statusIcon = failed > 0 ? '❌' : '✅';
        
        reportContainer.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 16px; margin-right: 10px;">${statusIcon}</span>
                <strong>模塊化系統測試結果</strong>
            </div>
            <div style="margin-bottom: 10px;">
                <div>總測試數: <span style="color: #60a5fa;">${total}</span></div>
                <div>通過: <span style="color: #10b981;">${passed}</span></div>
                <div>失敗: <span style="color: #ef4444;">${failed}</span></div>
                <div>成功率: <span style="color: ${statusColor};">${successRate}%</span></div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: #374151;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            ">關閉</button>
        `;
        
        // 自動隱藏
        setTimeout(() => {
            if (reportContainer.parentElement) {
                reportContainer.style.opacity = '0.8';
            }
        }, 10000);
    }
}

// 自動運行測試（在開發模式下）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 等待應用程序載入後運行測試
    document.addEventListener('appReady', () => {
        setTimeout(() => {
            const test = new ModularSystemTest();
            test.runAllTests();
        }, 1000);
    });
}

// 暴露測試類供手動使用
window.ModularSystemTest = ModularSystemTest;
