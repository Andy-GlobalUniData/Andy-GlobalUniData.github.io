document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/test_project/data/data.json")
        .then(response => response.json())
        .then(data => {
            // 先清空 tbody，防止重複插入
            const tbody = document.querySelector("#json-table tbody");
            tbody.innerHTML = ""; 

            data.forEach(item => {
                // 將每筆資料加入表格中
                tbody.innerHTML += 
                    `<tr>
                        <td>${item["Department Name"]}</td>
                        <td><a href="${item.URL}" target="_blank">${item.URL}</a></td>
                        <td>${item.Academic_field}</td>
                        <td>${item.Description}</td>
                    </tr>`;
            });

            // 啟用 DataTable 和 ColResize 插件
            $("#json-table").DataTable({
                "autoWidth": true,   // 自動調整列寬
                "responsive": true,  // 啟用響應式設計
                "colReorder": false,  // 啟用列調整功能
                "ordering": true     // 啟用排序功能
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);  // 顯示錯誤訊息
        });
});
