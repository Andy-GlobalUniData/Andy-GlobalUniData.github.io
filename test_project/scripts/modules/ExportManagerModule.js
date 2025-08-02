/**
 * 匯出管理模塊 - Export Manager Module
 * 負責處理各種匯出功能：JSON、Excel、TXT等
 */

class ExportManagerModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.isInitialized = false;
        
        console.log('ExportManagerModule: Initialized');
    }

    // 初始化
    init() {
        this.core.registerModule('exportManager', this);
        
        // 監聽核心事件
        this.core.on('coreReady', () => this.setup());
        this.core.on('selectionChanged', (e) => this.updateExportButtons(e.detail));
        
        console.log('ExportManagerModule: Event listeners registered');
    }

    setup() {
        if (this.isInitialized) return;
        
        console.log('ExportManagerModule: Setting up...');
        
        this.setupExportButtons();
        this.updateExportButtons({ selectedCount: 0 });
        
        this.isInitialized = true;
        console.log('ExportManagerModule: Setup complete');
    }

    // 設置匯出按鈕事件
    setupExportButtons() {
        // JSON 匯出按鈕
        const exportJsonBtn = document.getElementById('export-json');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportJSON());
        }

        // Excel 匯出按鈕
        const exportExcelBtn = document.getElementById('export-excel');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportExcel());
        }

        // TXT 匯出按鈕
        const exportTxtBtn = document.getElementById('export-txt');
        if (exportTxtBtn) {
            exportTxtBtn.addEventListener('click', () => this.exportTXT());
        }

        // 複製所有 URL 按鈕
        const copyAllUrlsBtn = document.getElementById('copy-all-urls');
        if (copyAllUrlsBtn) {
            copyAllUrlsBtn.addEventListener('click', () => this.copyAllURLs());
        }

        console.log('ExportManagerModule: Export buttons setup complete');
    }

    // 更新匯出按鈕狀態
    updateExportButtons(detail) {
        const { selectedCount } = detail;
        
        const buttons = [
            document.getElementById('export-json'),
            document.getElementById('export-excel'),
            document.getElementById('export-txt'),
            document.getElementById('copy-all-urls')
        ];

        buttons.forEach(button => {
            if (button) {
                const btnText = button.querySelector('.btn-text') || button;
                const btnIcon = button.querySelector('.btn-icon');
                
                if (selectedCount > 0) {
                    button.disabled = false;
                    button.classList.remove('disabled');
                    
                    // 更新按鈕文字顯示選中數量
                    if (btnText && btnIcon) {
                        const originalText = button.getAttribute('data-original-text') || btnText.textContent;
                        if (!button.getAttribute('data-original-text')) {
                            button.setAttribute('data-original-text', originalText);
                        }
                        btnText.textContent = `${originalText} (${selectedCount})`;
                    }
                } else {
                    button.disabled = false; // 仍然允許匯出當前顯示的數據
                    button.classList.remove('disabled');
                    
                    // 恢復原始文字
                    if (btnText) {
                        const originalText = button.getAttribute('data-original-text');
                        if (originalText) {
                            btnText.textContent = originalText;
                        }
                    }
                }
            }
        });
    }

    // 獲取要匯出的數據
    getExportData() {
        const departmentModule = this.core.getModule('department');
        
        if (!departmentModule) {
            console.warn('ExportManagerModule: Department module not found');
            return [];
        }

        // 優先匯出選中的數據，如果沒有選中則匯出當前顯示的數據
        const selectedData = departmentModule.getSelectedData();
        
        if (selectedData.length > 0) {
            console.log('ExportManagerModule: Exporting selected data:', selectedData.length, 'items');
            return selectedData;
        } else {
            const currentData = departmentModule.getCurrentData();
            console.log('ExportManagerModule: Exporting current display data:', currentData.length, 'items');
            return currentData;
        }
    }

    // 匯出 JSON
    exportJSON() {
        try {
            const data = this.getExportData();
            
            if (data.length === 0) {
                this.showToast('❌ 沒有可匯出的資料');
                return;
            }

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const filename = this.generateFilename('json');
            this.downloadFile(blob, filename);
            
            this.showToast(`✅ 已匯出 ${data.length} 筆資料到 ${filename}`);
            
            console.log('ExportManagerModule: JSON export completed');
        } catch (error) {
            console.error('ExportManagerModule: JSON export failed:', error);
            this.showToast('❌ JSON 匯出失敗');
        }
    }

    // 匯出 Excel
    exportExcel() {
        try {
            // 檢查 XLSX 庫是否載入
            if (typeof XLSX === 'undefined') {
                this.showToast('❌ Excel 匯出功能載入失敗，請重新整理頁面');
                return;
            }

            const data = this.getExportData();
            
            if (data.length === 0) {
                this.showToast('❌ 沒有可匯出的資料');
                return;
            }

            // 準備 Excel 數據
            const excelData = data.map(item => ({
                '國家': item.Country || '',
                '學校名稱': item['School Name'] || '',
                '科系名稱': item['Department Name'] || '',
                '學位等級': item['Degree Level'] || '',
                '網址': item.URL || ''
            }));

            // 創建工作簿
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // 設置列寬
            const colWidths = [
                { wch: 15 }, // 國家
                { wch: 30 }, // 學校名稱
                { wch: 40 }, // 科系名稱
                { wch: 15 }, // 學位等級
                { wch: 50 }  // 網址
            ];
            ws['!cols'] = colWidths;

            // 添加工作表
            XLSX.utils.book_append_sheet(wb, ws, '科系資料');

            // 生成文件名並下載
            const filename = this.generateFilename('xlsx');
            XLSX.writeFile(wb, filename);
            
            this.showToast(`✅ 已匯出 ${data.length} 筆資料到 ${filename}`);
            
            console.log('ExportManagerModule: Excel export completed');
        } catch (error) {
            console.error('ExportManagerModule: Excel export failed:', error);
            this.showToast('❌ Excel 匯出失敗');
        }
    }

    // 匯出 TXT (URLs)
    exportTXT() {
        try {
            const data = this.getExportData();
            
            if (data.length === 0) {
                this.showToast('❌ 沒有可匯出的資料');
                return;
            }

            // 提取 URL 並過濾空值
            const urls = data
                .map(item => item.URL)
                .filter(url => url && url.trim() !== '' && url !== 'N/A')
                .join('\n');

            if (!urls) {
                this.showToast('❌ 沒有有效的網址可匯出');
                return;
            }

            const blob = new Blob([urls], { type: 'text/plain;charset=utf-8' });
            const filename = this.generateFilename('txt');
            this.downloadFile(blob, filename);
            
            const urlCount = urls.split('\n').length;
            this.showToast(`✅ 已匯出 ${urlCount} 個網址到 ${filename}`);
            
            console.log('ExportManagerModule: TXT export completed');
        } catch (error) {
            console.error('ExportManagerModule: TXT export failed:', error);
            this.showToast('❌ TXT 匯出失敗');
        }
    }

    // 複製所有 URLs
    async copyAllURLs() {
        try {
            const data = this.getExportData();
            
            if (data.length === 0) {
                this.showToast('❌ 沒有可複製的資料');
                return;
            }

            // 提取 URL 並過濾空值
            const urls = data
                .map(item => item.URL)
                .filter(url => url && url.trim() !== '' && url !== 'N/A')
                .join('\n');

            if (!urls) {
                this.showToast('❌ 沒有有效的網址可複製');
                return;
            }

            // 複製到剪貼板
            await navigator.clipboard.writeText(urls);
            
            const urlCount = urls.split('\n').length;
            this.showToast(`✅ 已複製 ${urlCount} 個網址到剪貼板`);
            
            console.log('ExportManagerModule: URLs copied to clipboard');
        } catch (error) {
            console.error('ExportManagerModule: Copy URLs failed:', error);
            
            // 備用方法
            try {
                const data = this.getExportData();
                const urls = data
                    .map(item => item.URL)
                    .filter(url => url && url.trim() !== '' && url !== 'N/A')
                    .join('\n');

                const textArea = document.createElement('textarea');
                textArea.value = urls;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const urlCount = urls.split('\n').length;
                this.showToast(`✅ 已複製 ${urlCount} 個網址到剪貼板`);
            } catch (fallbackError) {
                this.showToast('❌ 複製網址失敗');
            }
        }
    }

    // 下載文件
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理 URL 對象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // 生成文件名
    generateFilename(extension) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
        
        const departmentModule = this.core.getModule('department');
        const selectedCount = departmentModule ? departmentModule.selectedRowURLs.length : 0;
        
        let prefix = 'andy_global_uni_data';
        if (selectedCount > 0) {
            prefix += `_selected_${selectedCount}`;
        } else {
            prefix += '_filtered';
        }
        
        return `${prefix}_${timestamp}.${extension}`;
    }

    // 顯示提示
    showToast(message, duration = 3000) {
        let toast = document.getElementById('export-toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'export-toast-message';
            toast.style.cssText = `
                position: fixed;
                top: 170px;
                right: 20px;
                background: var(--success-color, #10b981);
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-weight: 500;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(toast);
        }

        // 根據消息類型設置顏色
        if (message.includes('❌')) {
            toast.style.background = 'var(--error-color, #ef4444)';
        } else if (message.includes('✅')) {
            toast.style.background = 'var(--success-color, #10b981)';
        } else {
            toast.style.background = 'var(--info-color, #3b82f6)';
        }

        toast.textContent = message;
        toast.style.transform = 'translateX(0)';

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, duration);
    }

    // 獲取匯出統計
    getExportStats() {
        const data = this.getExportData();
        const departmentModule = this.core.getModule('department');
        
        return {
            totalData: data.length,
            selectedData: departmentModule ? departmentModule.selectedRowURLs.length : 0,
            validUrls: data.filter(item => item.URL && item.URL.trim() !== '' && item.URL !== 'N/A').length,
            countries: [...new Set(data.map(item => item.Country))].length,
            schools: [...new Set(data.map(item => item['School Name']))].length,
            degrees: [...new Set(data.map(item => item['Degree Level']))].length
        };
    }

    // 批量匯出（所有格式）
    async exportAll() {
        try {
            this.showToast('📦 開始批量匯出...');
            
            // 依序匯出各種格式
            await new Promise(resolve => setTimeout(resolve, 500));
            this.exportJSON();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.exportExcel();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.exportTXT();
            
            const stats = this.getExportStats();
            this.showToast(`✅ 批量匯出完成！共 ${stats.totalData} 筆資料`, 5000);
            
        } catch (error) {
            console.error('ExportManagerModule: Batch export failed:', error);
            this.showToast('❌ 批量匯出失敗');
        }
    }

    // 銷毀
    destroy() {
        this.isInitialized = false;
        
        // 移除 toast
        const toast = document.getElementById('export-toast-message');
        if (toast) {
            toast.remove();
        }
        
        console.log('ExportManagerModule: Destroyed');
    }
}

// 匯出模塊
window.ExportManagerModule = ExportManagerModule;
