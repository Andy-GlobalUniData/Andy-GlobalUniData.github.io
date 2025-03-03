document.addEventListener("DOMContentLoaded", function () {
    let universityData = []; // 這裡將初始值設為空陣列

    const countrySelectDiv = document.getElementById("country-select");
    const schoolSelectDiv = document.getElementById("school-select");

    // 顯示載入中的提示
    countrySelectDiv.innerHTML = "loading...";
    schoolSelectDiv.innerHTML = "loading...";

    // 1. 讀取 JSON 檔案並賦值給 universityData
    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入 JSON：", data);
            universityData = data; // 賦值給 universityData

            // 2. 取得所有不重複的國家並排序
            const countries = [...new Set(universityData.map(item => item.Country))].sort(); // 按字典序排序

            // 3. 動態生成國家選項並預設勾選
            countrySelectDiv.innerHTML = countries.map(country => `
                <label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label><br>
            `).join(" ");

            // 4. 當國家選擇改變時，更新大學選項
            countrySelectDiv.addEventListener("change", function () {
                const selectedCountries = [...document.querySelectorAll(".country-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                // 根據選中的國家篩選對應的大學
                const selectedSchools = universityData.filter(item => selectedCountries.includes(item.Country));

                // 5. 取得所有學校名並排序
                const schoolNames = selectedSchools.map(school => school.School_name).sort(); // 按字典序排序

                // 顯示對應的大學，並使用 checkbox 形式，預設勾選
                schoolSelectDiv.innerHTML = schoolNames.map(schoolName => {
                    // 找到對應的學校資訊
                    const school = selectedSchools.find(item => item.School_name === schoolName);
                    return `
                        <div class="school-item">
                            <label><input type="checkbox" class="school-checkbox" value="${school.School_name}" checked> 
                            ${school.School_name} (${school.City})</label>
                        </div>
                    `;
                }).join(" ");

                // 觸發一次 "change" 事件，模擬更新或其他操作
                schoolSelectDiv.dispatchEvent(new Event("change"));
            });

            // 模擬觸發 change 事件，以便一開始就顯示學校選項
            countrySelectDiv.dispatchEvent(new Event("change"));
        })
        .catch(error => {
            console.error("載入 JSON 失敗：", error);
            countrySelectDiv.innerHTML = "Loading failed, please try again.";
            schoolSelectDiv.innerHTML = "Loading failed, please try again.";
        });
});