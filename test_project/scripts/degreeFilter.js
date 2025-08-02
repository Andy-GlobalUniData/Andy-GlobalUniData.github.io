document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded - degreeFilter.js started");

    // 等待DOM完全載入後再執行
    setTimeout(function () {
        console.log("setTimeout triggered - starting degree filter initialization");
        const degreeContentDiv = document.getElementById("degree-selector-content");

        console.log("Checking degree selector element:", degreeContentDiv);

        if (!degreeContentDiv) {
            console.error("Degree selector element not found");
            return;
        }

        degreeContentDiv.innerHTML = "<div class='loading-placeholder'>載入中...</div>";

        console.log("Starting to fetch Degree_data.json");

        // 先測試文件是否可訪問
        const testUrl = "data/Degree_data.json";
        console.log("Attempting to fetch from:", testUrl);

        // 讀取 Degree_data.json 資料
        fetch(testUrl)
            .then(response => {
                console.log("Degree data response status:", response.status);
                console.log("Response headers:", response.headers);
                console.log("Response ok:", response.ok);
                console.log("Response URL:", response.url);

                if (!response.ok) {
                    throw new Error("HTTP error! status: " + response.status + " - " + response.statusText);
                }
                return response.text(); // 先獲取文本來檢查內容
            })
            .then(text => {
                console.log("Raw response text:", text);
                try {
                    const data = JSON.parse(text);
                    console.log("載入學位資料：", data);
                    return data;
                } catch (parseError) {
                    console.error("JSON parsing error:", parseError);
                    throw new Error("Invalid JSON format: " + parseError.message);
                }
            })
            .then((data) => {
                console.log("Successfully loaded degree data:", data);

                // 確保數據格式正確
                if (!data || typeof data !== 'object') {
                    throw new Error("Invalid data format received");
                }

                // 直接使用學位等級的主要分類
                const degreeLevels = Object.keys(data);
                console.log("Degree levels found:", degreeLevels);

                if (degreeLevels.length === 0) {
                    throw new Error("No degree levels found in data");
                }

                const degreeOptions = degreeLevels.map(degree =>
                    "<div class='school-item'>" +
                    "<label><input type='checkbox' class='degree-checkbox' value='" + degree + "'> " + degree + "</label>" +
                    "</div>"
                ).join("");

                console.log("Generated degree options HTML");

                degreeContentDiv.innerHTML =
                    "<div class='school-item' style='border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;'>" +
                    "<label><input type='checkbox' class='degree-checkbox' value='No Filter' checked> <strong>不篩選學位</strong></label>" +
                    "</div>" +
                    degreeOptions;

                console.log("Updated degree selector content");
                console.log("載入學位資料：", data);

                // 直接使用學位等級的主要分類
                const degreeLevels = Object.keys(data);
                const degreeOptions = degreeLevels.map(degree =>
                    "<div class='school-item'>" +
                    "<label><input type='checkbox' class='degree-checkbox' value='" + degree + "'> " + degree + "</label>" +
                    "</div>"
                ).join("");

                degreeContentDiv.innerHTML =
                    "<div class='school-item' style='border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;'>" +
                    "<label><input type='checkbox' class='degree-checkbox' value='No Filter' checked> <strong>不篩選學位</strong></label>" +
                    "</div>" +
                    degreeOptions;

                degreeContentDiv.addEventListener("change", function (event) {
                    const selectedDegrees = Array.from(document.querySelectorAll(".degree-checkbox:checked"))
                        .map(checkbox => checkbox.value);

                    console.log("選擇的學位等級:", selectedDegrees);

                    if (selectedDegrees.includes("No Filter")) {
                        // 選擇"不篩選學位"時，取消其他所有選項
                        document.querySelectorAll(".degree-checkbox").forEach(checkbox => {
                            if (checkbox.value !== "No Filter") {
                                checkbox.checked = false;
                                checkbox.disabled = true;
                            }
                        });

                        console.log("清除學位篩選");
                        // 清除DataTable的學位篩選 (學位等級是第5欄，索引為4)
                        if (window.dataTable && $.fn.dataTable.isDataTable('#json-table')) {
                            window.dataTable.column(4).search("").draw();
                        }
                    } else {
                        // 取消"不篩選學位"選項
                        const noFilterCheckbox = document.querySelector('.degree-checkbox[value="No Filter"]');
                        if (noFilterCheckbox) {
                            noFilterCheckbox.checked = false;
                        }

                        // 啟用所有學位選項
                        document.querySelectorAll(".degree-checkbox").forEach(checkbox => {
                            checkbox.disabled = false;
                        });

                        // 建立學位篩選條件 - 直接使用學位等級名稱
                        const degreeFilter = selectedDegrees.join("|");

                        console.log("應用學位篩選:", degreeFilter);
                        // 應用篩選到DataTable (學位等級是第5欄，索引為4)
                        if (window.dataTable && $.fn.dataTable.isDataTable('#json-table') && degreeFilter) {
                            window.dataTable.column(4).search(degreeFilter, true, false).draw();
                        }
                    }

                    // 觸發主要篩選邏輯更新
                    if (typeof updateSelectedFilters === 'function') {
                        updateSelectedFilters();
                    }
                });
            })
            .catch(error => {
                console.error("載入學位資料失敗：", error);
                console.error("Error stack:", error.stack);
                if (degreeContentDiv) {
                    degreeContentDiv.innerHTML = `
                        <div class='loading-placeholder' style='color: var(--error-color);'>
                            載入失敗，請重新整理頁面
                            <br>
                            <small>錯誤: ${error.message}</small>
                        </div>`;
                }
            });
    }, 1000); // 增加延遲時間到1秒
});