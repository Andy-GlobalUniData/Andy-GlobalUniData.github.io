document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/demo_small_project/data/merged_output.json")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#json-table tbody");
            tbody.innerHTML = ""; 

            data.forEach(item => {
                let urlText = item.URL;
                // 如果 URL 超過 50 個字，就截斷並加上省略號
                let displayText = urlText.length > 50 ? urlText.substring(0, 50) + "..." : urlText;

                tbody.innerHTML += 
                    `<tr>
                        <td>${item["School Name"]}</td>
                        <td>${item["Department Name"]}</td>
                        <td><a href="${item.URL}" target="_blank">${urlText}</a></td>
                        <td>${item.Degree}</td>
                        <td>${item.Description}</td>
                    </tr>`;
            });

             // 啟用 DataTable 插件
             var table = $("#json-table").DataTable();

             // 為每個搜尋框添加事件監聽器，並根據對應欄位進行搜尋
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

             

            // 設定列寬與行高調整
            $("#json-table th").resizable({
                handles: "e",
                minWidth: 50,
                maxWidth: 300,
                alsoResize: "#json-table td",
                resize: function(event, ui) {
                    const index = $(this).index();
                    $("#json-table td").each(function() {
                        if ($(this).index() === index) {
                            $(this).width(ui.size.width);
                        }
                    });
                }
            });

            // 行高設定
            $("#json-table td").each(function() {
                $(this).css("height", "40px");
            });

            $("#json-table tr").resizable({
                handles: "s",
                minHeight: 40,
                maxHeight: 100,
                alsoResize: "#json-table td",
                resize: function(event, ui) {
                    $(this).find("td").each(function() {
                        $(this).height(ui.size.height);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
        });
});
