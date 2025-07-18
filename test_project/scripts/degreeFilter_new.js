document.addEventListener("DOMContentLoaded", function () {
    const degreeContentDiv = document.getElementById("degree-selector-content");

    if (degreeContentDiv) {
        degreeContentDiv.innerHTML = "<div class='loading-placeholder'>載入中...</div>";
    }

    // 讀取 Degree_data.json 資料
    fetch("data/Degree_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入學位資料：", data);

            const degreeLevels = data;
            const degreeOptions = Object.keys(degreeLevels).map(degree => `
                <div class="school-item">
                    <label><input type="checkbox" class="degree-checkbox" value="${degree}"> ${degree}</label>
                </div>
            `).join("");

            degreeContentDiv.innerHTML = `
                <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                    <label><input type="checkbox" class="degree-checkbox" value="No Filter" checked> <strong>不篩選學位</strong></label>
                </div>
                ${degreeOptions}
            `;

            // 設置初始狀態為收合
            setTimeout(() => {
                const expandBtn = document.querySelector('.expand-btn');
                if (expandBtn) {
                    expandBtn.click(); // 觸發一次點擊以設置為收合狀態
                }
            }, 100);

            degreeContentDiv.addEventListener("change", function (event) {
                const selectedDegrees = [...document.querySelectorAll(".degree-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                if (selectedDegrees.includes("No Filter")) {
                    // 選擇"不篩選學位"時，取消其他所有選項
                    document.querySelectorAll(".degree-checkbox").forEach(checkbox => {
                        if (checkbox.value !== "No Filter") {
                            checkbox.checked = false;
                            checkbox.disabled = true;
                        }
                    });

                    // 清除DataTable的學位篩選
                    if (window.dataTable) {
                        window.dataTable.column(3).search("").draw();
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

                    // 建立學位篩選條件
                    let degreeFilter = selectedDegrees.reduce((acc, degree) => {
                        const degreeList = degreeLevels[degree];
                        if (degreeList) {
                            acc = acc.concat(degreeList);
                        }
                        return acc;
                    }, []).join("|");

                    // 應用篩選到DataTable
                    if (window.dataTable && degreeFilter) {
                        window.dataTable.column(3).search(degreeFilter, true, false).draw();
                    }
                }
            });
        })
        .catch(error => {
            console.error("載入學位資料失敗：", error);
            if (degreeContentDiv) {
                degreeContentDiv.innerHTML = "<div class='loading-placeholder' style='color: var(--error-color);'>載入失敗，請重新整理頁面</div>";
            }
        });
});
