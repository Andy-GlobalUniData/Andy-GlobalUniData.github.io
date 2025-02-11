document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.querySelector("#json-table tbody");
    let dataTable;
    
    async function loadJsonInChunks(url, chunkSize = 20) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            tableElement.innerHTML = ""; // 清空舊資料
            let index = 0;

            function loadChunk() {
                const chunk = data.slice(index, index + chunkSize);
                index += chunkSize;

                chunk.forEach(item => {
                    let row = document.createElement("tr");

                    let urlText = item.URL.length > 50 ? item.URL.substring(0, 50) + "..." : item.URL;
                    row.innerHTML = `
                        <td>${item["School Name"]}</td>
                        <td>${item["Department Name"]}</td>
                        <td><a href="${item.URL}" target="_blank">${urlText}</a></td>
                        <td>${item.Degree}</td>
                        <td>${item.Description}</td>
                    `;

                    tableElement.appendChild(row);
                });

                if (!dataTable) {
                    // **初始化 DataTable**
                    dataTable = $("#json-table").DataTable();
                    setupSearchFilters(dataTable);
                } else {
                    // **更新 DataTable**
                    dataTable.rows.add($(tableElement).find("tr")).draw();
                }

                if (index < data.length) {
                    setTimeout(loadChunk, 200); // 延遲載入，讓 UI 有時間更新
                }
            }

            loadChunk(); // 開始載入第一批資料

        } catch (error) {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
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
        $('#search-description').on('keyup', function() {
            table.column(3).search(this.value).draw();
        });
        $('#search-degree').on('keyup', function() {
            table.column(4).search(this.value).draw();
        });
    }

    loadJsonInChunks("https://andy-globalunidata.github.io/test_large_data_project/data/data.json");
});
