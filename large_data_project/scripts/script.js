document.addEventListener("DOMContentLoaded", function () {
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 100; // 每次載入 100 筆

    async function fetchJsonData(url) {
        try {
            const response = await fetch(url);
            totalData = await response.json();
            
            // **初始化 DataTable**
            dataTable = $("#json-table").DataTable({
                data: [],  // 先不放資料，等 loadNextChunk 逐步加入
                columns: [
                    { title: "School Name" },
                    { title: "Department Name" },
                    { title: "URL", render: function (data) {
                        return `<a href="${data}" target="_blank">${data.length > 50 ? data.substring(0, 50) + "..." : data}</a>`;
                    }},
                ],
                pageLength: 10,  // 預設每頁顯示 10 筆
                searching: true,  // **確保搜尋功能開啟**
                destroy: false,  // **避免重新初始化破壞搜尋**
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

        const formattedData = chunk.map(item => [
            item["School Name"],
            item["Department Name"],
            item.URL
        ]);

        dataTable.rows.add(formattedData).draw(false); // **不重置搜尋狀態**

        if (index < totalData.length) {
            setTimeout(loadNextChunk, 50); // **延遲載入，避免 UI 卡頓**
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
