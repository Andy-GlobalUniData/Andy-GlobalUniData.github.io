document.addEventListener("DOMContentLoaded", function () {
    let universityData = [];

    const countrySelect = $('#country-dropdown');
    const schoolSelect = $('#school-dropdown');

    // 初始化 Select2
    countrySelect.select2({
        placeholder: "Please select a country",
        allowClear: true,
        width: '100%'
    });

    schoolSelect.select2({
        placeholder: "Please select a school",
        allowClear: true,
        width: '100%'
    });

    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            universityData = data;

            // 取得所有不重複的國家並排序
            const countries = [...new Set(universityData.map(item => item.Country))].sort();

            // 動態生成國家選項
            countries.forEach(country => {
                countrySelect.append(new Option(country, country));
            });

            // 當國家選擇變動時，更新學校選項
            countrySelect.on('change', function () {
                const selectedCountries = countrySelect.val();

                // 根據選中的國家篩選對應的大學
                const selectedSchools = universityData.filter(item => selectedCountries.includes(item.Country));

                // 取得所有不重複的學校並排序
                const schoolNames = [...new Set(selectedSchools.map(school => school.School_name))].sort();

                // 動態更新學校選項
                schoolSelect.empty();
                schoolNames.forEach(schoolName => {
                    schoolSelect.append(new Option(schoolName, schoolName));
                });
            });

            // 模擬觸發一次選擇變動，來載入學校
            countrySelect.trigger('change');
        })
        .catch(error => {
            console.error("載入 JSON 失敗：", error);
            countrySelect.html("Loading failed, please try again.");
            schoolSelect.html("Loading failed, please try again.");
        });
});
