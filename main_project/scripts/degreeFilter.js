document.addEventListener("DOMContentLoaded", function () {
    const degreeSelectDiv = document.getElementById("degree-select");
    degreeSelectDiv.innerHTML = "loading...";

    // 清除之前可能存在的自定義搜尋函數
    $.fn.dataTable.ext.search = [];

    // 讀取 Degree_data.json 資料
    fetch("data/Degree_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入學位資料：", data);

            const degreeLevels = data;
            const degreeOptions = Object.keys(degreeLevels).map(degree => `
                <label><input type="checkbox" class="degree-checkbox" value="${degree}" checked> ${degree}</label><br>
            `).join("");

            degreeSelectDiv.innerHTML = `
                <h3>Select Degree Level</h3>
                <label><input type="checkbox" class="degree-checkbox" value="No Filter"> 不篩選學位</label><br>
                ${degreeOptions}
            `;

            // 定義自定義搜尋函數
            function customDegreeSearch(settings, data, dataIndex) {
                if (settings.nTable.id !== 'json-table') {
                    return true;
                }

                const selectedDegrees = [...document.querySelectorAll(".degree-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                // 如果選擇了 "No Filter" 或沒有選擇任何學位，顯示所有
                if (selectedDegrees.includes("No Filter") || selectedDegrees.length === 0) {
                    return true;
                }

                const degreeLevel = data[4] || '';  // Degree Level 欄位 (第5欄，索引4)
                const departmentName = data[3] || '';  // Department Name 欄位 (第4欄，索引3)

                // 建立學位過濾器的正則表達式
                let degreeFilter = selectedDegrees.reduce((acc, degree) => {
                    const degreeList = degreeLevels[degree];
                    if (degreeList) {
                        acc.push(degreeList.join("|"));
                    }
                    return acc;
                }, []).join("|");

                if (!degreeFilter) {
                    return true;
                }

                const degreeRegex = new RegExp(degreeFilter, 'i');

                // 優先檢查 Degree Level 是否匹配
                if (degreeLevel && degreeLevel !== 'N/A' && degreeRegex.test(degreeLevel)) {
                    return true;
                }

                // 如果 Degree Level 沒有值或不匹配，檢查 Department Name
                if (!degreeLevel || degreeLevel === 'N/A') {
                    return degreeRegex.test(departmentName);
                }

                return false;
            }

            // 添加自定義搜尋函數
            $.fn.dataTable.ext.search.push(customDegreeSearch);

            degreeSelectDiv.addEventListener("change", function (event) {
                if ($.fn.dataTable.isDataTable('#json-table')) {
                    var table = $('#json-table').DataTable();
                    table.draw(); // 重新繪製表格以應用過濾器
                } else {
                    console.error("DataTable is not initialized.");
                }
            });

            // 初始觸發一次變更事件
            degreeSelectDiv.dispatchEvent(new Event("change"));
        })
        .catch(error => {
            console.error("載入學位資料失敗：", error);
            degreeSelectDiv.innerHTML = "Loading failed, please try again.";
        });
});

$(document).ready(function () {
    // Ensure degreeFilter is correctly set
    $('#degree-select').on('change', function () {
        var degreeFilter = $(this).val();
        console.log("Selected degree filter: ", degreeFilter); // Debugging log

        // Ensure DataTable is initialized
        if ($.fn.dataTable.isDataTable('#json-table')) {
            var table = $('#json-table').DataTable();
            console.log("DataTable instance: ", table); // Debugging log

            // Apply the filter - 現在使用 Degree Level 欄位 (索引 4)
            table.column(4).search(degreeFilter, true, false).draw();
        } else {
            console.error("DataTable is not initialized.");
        }
    });
});
