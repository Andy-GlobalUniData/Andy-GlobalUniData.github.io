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

            // 使用 jQuery UI Resizable 來使表格可調整
            $("#json-table td").resizable({
                handles: "e, s, se", // e：東（列）、s：南（行）、se：南東角
                minWidth: 50, // 設定最小寬度
                minHeight: 30 // 設定最小高度
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
        });
});
