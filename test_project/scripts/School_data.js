document.addEventListener("DOMContentLoaded", function () {
    let universityData = [];
    let selectedSchools = []; // 用來記錄選中的學校

    const countrySelectDiv = document.getElementById("country-select");
    const schoolSelectDiv = document.getElementById("school-select");

    countrySelectDiv.innerHTML = "loading...";
    schoolSelectDiv.innerHTML = "loading...";

    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入 JSON：", data);
            universityData = data;

            const countries = [...new Set(universityData.map(item => item.Country))].sort();

            // 生成國家選項
            let countryHTML = countries.map(country => `
                <label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label><br>
            `).join("");

            // 加入「全選國家」按鈕
            countrySelectDiv.innerHTML = `
                <h3>Select Country</h3>
                <label><input type="checkbox" id="select-all-countries" checked> 全選</label><br>
                ${countryHTML}
            `;

            // 監聽全選國家按鈕
            const selectAllCountriesCheckbox = document.getElementById("select-all-countries");
            selectAllCountriesCheckbox.addEventListener("change", function () {
                const countryCheckboxes = document.querySelectorAll(".country-checkbox");
                countryCheckboxes.forEach(checkbox => checkbox.checked = selectAllCountriesCheckbox.checked);
                countrySelectDiv.dispatchEvent(new Event("change"));
            });

            countrySelectDiv.addEventListener("change", function () {
                const selectedCountries = [...document.querySelectorAll(".country-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                const selectedSchoolsList = universityData.filter(item => selectedCountries.includes(item.Country));
                const schoolNames = selectedSchoolsList.map(school => school.School_name).sort();

                // 生成學校選項
                let schoolHTML = schoolNames.map(schoolName => {
                    const school = selectedSchoolsList.find(item => item.School_name === schoolName);
                    // 根據先前的選擇來保持學校的勾選狀態
                    const isChecked = selectedSchools.includes(school.School_name) ? 'checked' : '';
                    return `
                        <div class="school-item">
                            <label><input type="checkbox" class="school-checkbox" value="${school.School_name}" ${isChecked}> ${school.School_name} (${school.City})</label>
                        </div>
                    `;
                }).join("");

                // 加入「全選學校」按鈕
                schoolSelectDiv.innerHTML = `
                    <h3>Select School</h3>
                    <label><input type="checkbox" id="select-all-schools"> 全選</label><br>
                    ${schoolHTML}
                `;

                // 監聽全選學校按鈕
                const selectAllSchoolsCheckbox = document.getElementById("select-all-schools");
                selectAllSchoolsCheckbox.addEventListener("change", function () {
                    const schoolCheckboxes = document.querySelectorAll(".school-checkbox");
                    schoolCheckboxes.forEach(checkbox => checkbox.checked = selectAllSchoolsCheckbox.checked);
                    schoolSelectDiv.dispatchEvent(new Event("change"));
                });

                // 更新全選按鈕狀態
                updateSelectAllCheckbox(".country-checkbox", selectAllCountriesCheckbox);
                updateSelectAllCheckbox(".school-checkbox", selectAllSchoolsCheckbox);

                schoolSelectDiv.dispatchEvent(new Event("change"));
            });

            // 監聽個別 checkbox 變化，調整「全選」狀態
            function updateSelectAllCheckbox(selector, selectAllCheckbox) {
                document.addEventListener("change", function () {
                    const checkboxes = document.querySelectorAll(selector);
                    const checkedBoxes = document.querySelectorAll(`${selector}:checked`);
                    selectAllCheckbox.checked = checkboxes.length === checkedBoxes.length;
                });
            }

            // 監聽學校的選擇狀態變化
            schoolSelectDiv.addEventListener("change", function () {
                selectedSchools = [...document.querySelectorAll(".school-checkbox:checked")]
                    .map(checkbox => checkbox.value);
                // 觸發自定義事件以更新數據表格
                document.dispatchEvent(new Event("schoolSelectionChanged"));
            });

            // 更新國家選擇區域
            countrySelectDiv.dispatchEvent(new Event("change"));
        })
        .catch(error => {
            console.error("載入 JSON 失敗：", error);
            countrySelectDiv.innerHTML = "Loading failed, please try again.";
            schoolSelectDiv.innerHTML = "Loading failed, please try again.";
        });
});
