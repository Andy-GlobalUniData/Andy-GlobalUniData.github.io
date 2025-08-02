/**
 * 匯出管理模塊 - Export Manager Module
 * 負責統一管理所有匯出功能
 */

class ExportManagerModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.isInitialized = false;
        this.exportHistory = [];
        this.maxHistoryLength = 10;
        
        // 匯出格式配置
        this.exportFormats = {
            json: {
                name: 'JSON',
                extension: '.json',
                mimeType: 'application/json',
                icon: '📊'
            },
            excel: {
                name: 'Excel',
                extension: '.xlsx',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                icon: '📈'
            },
            txt: {
                name: 'Text',
                extension: '.txt',
                mimeType: 'text/plain',
                icon: '📄'
            },
            urls: {
                name: 'URLs',
                extension: '.txt',
                mimeType: 'text/plain',
                icon: '🔗'
            }
        };
        
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

    // 設置
    setup() {
        if (this.isInitialized) return;
        
        console.log('ExportManagerModule: Setting up...');
        
        this.setupExportButtons();
        this.loadSheetJSLibrary();
        
        this.isInitialized = true;
        console.log('ExportManagerModule: Setup complete');
    }

    // 設置匯出按鈕
    setupExportButtons() {
        // JSON 匯出
        const exportJsonBtn = document.getElementById('export-json-btn');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportJSON());
        }

        // Excel 匯出
        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportExcel());
        }

        // 文字匯出
        const exportTxtBtn = document.getElementById('export-txt-btn');
        if (exportTxtBtn) {
            exportTxtBtn.addEventListener('click', () => this.exportTXT());
        }

        // 複製所有 URL
        const copyAllUrlsBtn = document.getElementById('copy-all-urls-btn');
        if (copyAllUrlsBtn) {
            copyAllUrlsBtn.addEventListener('click', () => this.copyAllURLs());
        }

        // 複製選中 URL
        const copySelectedUrlsBtn = document.getElementById('copy-selected-urls-btn');
        if (copySelectedUrlsBtn) {
            copySelectedUrlsBtn.addEventListener('click', () => this.copySelectedURLs());
        }

        // 匯出選中數據
        const exportSelectedBtn = document.getElementById('export-selected-btn');
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', () => this.showExportSelectedModal());
        }

        console.log('ExportManagerModule: Export buttons setup complete');
    }

    // 載入 SheetJS 庫
    async loadSheetJSLibrary() {
        if (window.XLSX) {
            console.log('ExportManagerModule: SheetJS already loaded');
            return;
        }

        console.log('ExportManagerModule: Loading SheetJS library...');
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => {
                console.log('ExportManagerModule: SheetJS library loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('ExportManagerModule: Failed to load SheetJS library');
                reject(new Error('Failed to load SheetJS library'));
            };
            document.head.appendChild(script);
        });
    }

    // 匯出 JSON 格式
    async exportJSON() {
        try {
            const data = this.getCurrentDisplayData();
            if (data.length === 0) {
                this.showToast('⚠️ 沒有數據可匯出', 'warning');
                return;
            }

            const jsonData = JSON.stringify(data, null, 2);
            const filename = this.generateFilename('filtered_department_data', 'json');
            
            this.downloadFile(jsonData, filename, this.exportFormats.json.mimeType);
            this.addToExportHistory('json', filename, data.length);
            
            this.showToast(`✅ 已匯出 ${data.length} 筆資料到 ${filename}`);
            
            console.log('ExportManagerModule: JSON export completed:', filename);
        } catch (error) {
            console.error('ExportManagerModule: JSON export failed:', error);
            this.showToast('❌ JSON 匯出失敗', 'error');
        }
    }

    // 匯出 Excel 格式
    async exportExcel() {
        try {
            if (!window.XLSX) {
                await this.loadSheetJSLibrary();
            }

            const data = this.getCurrentDisplayData();
            if (data.length === 0) {
                this.showToast('⚠️ 沒有數據可匯出', 'warning');
                return;
            }

            // 準備數據
            const worksheetData = data.map(item => ({
                '國家': item.Country || '',
                '學校名稱': item['School Name'] || '',
                '科系名稱': item['Department Name'] || '',
                '學位等級': item['Degree Level'] || '',
                '網址': item.URL || ''
            }));

            // 創建工作簿
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '科系資料');

            // 設置列寬度
            const colWidths = [
                { wch: 15 }, // 國家
                { wch: 30 }, // 學校名稱
                { wch: 40 }, // 科系名稱
                { wch: 15 }, // 學位等級
                { wch: 60 }  // 網址
            ];
            worksheet['!cols'] = colWidths;

            // 生成檔案
            const filename = this.generateFilename('filtered_department_data', 'xlsx');
            XLSX.writeFile(workbook, filename);
            
            this.addToExportHistory('excel', filename, data.length);
            this.showToast(`✅ 已匯出 ${data.length} 筆資料到 ${filename}`);
            
            console.log('ExportManagerModule: Excel export completed:', filename);
        } catch (error) {
            console.error('ExportManagerModule: Excel export failed:', error);
            this.showToast('❌ Excel 匯出失敗', 'error');
        }
    }

    // 匯出文字格式
    async exportTXT() {
        try {
            const data = this.getCurrentDisplayData();
            if (data.length === 0) {
                this.showToast('⚠️ 沒有數據可匯出', 'warning');
                return;
            }

            // 格式化數據
            let txtContent = '科系資料匯出\n';
            txtContent += '='.repeat(50) + '\n\n';
            
            data.forEach((item, index) => {
                txtContent += `${index + 1}. ${item['School Name']} - ${item['Department Name']}\n`;
                txtContent += `   國家: ${item.Country}\n`;
                txtContent += `   學位: ${item['Degree Level']}\n`;
                txtContent += `   網址: ${item.URL}\n\n`;
            });
            
            txtContent += '='.repeat(50) + '\n';
            txtContent += `總計: ${data.length} 筆資料\n`;
            txtContent += `匯出時間: ${new Date().toLocaleString('zh-TW')}\n`;

            const filename = this.generateFilename('filtered_department_data', 'txt');
            this.downloadFile(txtContent, filename, this.exportFormats.txt.mimeType);
            
            this.addToExportHistory('txt', filename, data.length);
            this.showToast(`✅ 已匯出 ${data.length} 筆資料到 ${filename}`);
            
            console.log('ExportManagerModule: TXT export completed:', filename);
        } catch (error) {
            console.error('ExportManagerModule: TXT export failed:', error);
            this.showToast('❌ 文字匯出失敗', 'error');
        }
    }

    // 複製所有 URL
    async copyAllURLs() {
        try {
            const data = this.getCurrentDisplayData();
            if (data.length === 0) {
                this.showToast('⚠️ 沒有數據可複製', 'warning');
                return;
            }

            const urls = data
                .map(item => item.URL)
                .filter(url => url && url.trim() !== '')
                .join('\n');

            if (urls) {
                await this.copyToClipboard(urls);
                this.addToExportHistory('urls', 'clipboard', urls.split('\n').length);
                this.showToast(`✅ 已複製 ${urls.split('\n').length} 個 URL 到剪貼板`);
            } else {
                this.showToast('⚠️ 沒有有效的 URL 可複製', 'warning');
            }
            
            console.log('ExportManagerModule: All URLs copied to clipboard');
        } catch (error) {
            console.error('ExportManagerModule: Copy all URLs failed:', error);
            this.showToast('❌ 複製 URL 失敗', 'error');
        }
    }

    // 複製選中 URL
    async copySelectedURLs() {
        try {
            const departmentModule = this.core.getModule('department');
            if (!departmentModule) {
                this.showToast('❌ 無法獲取科系模塊', 'error');
                return;
            }

            const selectedData = departmentModule.getSelectedData();
            if (selectedData.length === 0) {
                this.showToast('⚠️ 請先選擇要複製 URL 的資料', 'warning');
                return;
            }

            const urls = selectedData
                .map(item => item.URL)
                .filter(url => url && url.trim() !== '')
                .join('\n');

            if (urls) {
                await this.copyToClipboard(urls);
                this.addToExportHistory('urls', 'clipboard_selected', urls.split('\n').length);
                this.showToast(`✅ 已複製選中的 ${urls.split('\n').length} 個 URL 到剪貼板`);
            } else {
                this.showToast('⚠️ 選中的資料中沒有有效的 URL', 'warning');
            }
            
            console.log('ExportManagerModule: Selected URLs copied to clipboard');
        } catch (error) {
            console.error('ExportManagerModule: Copy selected URLs failed:', error);
            this.showToast('❌ 複製選中 URL 失敗', 'error');
        }
    }

    // 顯示匯出選中數據模態窗
    showExportSelectedModal() {
        const departmentModule = this.core.getModule('department');
        if (!departmentModule) {
            this.showToast('❌ 無法獲取科系模塊', 'error');
            return;
        }

        const selectedData = departmentModule.getSelectedData();
        if (selectedData.length === 0) {
            this.showToast('⚠️ 請先選擇要匯出的資料', 'warning');
            return;
        }

        // 創建模態窗
        const modal = this.createExportModal(selectedData.length);
        document.body.appendChild(modal);
        
        // 顯示模態窗
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        console.log('ExportManagerModule: Export selected modal shown');
    }

    // 創建匯出模態窗
    createExportModal(selectedCount) {
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.innerHTML = `
            <div class="export-modal-overlay"></div>
            <div class="export-modal-content">
                <div class="export-modal-header">
                    <h3>匯出選中資料</h3>
                    <button class="export-modal-close">&times;</button>
                </div>
                <div class="export-modal-body">
                    <p>您已選擇 <strong>${selectedCount}</strong> 筆資料，請選擇匯出格式：</p>
                    <div class="export-format-buttons">
                        <button class="export-format-btn" data-format="json">
                            <span class="format-icon">📊</span>
                            JSON 格式
                        </button>
                        <button class="export-format-btn" data-format="excel">
                            <span class="format-icon">📈</span>
                            Excel 格式
                        </button>
                        <button class="export-format-btn" data-format="txt">
                            <span class="format-icon">📄</span>
                            文字格式
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 模態窗事件
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        // 關閉按鈕
        modal.querySelector('.export-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.export-modal-overlay').addEventListener('click', closeModal);

        // 格式按鈕
        modal.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.getAttribute('data-format');
                this.exportSelectedData(format);
                closeModal();
            });
        });

        return modal;
    }

    // 匯出選中數據
    async exportSelectedData(format) {
        try {
            const departmentModule = this.core.getModule('department');
            const selectedData = departmentModule.getSelectedData();
            
            if (selectedData.length === 0) {
                this.showToast('⚠️ 沒有選中的資料可匯出', 'warning');
                return;
            }

            // 暂存當前數據，使用選中數據
            const originalData = this.getCurrentDisplayData();
            
            // 模擬設置當前顯示數據為選中數據
            const tempCurrentData = () => selectedData;
            const originalGetCurrentData = this.getCurrentDisplayData;
            this.getCurrentDisplayData = tempCurrentData;

            switch (format) {
                case 'json':
                    await this.exportJSON();
                    break;
                case 'excel':
                    await this.exportExcel();
                    break;
                case 'txt':
                    await this.exportTXT();
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // 恢復原始數據
            this.getCurrentDisplayData = originalGetCurrentData;
            
            console.log(`ExportManagerModule: Selected data exported in ${format} format`);
        } catch (error) {
            console.error('ExportManagerModule: Export selected data failed:', error);
            this.showToast('❌ 匯出選中資料失敗', 'error');
        }
    }

    // 獲取當前顯示的數據
    getCurrentDisplayData() {
        const departmentModule = this.core.getModule('department');
        if (departmentModule) {
            return departmentModule.getCurrentData();
        }
        return this.core.applyFilters();
    }

    // 生成檔案名
    generateFilename(prefix, extension) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        return `${prefix}_${timestamp}.${extension}`;
    }

    // 下載檔案
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理 URL 對象
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    // 複製到剪貼板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // 備用方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // 更新匯出按鈕狀態
    updateExportButtons(selectionDetail) {
        const { selectedCount } = selectionDetail;
        
        // 更新選中數據的按鈕
        const copySelectedBtn = document.getElementById('copy-selected-urls-btn');
        const exportSelectedBtn = document.getElementById('export-selected-btn');
        
        if (copySelectedBtn) {
            copySelectedBtn.disabled = selectedCount === 0;
            copySelectedBtn.textContent = selectedCount > 0 
                ? `📋 複製選中 URL (${selectedCount})` 
                : '📋 複製選中 URL';
        }
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedCount === 0;
            exportSelectedBtn.textContent = selectedCount > 0 
                ? `📥 匯出選中 (${selectedCount})` 
                : '📥 匯出選中';
        }
        
        console.log(`ExportManagerModule: Export buttons updated for ${selectedCount} selected items`);
    }

    // 加入匯出歷史
    addToExportHistory(format, filename, count) {
        const historyItem = {
            timestamp: new Date().toISOString(),
            format: format,
            filename: filename,
            count: count,
            formatConfig: this.exportFormats[format]
        };
        
        this.exportHistory.unshift(historyItem);
        
        // 保持歷史長度限制
        if (this.exportHistory.length > this.maxHistoryLength) {
            this.exportHistory = this.exportHistory.slice(0, this.maxHistoryLength);
        }
        
        console.log('ExportManagerModule: Export history updated:', historyItem);
    }

    // 顯示提示
    showToast(message, type = 'success', duration = 3000) {
        const toastId = 'export-toast-message';
        let toast = document.getElementById(toastId);
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = toastId;
            document.body.appendChild(toast);
        }

        // 根據類型設置樣式
        const colors = {
            success: 'var(--success-color, #10b981)',
            warning: 'var(--warning-color, #f59e0b)',
            error: 'var(--error-color, #ef4444)'
        };

        toast.style.cssText = `
            position: fixed;
            top: 170px;
            right: 20px;
            background: ${colors[type]};
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

        toast.textContent = message;
        toast.style.transform = 'translateX(0)';

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, duration);
    }

    // 獲取匯出歷史
    getExportHistory() {
        return [...this.exportHistory];
    }

    // 清除匯出歷史
    clearExportHistory() {
        this.exportHistory = [];
        console.log('ExportManagerModule: Export history cleared');
    }

    // 獲取支持的匯出格式
    getSupportedFormats() {
        return { ...this.exportFormats };
    }

    // 銷毀
    destroy() {
        this.exportHistory = [];
        this.isInitialized = false;
        
        console.log('ExportManagerModule: Destroyed');
    }
}

// 匯出模塊
window.ExportManagerModule = ExportManagerModule;