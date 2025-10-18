/**
 * 記憶體監控工具
 * 在瀏覽器 Console 中執行此腳本來監控記憶體使用量
 */

(function() {
    'use strict';
    
    // 檢查是否支援 performance.memory API
    if (!performance.memory) {
        console.warn('⚠️ 此瀏覽器不支援 performance.memory API');
        console.log('💡 請使用 Chrome 並啟用 --enable-precise-memory-info 標誌');
        return;
    }

    let monitorInterval;
    let startTime = Date.now();
    let memoryLog = [];

    /**
     * 格式化記憶體大小
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 取得記憶體資訊
     */
    function getMemoryInfo() {
        const mem = performance.memory;
        return {
            totalJSHeapSize: mem.totalJSHeapSize,
            usedJSHeapSize: mem.usedJSHeapSize,
            jsHeapSizeLimit: mem.jsHeapSizeLimit,
            timestamp: Date.now() - startTime
        };
    }

    /**
     * 顯示記憶體資訊
     */
    function displayMemoryInfo() {
        const mem = performance.memory;
        const used = mem.usedJSHeapSize;
        const total = mem.totalJSHeapSize;
        const limit = mem.jsHeapSizeLimit;
        const percentage = ((used / limit) * 100).toFixed(2);

        console.clear();
        console.log('%c 🧠 記憶體監控儀表板', 'font-size: 18px; font-weight: bold; color: #4285F4;');
        console.log('═'.repeat(60));
        console.log(`📊 使用中的記憶體: ${formatBytes(used)} (${percentage}%)`);
        console.log(`📦 總分配記憶體: ${formatBytes(total)}`);
        console.log(`🔒 記憶體限制:   ${formatBytes(limit)}`);
        console.log(`⏱️  運行時間:     ${Math.floor((Date.now() - startTime) / 1000)}s`);
        console.log('═'.repeat(60));

        // 記憶體警告
        if (percentage > 80) {
            console.warn('⚠️ 警告: 記憶體使用量超過 80%!');
        } else if (percentage > 60) {
            console.warn('⚡ 注意: 記憶體使用量超過 60%');
        } else {
            console.log('✅ 記憶體使用正常');
        }

        // 記錄到陣列
        memoryLog.push(getMemoryInfo());
    }

    /**
     * 開始監控
     */
    window.startMemoryMonitor = function(interval = 2000) {
        if (monitorInterval) {
            console.log('⚠️ 監控已在運行中');
            return;
        }

        console.log('🚀 開始記憶體監控...');
        startTime = Date.now();
        memoryLog = [];
        
        displayMemoryInfo();
        monitorInterval = setInterval(displayMemoryInfo, interval);
        
        console.log(`💡 每 ${interval/1000} 秒更新一次`);
        console.log('💡 輸入 stopMemoryMonitor() 停止監控');
        console.log('💡 輸入 getMemoryReport() 查看報告');
    };

    /**
     * 停止監控
     */
    window.stopMemoryMonitor = function() {
        if (monitorInterval) {
            clearInterval(monitorInterval);
            monitorInterval = null;
            console.log('⏸️  記憶體監控已停止');
            console.log('💡 輸入 getMemoryReport() 查看報告');
        } else {
            console.log('⚠️ 監控未運行');
        }
    };

    /**
     * 取得記憶體報告
     */
    window.getMemoryReport = function() {
        if (memoryLog.length === 0) {
            console.log('⚠️ 沒有記憶體數據');
            return;
        }

        console.log('%c 📊 記憶體使用報告', 'font-size: 16px; font-weight: bold;');
        console.log('═'.repeat(60));

        // 計算統計資料
        const usedMemories = memoryLog.map(m => m.usedJSHeapSize);
        const maxUsed = Math.max(...usedMemories);
        const minUsed = Math.min(...usedMemories);
        const avgUsed = usedMemories.reduce((a, b) => a + b, 0) / usedMemories.length;
        const totalTime = memoryLog[memoryLog.length - 1].timestamp;

        console.log(`⏱️  監控時間: ${(totalTime / 1000).toFixed(1)}s`);
        console.log(`📊 記錄筆數: ${memoryLog.length}`);
        console.log('─'.repeat(60));
        console.log(`📈 最高使用: ${formatBytes(maxUsed)}`);
        console.log(`📉 最低使用: ${formatBytes(minUsed)}`);
        console.log(`📊 平均使用: ${formatBytes(avgUsed)}`);
        console.log(`📊 記憶體變化: ${formatBytes(maxUsed - minUsed)}`);
        console.log('═'.repeat(60));

        // 繪製簡易圖表
        console.log('📊 記憶體使用趨勢:');
        const chart = memoryLog.map((m, i) => {
            const percentage = (m.usedJSHeapSize / m.jsHeapSizeLimit) * 100;
            const bars = '█'.repeat(Math.floor(percentage / 2));
            const time = (m.timestamp / 1000).toFixed(0);
            return `${time.padStart(4)}s │${bars} ${percentage.toFixed(1)}%`;
        });
        console.log(chart.join('\n'));

        // 匯出數據
        window.memoryData = memoryLog;
        console.log('\n💾 數據已儲存到 window.memoryData');
        console.log('💡 可使用 JSON.stringify(window.memoryData) 匯出');
    };

    /**
     * 強制垃圾回收 (僅在支援的瀏覽器中有效)
     */
    window.forceGC = function() {
        if (window.gc) {
            console.log('🗑️  執行垃圾回收...');
            window.gc();
            setTimeout(() => {
                displayMemoryInfo();
                console.log('✅ 垃圾回收完成');
            }, 100);
        } else {
            console.warn('⚠️ 此瀏覽器不支援手動垃圾回收');
            console.log('💡 Chrome: 啟動時加上 --js-flags="--expose-gc"');
        }
    };

    /**
     * 快速檢查
     */
    window.quickMemoryCheck = function() {
        const mem = performance.memory;
        const used = mem.usedJSHeapSize;
        const limit = mem.jsHeapSizeLimit;
        const percentage = ((used / limit) * 100).toFixed(2);
        
        console.log(`🧠 記憶體: ${formatBytes(used)} / ${formatBytes(limit)} (${percentage}%)`);
        return {
            used: formatBytes(used),
            limit: formatBytes(limit),
            percentage: percentage + '%'
        };
    };

    // 自動顯示使用說明
    console.log('%c 🎯 記憶體監控工具已載入!', 'font-size: 16px; font-weight: bold; color: #4285F4;');
    console.log('═'.repeat(60));
    console.log('📌 可用指令:');
    console.log('  • startMemoryMonitor()    - 開始監控');
    console.log('  • stopMemoryMonitor()     - 停止監控');
    console.log('  • getMemoryReport()       - 查看報告');
    console.log('  • quickMemoryCheck()      - 快速檢查');
    console.log('  • forceGC()               - 強制垃圾回收');
    console.log('═'.repeat(60));
    console.log('💡 建議: 先執行 startMemoryMonitor() 開始監控');
    console.log('');

})();
