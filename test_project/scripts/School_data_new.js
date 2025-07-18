document.addEventListener("DOMContentLoaded", function () {
    let universityData = [];
    let selectedSchools = [];

    const countryContentDiv = document.getElementById("country-selector-content");
    const schoolContentDiv = document.getElementById("school-selector-content");

    if (countryContentDiv) countryContentDiv.innerHTML = "<div class='loading-placeholder'>載入中...</div>";
    if (schoolContentDiv) schoolContentDiv.innerHTML = "<div class='loading-placeholder'>載入中...</div>";

    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入 JSON：", data);
            universityData = data;

            const countries = [...new Set(universityData.map(item => item.Country))].sort();

            // 生成國家選項
            let countryHTML = countries.map(country => `
                <div class="school-item">
                    <label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label>
                </div>
            `).join("");

            // 加入「全選國家」按鈕
            countryContentDiv.innerHTML = `
                <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                    <label><input type="checkbox" id="select-all-countries" checked> <strong>全選國家</strong></label>
                </div>
                ${countryHTML}
            `;

            // 監聽全選國家按鈕
            const selectAllCountriesCheckbox = document.getElementById("select-all-countries");
            selectAllCountriesCheckbox.addEventListener("change", function () {
                const countryCheckboxes = document.querySelectorAll(".country-checkbox");
                countryCheckboxes.forEach(checkbox => checkbox.checked = selectAllCountriesCheckbox.checked);
                updateSchoolList();
            });

            // 監聽國家選擇變化
            countryContentDiv.addEventListener("change", function (event) {
                if (event.target.classList.contains('country-checkbox')) {
                    updateSchoolList();
                    updateSelectAllState();
                }
            });

            function updateSchoolList() {
                const selectedCountries = [...document.querySelectorAll(".country-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                const selectedSchoolsList = universityData.filter(item => selectedCountries.includes(item.Country));
                const schoolNames = selectedSchoolsList.map(school => school.School_name).sort();

                // 生成學校選項
                let schoolHTML = schoolNames.map(schoolName => {
                    const school = selectedSchoolsList.find(item => item.School_name === schoolName);
                    const isChecked = selectedSchools.includes(school.School_name) ? 'checked' : 'checked';
                    return `
                        <div class="school-item">
                            <label><input type="checkbox" class="school-checkbox" value="${school.School_name}" ${isChecked}> ${school.School_name} (${school.City})</label>
                        </div>
                    `;
                }).join("");

                // 加入「全選學校」按鈕
                schoolContentDiv.innerHTML = `
                    <div class="school-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                        <label><input type="checkbox" id="select-all-schools" checked> <strong>全選學校</strong></label>
                    </div>
                    ${schoolHTML}
                `;

                // 監聽全選學校按鈕
                const selectAllSchoolsCheckbox = document.getElementById("select-all-schools");
                selectAllSchoolsCheckbox.addEventListener("change", function () {
                    const schoolCheckboxes = document.querySelectorAll(".school-checkbox");
                    schoolCheckboxes.forEach(checkbox => checkbox.checked = selectAllSchoolsCheckbox.checked);
                    updateSelectedSchools();
                });

                // 監聽學校選擇變化
                schoolContentDiv.addEventListener("change", function (event) {
                    if (event.target.classList.contains('school-checkbox')) {
                        updateSelectedSchools();
                        updateSchoolSelectAllState();
                    }
                });

                updateSelectedSchools();
            }

            function updateSelectAllState() {
                const selectAllCountriesCheckbox = document.getElementById("select-all-countries");
                const countryCheckboxes = document.querySelectorAll(".country-checkbox");
                const checkedCountries = document.querySelectorAll(".country-checkbox:checked");
                if (selectAllCountriesCheckbox) {
                    selectAllCountriesCheckbox.checked = countryCheckboxes.length === checkedCountries.length;
                }
            }

            function updateSchoolSelectAllState() {
                const selectAllSchoolsCheckbox = document.getElementById("select-all-schools");
                const schoolCheckboxes = document.querySelectorAll(".school-checkbox");
                const checkedSchools = document.querySelectorAll(".school-checkbox:checked");
                if (selectAllSchoolsCheckbox) {
                    selectAllSchoolsCheckbox.checked = schoolCheckboxes.length === checkedSchools.length;
                }
            }

            function updateSelectedSchools() {
                selectedSchools = [...document.querySelectorAll(".school-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                // 觸發自定義事件以更新數據表格和地圖
                document.dispatchEvent(new Event("schoolSelectionChanged"));
            }

            // 初始化學校列表
            updateSchoolList();
        })
        .catch(error => {
            console.error("載入 JSON 失敗：", error);
            if (countryContentDiv) countryContentDiv.innerHTML = "<div class='loading-placeholder' style='color: var(--error-color);'>載入失敗，請重新整理頁面</div>";
            if (schoolContentDiv) schoolContentDiv.innerHTML = "<div class='loading-placeholder' style='color: var(--error-color);'>載入失敗，請重新整理頁面</div>";
        });
});
