// 用來處理國家選擇的邏輯

// 初始化國家選項
function initializeCountrySelection(countries) {
    const countryCheckboxContainer = $("#country-checkboxes"); // 假設國家勾選框放在這個元素中
    countryCheckboxContainer.empty(); // 先清空內容
  
    countries.forEach((country) => {
      const checkboxHtml = `<label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label><br>`;
      countryCheckboxContainer.append(checkboxHtml);
    });
  
    // 觸發選擇變更的更新函數
    $(".country-checkbox").on("change", function () {
      updateSelectedCountries(); // 呼叫主程式碼中的更新選擇國家的函數
    });
  }
  
  // 讀取國家列表
  async function loadCountryList(url) {
    try {
      const response = await fetch(url);
      const countries = await response.json();
      initializeCountrySelection(countries);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }
  