/**
 * 系統測試腳本
 * 檢查所有組件是否正常工作
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== 系統測試開始 ===');

    // 延遲測試，確保所有組件都已載入
    setTimeout(() => {
        runSystemTests();
    }, 3000);
});

function runSystemTests() {
    console.log('開始執行系統測試...');

    // 測試1：檢查學位篩選器
    const degreeContainer = document.getElementById('degree-selector-content');
    if (degreeContainer) {
        console.log('✓ 學位選擇器容器存在');

        if (degreeContainer.innerHTML.includes('載入中')) {
            console.log('❌ 學位選擇器仍在載入中');
        } else if (degreeContainer.innerHTML.includes('不篩選學位')) {
            console.log('✓ 學位選擇器載入成功');
        } else {
            console.log('❌ 學位選擇器載入狀態未知');
        }
    } else {
        console.log('❌ 學位選擇器容器不存在');
    }

    // 測試2：檢查全局變量
    if (window.degreeFilterManager) {
        console.log('✓ degreeFilterManager 存在');
        console.log('學位篩選器狀態:', window.degreeFilterManager.isReady() ? '已就緒' : '未就緒');
    } else {
        console.log('❌ degreeFilterManager 不存在');
    }

    if (window.dataManager) {
        console.log('✓ dataManager 存在');
    } else {
        console.log('❌ dataManager 不存在');
    }

    // 測試3：檢查DataTable
    if (window.dataTable) {
        console.log('✓ DataTable 存在');
    } else {
        console.log('❌ DataTable 不存在');
    }

    // 測試4：檢查表格結構
    const table = document.getElementById('json-table');
    if (table) {
        const headers = table.querySelectorAll('th');
        console.log('✓ 表格存在，欄位數量:', headers.length);

        const expectedHeaders = ['選擇', '國家', '學校名稱', '科系名稱', '學位等級', '網址', '操作'];
        let headerMatch = true;
        headers.forEach((header, index) => {
            if (index < expectedHeaders.length && header.textContent.trim() !== expectedHeaders[index]) {
                headerMatch = false;
            }
        });

        if (headerMatch) {
            console.log('✓ 表格標題正確');
        } else {
            console.log('❌ 表格標題不匹配');
        }
    } else {
        console.log('❌ 表格不存在');
    }

    console.log('=== 系統測試完成 ===');

    // 顯示測試結果到頁面
    showTestResults();
}

function showTestResults() {
    // 創建測試結果顯示區域
    const testResults = document.createElement('div');
    testResults.id = 'test-results';
    testResults.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        z-index: 10000;
        cursor: pointer;
    `;

    const status = [];

    // 檢查各組件狀態
    const degreeContainer = document.getElementById('degree-selector-content');
    const degreeOK = degreeContainer && !degreeContainer.innerHTML.includes('載入中');
    const managerOK = window.degreeFilterManager && window.degreeFilterManager.isReady();
    const dataOK = window.dataManager;
    const tableOK = window.dataTable;

    status.push(`學位選擇器: ${degreeOK ? '✓' : '❌'}`);
    status.push(`學位管理器: ${managerOK ? '✓' : '❌'}`);
    status.push(`數據管理器: ${dataOK ? '✓' : '❌'}`);
    status.push(`數據表格: ${tableOK ? '✓' : '❌'}`);

    const allOK = degreeOK && managerOK && dataOK && tableOK;

    testResults.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">
            系統狀態 ${allOK ? '✓ 正常' : '❌ 異常'}
        </div>
        ${status.join('<br>')}
        <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            點擊關閉
        </div>
    `;

    testResults.onclick = () => testResults.remove();

    document.body.appendChild(testResults);

    // 3秒後自動關閉
    setTimeout(() => {
        if (testResults.parentNode) {
            testResults.remove();
        }
    }, 5000);
}
