document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.querySelector("#json-table tbody");
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 20; // 每次載入 20 筆

    async function fetchJsonData(url) {
        try {
            const response = await fetch(url);
            totalData = await response.json();
            tableElement.innerHTML = ""; // 清空舊資料

            // **初始化 DataTable（設定為 client-side 處理）**
            dataTable = $("#json-table").DataTable({
                columns: [
                    { title: "School Name" },
                    { title: "Department Name" },
                    { title: "URL" }
                ],
                pageLength: 10,  // 預設每頁顯示 10 筆
                destroy: true, // 確保可以重新載入 DataTable
            });

            setupSearchFilters(dataTable);
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

        const formattedData = chunk.map(item => {
            let urlText = item.URL.length > 50 ? item.URL.substring(0, 50) + "..." : item.URL;
            return [
                item["School Name"],
                item["Department Name"],
                `<a href="${item.URL}" target="_blank">${urlText}</a>`
            ];
        });

        dataTable.rows.add(formattedData).draw(false); // **不重置分頁**

        if (index < totalData.length) {
            setTimeout(loadNextChunk, 200); // **延遲載入，避免 UI 卡頓**
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
