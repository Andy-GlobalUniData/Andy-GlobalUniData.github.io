document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/test_project/data/data.json")
        .then(response => response.json())
        .then(data => {
            // 先清空 tbody，防止重複插入
            const tbody = document.querySelector("#json-table tbody");
            tbody.innerHTML = ""; 

            data.forEach(item => {
                tbody.innerHTML += 
                    `<tr class="resizable">
                        <td>${item["Department Name"]}</td>
                        <td><a href="${item.URL}" target="_blank">${item.URL}</a></td>
                        <td>${item.Academic_field}</td>
                        <td>${item.Description}</td>
                    </tr>`;
            });

            // 啟用 DataTable 並設定響應式功能
            $("#json-table").DataTable({
                "autoWidth": true,  // 自動調整列寬
                "responsive": true  // 啟用響應式設計
            });

            // 列寬拖動調整
            const headers = document.querySelectorAll("#json-table th");
            headers.forEach(header => {
                header.classList.add("resizable");
                let startX, startWidth;

                header.addEventListener('mousedown', (e) => {
                    startX = e.clientX;
                    startWidth = header.offsetWidth;
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });

                function onMouseMove(e) {
                    const newWidth = startWidth + (e.clientX - startX);
                    header.style.width = `${newWidth}px`;
                    // 重新調整表格列寬
                    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
                    const rows = document.querySelectorAll("#json-table tbody tr");
                    rows.forEach(row => {
                        row.cells[columnIndex].style.width = `${newWidth}px`;
                    });
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
            });

            // 行高拖動調整
            const rows = document.querySelectorAll("#json-table tr");
            rows.forEach(row => {
                row.classList.add("resizable");
                let startY, startHeight;

                row.addEventListener('mousedown', (e) => {
                    startY = e.clientY;
                    startHeight = row.offsetHeight;
                    document.addEventListener('mousemove', onRowMouseMove);
                    document.addEventListener('mouseup', onRowMouseUp);
                });

                function onRowMouseMove(e) {
                    const newHeight = startHeight + (e.clientY - startY);
                    row.style.height = `${newHeight}px`;
                }

                function onRowMouseUp() {
                    document.removeEventListener('mousemove', onRowMouseMove);
                    document.removeEventListener('mouseup', onRowMouseUp);
                }
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);  // 顯示錯誤訊息
        });
});
