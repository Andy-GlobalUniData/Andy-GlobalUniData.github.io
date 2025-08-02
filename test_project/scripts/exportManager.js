/**
 * 匯出功能模組
 * 處理數據匯出相關功能
 */

class ExportManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 複製所有URL
        $(document).on("click", "#copy-all-urls", () => {
            this.copyAllUrls();
        });

        // 匯出JSON
        $(document).on("click", "#export-json", () => {
            this.exportJson();
        });

        // 匯出Excel
        $(document).on("click", "#export-excel", () => {
            this.exportExcel();
        });

        // 匯出TXT
        $(document).on("click", "#export-txt", () => {
            this.exportTxt();
        });
    }

    getSelectedData() {
        if (window.dataManager) {
            return window.dataManager.getSelectedData();
        }
        return [];
    }

    copyAllUrls() {
        const selectedData = this.getSelectedData();
        if (selectedData.length === 0) {
            alert("請先選擇至少一筆資料");
            return;
        }

        const urls = selectedData
            .map(item => item.URL)
            .filter(url => url && url !== "N/A")
            .join("\\n");

        if (urls.length === 0) {
            alert("勾選的資料沒有有效的URL");
            return;
        }

        navigator.clipboard.writeText(urls).then(() => {
            alert(`已複製 ${selectedData.length} 個URL到剪貼簿！`);
        }).catch(err => {
            console.error("複製失敗:", err);
            alert("複製失敗: " + err.message);
        });
    }

    exportJson() {
        const selectedData = this.getSelectedData();
        if (selectedData.length === 0) {
            alert("請先選擇至少一筆資料");
            return;
        }

        const jsonString = JSON.stringify(selectedData, null, 2);
        this.downloadFile(jsonString, "selected_data.json", "application/json");
    }

    exportExcel() {
        const selectedData = this.getSelectedData();
        if (selectedData.length === 0) {
            alert("請先選擇至少一筆資料");
            return;
        }

        // 確保 XLSX 庫已載入
        if (typeof XLSX === 'undefined') {
            alert("Excel匯出功能尚未載入，請重新整理頁面");
            return;
        }

        try {
            const ws = XLSX.utils.json_to_sheet(selectedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Selected Data");
            XLSX.writeFile(wb, "selected_data.xlsx");
        } catch (error) {
            console.error("Excel匯出失敗:", error);
            alert("Excel匯出失敗: " + error.message);
        }
    }

    exportTxt() {
        const selectedData = this.getSelectedData();
        if (selectedData.length === 0) {
            alert("請先選擇至少一筆資料");
            return;
        }

        const urls = selectedData
            .map(item => item.URL)
            .filter(url => url && url !== "N/A")
            .join("\\n");

        if (urls.length === 0) {
            alert("勾選的資料沒有有效的URL");
            return;
        }

        this.downloadFile(urls, "selected_urls.txt", "text/plain");
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 初始化匯出管理器
document.addEventListener('DOMContentLoaded', () => {
    new ExportManager();
});
