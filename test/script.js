async function loadCSV() {
    try {
        // 讀取 data.csv 檔案
        const response = await fetch("departments_results.csv");
        const text = await response.text();

        // 解析 CSV：按換行符號分割行，再按逗號分割欄位
        const rows = text.split("\n").map(row => row.split(","));

        // 顯示在 HTML 表格
        const table = document.getElementById("csvTable");
        table.innerHTML = "";
        rows.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading CSV:", error);
    }
}

// 頁面載入時執行
window.onload = loadCSV;
