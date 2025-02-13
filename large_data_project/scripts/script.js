document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.querySelector("#json-table tbody");
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 100; // 每次載入 100 筆

    async function fetchJsonData(url) {
        try {
            const response = await fetch(url);
            totalData = await response.json();
            tableElement.innerHTML = ""; // 清空舊資料
            loadNextChunk(); // 先載入第一批資料
        } catch (error) {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
        }
    }

    function loadNextChunk() {
        if (index >= totalData.length) return;

        const chunk = totalData.slice(index, index + chunkSize);
        index += chunkSize;

        chunk.forEach(item => {
            let row = document.createElement("tr");

            let urlText = item.URL.length > 50 ? item.URL.substring(0, 50) + "..." : item.URL;
            row.innerHTML = `
                <td>${item["School Name"]}</td>
                <td>${item["Department Name"]}</td>
                <td><a href="${item.URL}" target="_blank">${urlText}</a></td>
            `;

            tableElement.appendChild(row);
        });

        if (!dataTable) {
            // **初始化 DataTable**
            dataTable = $("#json-table").DataTable();
            setupSearchFilters(dataTable);
        } else {
            // **新增新資料**
            dataTable.rows.add($(tableElement).find("tr")).draw();
        }

        if (index < totalData.length) {
            setTimeout(loadNextChunk, 50); // 延遲載入，避免 UI 卡頓
        }
    }

    function setupSearchFilters(table) {
        $('#search-school').on('keyup', function() {
            table.column(0).search(this.value).draw();
        });
        $('#search-department').on('keyup', function() {
            table.column(1).search(this.value).draw();
        });
        $('#search-Link').on('keyup', function() {
            table.column(2).search(this.value).draw();
        });
    }

    fetchJsonData("data/data.json");
});
