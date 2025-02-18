document.addEventListener("DOMContentLoaded", function () {
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 100; // 每次載入 100 筆
    let columns = [
        { title: "School Name", data: "School Name", visible: true },
        { title: "Department Name", data: "Department Name", visible: true },
        { title: "Link", data: "URL", visible: true }
    ];

    async function fetchJsonData(url) {
        try {
            const response = await fetch(url);
            totalData = await response.json();
            
            // 初始化 DataTable
            dataTable = $("#json-table").DataTable({
                data: [],
                columns: columns,
                pageLength: 10,
                searching: true,
                destroy: false,
            });

            setupSearchFilters(dataTable);
            loadNextChunk();
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

        dataTable.rows.add(formattedData).draw(false);

        if (index < totalData.length) {
            setTimeout(loadNextChunk, 50);
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

    // 處理欄位顯示
    function handleColumnVisibility() {
        columns[0].visible = $('#column-school').prop('checked');
        columns[1].visible = $('#column-department').prop('checked');
        columns[2].visible = $('#column-link').prop('checked');
        
        dataTable.columns.adjust().draw();
    }

    // 下載 JSON
    function downloadJson() {
        const blob = new Blob([JSON.stringify(totalData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
    }

    // 下載 Excel
    function downloadExcel() {
        const ws = XLSX.utils.json_to_sheet(totalData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'data.xlsx');
    }

    // 設置勾選事件
    $('#column-school, #column-department, #column-link').on('change', handleColumnVisibility);

    // 下載按鈕事件
    $('#download-json').on('click', downloadJson);
    $('#download-excel').on('click', downloadExcel);

    fetchJsonData("data/data.json");
});
