document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/test_project/data/data.json")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#json-table tbody");
            tbody.innerHTML = ""; 

            data.forEach(item => {
                tbody.innerHTML += 
                    `<tr>
                        <td>${item["Department Name"]}</td>
                        <td><a href="${item.URL}" target="_blank">${item.URL}</a></td>
                        <td>${item.Academic_field}</td>
                        <td>${item.Description}</td>
                    </tr>`;
            });

            // 啟用 DataTable 插件
            $("#json-table").DataTable();

            // 讓表格標題（列）可調整寬度
            $("#json-table th").resizable({
                handles: "e",  // 只有向右拖動
                minWidth: 50,   // 設定最小寬度
                maxWidth: 300,  // 設定最大寬度
                alsoResize: "#json-table td",  // 同時調整該列的寬度
                resize: function(event, ui) {
                    const index = $(this).index();  // 獲取被調整的列索引
                    $("#json-table td").each(function() {
                        if ($(this).index() === index) {
                            $(this).width(ui.size.width);  // 調整該列的每一個單元格
                        }
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
        });
});
