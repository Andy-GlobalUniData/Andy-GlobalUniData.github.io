document.addEventListener("DOMContentLoaded", function () {
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 100;

    async function fetchJsonData(url) {
        try {
            const response = await fetch(url);
            totalData = await response.json();

            dataTable = $("#json-table").DataTable({
                data: [],
                columns: [
                    { 
                        title: "<input type='checkbox' id='select-all'>", 
                        render: function () {
                            return '<input type="checkbox" class="row-checkbox">';
                        },
                        orderable: false
                    },
                    { title: "School Name" },
                    { title: "Department Name" },
                    { title: "URL", render: function (data) {
                        return `<a href="${data}" target="_blank">${data.length > 50 ? data.substring(0, 50) + "..." : data}</a>`;
                    }},
                ],
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
            '',
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
            table.column(1).search(this.value).draw();
        });
        $('#search-department').on('keyup', function() {
            table.column(2).search(this.value).draw();
        });
        $('#search-Link').on('keyup', function() {
            table.column(3).search(this.value).draw();
        });
    }

    // Select all checkboxes functionality
    $('#select-all').on('click', function() {
        const isChecked = this.checked;
        $('.row-checkbox').prop('checked', isChecked);
    });

    // Export JSON
    $('#export-json').on('click', function() {
        const selectedData = getSelectedData();
        const jsonData = JSON.stringify(selectedData, null, 2);
        downloadFile('data.json', jsonData);
    });

    // Export to Excel
    $('#export-excel').on('click', function() {
        const selectedData = getSelectedData();
        const excelData = selectedData.map(item => [item["School Name"], item["Department Name"], item.URL]);
        exportToExcel(excelData);
    });

    // Function to get selected data
    function getSelectedData() {
        const selectedData = [];
        dataTable.rows().every(function () {
            const row = this.node();
            const checkbox = $(row).find('.row-checkbox')[0];
            if (checkbox && checkbox.checked) {
                const data = this.data();
                selectedData.push({
                    "School Name": data[1],
                    "Department Name": data[2],
                    "URL": data[3]
                });
            }
        });
        return selectedData;
    }

    // Function to download JSON data as a file
    function downloadFile(filename, data) {
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Function to export data to Excel
    function exportToExcel(data) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            ["School Name", "Department Name", "URL"],
            ...data
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "data.xlsx");
    }

    fetchJsonData("data/data.json");
});
