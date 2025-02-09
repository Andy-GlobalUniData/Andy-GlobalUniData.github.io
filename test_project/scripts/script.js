document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/test_project/data/data.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                document.querySelector("#json-table tbody").innerHTML += 
                    `<tr>
                        <td>${item["Department Name"]}</td>
                        <td>${item.URL}</td>
                        <td>${item.Academic_field}</td>
                        <td>${item.Description}</td>
                    </tr>`;
            });
            $("#json-table").DataTable(); // 啟用 DataTable 功能
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);  // 顯示錯誤訊息
        });
});
