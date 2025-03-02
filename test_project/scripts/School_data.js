document.addEventListener("DOMContentLoaded", function () {
    let universityData = []; // 這裡將初始值設為空陣列

    const countrySelectDiv = document.getElementById("country-select");
    const schoolSelectDiv = document.getElementById("school-select");

    // 1. 讀取 JSON 檔案並賦值給 universityData
    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入 JSON：", data);
            universityData = data; // 賦值給 universityData

            // 2. 取得所有不重複的國家
            const countries = [...new Set(universityData.map(item => item.Country))];

            // 3. 動態生成國家選項
            countrySelectDiv.innerHTML = countries.map(country => `
                <label><input type="checkbox" class="country-checkbox" value="${country}"> ${country}</label><br>
            `).join("");

            // 4. 當國家選擇改變時，更新大學選項
            countrySelectDiv.addEventListener("change", function () {
                const selectedCountries = [...document.querySelectorAll(".country-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                // 根據選中的國家篩選對應的大學
                const selectedSchools = universityData.filter(item => selectedCountries.includes(item.Country));

                // 5. 顯示對應的大學
                schoolSelectDiv.innerHTML = selectedSchools.map(school => `
                    <div>${school.School_name} (${school.City})</div>
                `).join("");
            });

            // 6. 檢查資料缺失
            data.forEach((item, index) => {
                if (!item["School Name"] || !item["Department Name"] || !item.URL) {
                    console.warn(`第 ${index + 1} 筆資料有缺失:`, item);
                }
            });

        })
        .catch(error => {
            console.error("載入 JSON 失敗：", error);
        });
});
