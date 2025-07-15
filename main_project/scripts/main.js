document.addEventListener("DOMContentLoaded", function () {
  let dataTable;
  let totalData = [];
  let index = 0;
  const chunkSize = 500;

  // 初始 selectedCountries, selectedSchools 和 selectedDepartments 為空陣列
  let selectedCountries = [];
  let selectedSchools = [];
  let selectedDepartments = [];

  // 更新選擇的學位
  function updateSelectedDepartments() {
    selectedDepartments = [];
    $(".degree-checkbox:checked").each(function () {
      selectedDepartments.push($(this).val());
    });
  }

  // 判斷是否選擇了學位
  function isDepartmentSelected(departmentName) {
    return selectedDepartments.includes(departmentName);
  }

  // 更新 selectedCountries、selectedSchools 和 selectedDepartments 為勾選的選項
  function updateSelectedFilters() {
    selectedCountries = [];
    selectedSchools = [];
    updateSelectedDepartments(); // 單獨更新學位

    // 更新選擇的國家
    $(".country-checkbox:checked").each(function () {
      selectedCountries.push($(this).val());
    });

    // 更新選擇的學校
    $(".school-checkbox:checked").each(function () {
      selectedSchools.push($(this).val());
    });

    // 當選擇變更後重新載入資料
    dataTable.clear();
    index = 0; // 重置索引
    loadNextChunk(); // 重新加載資料
  }

  // 頁面加載後，將所有國家、學校和學位的勾選框設為選中狀態
  $(document).ready(function () {
    $(".country-checkbox").prop("checked", true); // 使所有選擇框預設為選中狀態
    $(".school-checkbox").prop("checked", true);  // 使所有學校選擇框預設為選中狀態
    $(".degree-checkbox").prop("checked", true); // 使所有學位選擇框預設為選中狀態
    updateSelectedFilters(); // 呼叫更新函數以加載資料

    // Initialize DataTable
    var table = $('#json-table').DataTable({
      // ...existing DataTable options...
    });

    // Ensure the DataTable is initialized
    console.log("DataTable initialized: ", table); // Debugging log
  });

  // 監聽勾選框的變更事件
  $(document).on("change", ".country-checkbox, .school-checkbox, .degree-checkbox", function () {
    updateSelectedFilters();
  });

  // 監聽自定義的學校選擇變更事件
  document.addEventListener("schoolSelectionChanged", function () {
    updateSelectedFilters();
  });

  async function fetchJsonData(url) {
    try {
      const response = await fetch(url);
      totalData = await response.json();

      dataTable = $("#json-table").DataTable({
        data: [],
        columns: [
          {
            title: "<input type='checkbox' id='select-all'>",
            orderable: false,
            render: function () {
              return '<input type="checkbox" class="row-checkbox">';
            },
          },
          { title: "Country", data: 1 },
          { title: "School Name", data: 2 },
          { title: "Department Name", data: 3 },
          {
            title: "URL",
            data: 4,
            defaultContent: "N/A",
            render: function (data) {
              if (!data) return "N/A";
              return `<a href="${data}" target="_blank">${data.length > 30 ? data.substring(0, 30) + "..." : data}</a>`;
            },
          },
          {
            title: "Copy URL",
            orderable: false,
            render: function (data, type, row) {
              const url = row[4] || ""; // Ensure URL exists
              return url
                ? `<button class="copy-url-btn" data-url="${url}">Copy URL</button>`
                : "N/A";
            },
          },
        ],
        pageLength: 100,  // 預設顯示 100 筆
        lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]], // 設定下拉選單選項
        searching: true,
        destroy: false,
        language: {
          search: "Search Department：",  // 這裡修改搜尋框的名稱
        },
        initComplete: function () {
          // 調整搜尋框字體大小
          $('.dataTables_filter input').css({
            'font-size': '18px',  // 設定搜尋框的字體大小
            'padding': '10px'      // 也可以調整內邊距，讓框變大
          });
        }
      });

      setupSearchFilters(dataTable);
      loadNextChunk();
    } catch (error) {
      console.error("Error loading JSON:", error);
      alert("Error loading JSON: " + error.message);
    }
  }

  // Add event listener for "Copy URL" buttons
  $(document).on("click", ".copy-url-btn", function () {
    const url = $(this).data("url");
    const row = $(this).closest("tr");
    const schoolName = row.find("td:nth-child(3)").text(); // Get School Name
    const departmentName = row.find("td:nth-child(4)").text(); // Get Department Name

    navigator.clipboard.writeText(url).then(() => {
      alert(`URL copied to clipboard!\n\nSchool: ${schoolName}\nDepartment: ${departmentName}\nURL: ${url}`);
    }).catch(err => {
      console.error("Failed to copy URL: ", err);
    });
  });

  // 新增：複製所有勾選的URL到剪貼簿
  $(document).on("click", "#copy-all-urls", function () {
    const selectedData = getSelectedData(); // 取得所有勾選的資料
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).\nPlease select at least one item.");
      return;
    }
    const urls = selectedData
      .map(item => item && item.URL)
      .filter(url => url !== undefined && url !== null && url !== "N/A")
      .map(url => String(url));
    if (urls.length === 0) {
      alert("勾選的資料沒有有效的URL。\nNo valid URLs in selected items.");
      return;
    }
    const urlText = urls.join("\n");
    navigator.clipboard.writeText(urlText).then(() => {
      alert("已複製所有勾選的URL到剪貼簿！\nAll selected URLs copied to clipboard!\n\n" + urlText);
    }).catch(err => {
      alert("Failed to copy URLs: " + err);
    });
  });

  // 全域：跨頁勾選追蹤陣列（以URL為唯一key）
  let selectedRowURLs = [];

  // 監聽checkbox勾選，維護跨頁勾選陣列
  $(document).on("change", ".row-checkbox", function () {
    const row = $(this).closest("tr");
    const url = row.find("td:nth-child(5) a").attr("href") || row.find("td:nth-child(5)").text();
    if (!url) return;
    if (this.checked) {
      if (!selectedRowURLs.includes(url)) selectedRowURLs.push(url);
    } else {
      selectedRowURLs = selectedRowURLs.filter(u => u !== url);
    }
  });

  // 切換分頁/搜尋/重繪時，根據陣列自動勾選checkbox
  $(document).on("draw.dt", function () {
    $("#json-table tbody tr").each(function () {
      const url = $(this).find("td:nth-child(5) a").attr("href") || $(this).find("td:nth-child(5)").text();
      if (selectedRowURLs.includes(url)) {
        $(this).find(".row-checkbox").prop("checked", true);
      } else {
        $(this).find(".row-checkbox").prop("checked", false);
      }
    });
  });

  // select-all 勾選/取消時，同步更新陣列
  $(document).on("click", "#select-all", function () {
    const checked = this.checked;
    $("#json-table tbody tr").each(function () {
      const url = $(this).find("td:nth-child(5) a").attr("href") || $(this).find("td:nth-child(5)").text();
      if (!url) return;
      if (checked) {
        if (!selectedRowURLs.includes(url)) selectedRowURLs.push(url);
      } else {
        selectedRowURLs = selectedRowURLs.filter(u => u !== url);
      }
    });
  });

  // 取得所有跨頁勾選的資料
  function getSelectedDataStable() {
    return totalData.filter(item => selectedRowURLs.includes(item.URL));
  }

  // 移除舊的 copy-all-urls 綁定，確保只會有一個穩定版
  $(document).off("click", "#copy-all-urls");

  // Copy All URLs/Export URL 都改用穩定版
  $(document).on("click", "#copy-all-urls", function () {
    const selectedData = getSelectedDataStable();
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).\nPlease select at least one item.");
      return;
    }
    const urls = selectedData
      .map(item => item && item.URL)
      .filter(url => url !== undefined && url !== null && url !== "N/A")
      .map(url => String(url));
    if (urls.length === 0) {
      alert("勾選的資料沒有有效的URL。\nNo valid URLs in selected items.");
      return;
    }
    const urlText = urls.join("\n");
    navigator.clipboard.writeText(urlText).then(() => {
      alert("已複製所有勾選的URL到剪貼簿！\nAll selected URLs copied to clipboard!\n\n" + urlText);
    }).catch(err => {
      alert("Failed to copy URLs: " + err);
    });
  });

  // Export URL (TXT) 也改用穩定版
  $(document).on("click", "#export-txt", function () {
    const selectedData = getSelectedDataStable();
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).\nPlease select at least one item.");
      return;
    }
    exportUrlsToTxt(selectedData, "selected_urls.txt");
  });

  function loadNextChunk() {
    if (index >= totalData.length) return;

    const chunk = totalData.slice(index, index + chunkSize);
    index += chunkSize;

    const formattedData = chunk.map((item) => {
      const isCountrySelected = selectedCountries.includes(item["Country"]);
      const isSchoolSelected = selectedSchools.includes(item["School Name"]);
      const departmentSelected = isDepartmentSelected(item["Department Name"]); // 使用單獨的判斷函數

      return [
        (isCountrySelected || isSchoolSelected || departmentSelected)
          ? '<input type="checkbox" class="row-checkbox" checked>'
          : '<input type="checkbox" class="row-checkbox">',
        item["Country"] || "N/A",
        item["School Name"] || "N/A",
        item["Department Name"] || "N/A",
        item.URL || "N/A",
      ];
    });

    // 只新增選中的國家、學校和學位的資料
    const filteredData = formattedData.filter(row =>
      selectedSchools.includes(row[2]) || isDepartmentSelected(row[3])
    );
    dataTable.rows.add(filteredData).draw(false);

    if (index < totalData.length) {
      setTimeout(loadNextChunk, 10);
    }
  }

  function setupSearchFilters(table) {
    $("#search-country").on("keyup", function () {
      table.column(1).search(this.value).draw();
    });
    $("#search-school").on("keyup", function () {
      table.column(2).search(this.value).draw();
    });

    $("#search-department").on("keyup", function () {
      table.column(3).search(this.value).draw();
    });

    $("#search-url").on("keyup", function () {
      table.column(4).search(this.value).draw();
    });
  }

  $(document).ready(function () {
    $(document).on("click", "#select-all", function () {
      $(".row-checkbox").prop("checked", this.checked);
    });

    // 匯出 JSON
    $("#export-json").on("click", function () {
      const selectedData = getSelectedData();
      if (selectedData.length === 0) {
        alert("請先選擇至少一筆資料 (Please select at least one item).");
        return;
      }
      const jsonData = JSON.stringify(selectedData, null, 2);
      downloadFile("data.json", jsonData); // 使用您提供的 downloadFile
    });

    // 匯出 Excel
    $("#export-excel").on("click", function () {
      const selectedData = getSelectedData();
      if (selectedData.length === 0) {
        alert("請先選擇至少一筆資料 (Please select at least one item).");
        return;
      }
      // 確保 Excel 欄位名稱與 getSelectedData 中建立的物件鍵名一致
      const columns = ["Country", "School Name", "Department Name", "URL"];
      exportToExcel(selectedData, columns, 'selected_data.xlsx');
    });

    // 匯出 TXT (僅含 URL)
    // 假設您有一個按鈕 <button id="export-txt">匯出 TXT</button>
    $("#export-txt").on("click", function () {
      const selectedData = getSelectedData(); // selectedData 是一個物件陣列
      if (selectedData.length === 0) {
        alert("請先選擇至少一筆資料 (Please select at least one item).");
        return;
      }
      // exportUrlsToTxt 函式期望得到一個物件陣列，
      // 並且它會從每個物件中尋找 'URL' 這個鍵。
      exportUrlsToTxt(selectedData, "selected_urls.txt");
    });


    // ---------- Helper Functions (您的既有函式) ----------

    // 從 DataTable 取得選中的資料
    // 假設 dataTable 是您的 DataTable 實例
    // 例如：var dataTable = $('#yourTableId').DataTable();
    function getSelectedData() {
      const selectedData = [];
      // 確保 dataTable 變數在此作用域中可用，或者作為參數傳入
      if (typeof dataTable === 'undefined' || !dataTable) {
        console.error("DataTable instance is not defined or initialized.");
        alert("表格尚未初始化，無法取得資料 (DataTable not initialized).");
        return selectedData; // 返回空陣列
      }

      dataTable.rows().every(function () {
        const rowNode = this.node(); // 取得 tr 元素
        const checkbox = $(rowNode).find(".row-checkbox")[0]; // 尋找該行內的 checkbox

        if (checkbox && checkbox.checked) {
          const data = this.data(); // 取得該行的數據 (通常是陣列或物件)
          // 根據您 DataTables 的數據結構調整索引
          // 假設 data[0] 是 checkbox 本身或不需使用的欄位
          // data[1] 是 Country, data[2] 是 School Name, data[3] 是 Department Name, data[4] 是 URL
          selectedData.push({
            "Country": data[1],
            "School Name": data[2],
            "Department Name": data[3],
            "URL": data[4], // 確保這個鍵是 'URL'，與 exportUrlsToTxt 期望的一致
          });
        }
      });
      return selectedData;
    }

    // 您原有的 downloadFile 函式 (用於 JSON)
    // 注意：此函式中的 Blob type 是 application/json，不適用於 TXT
    function downloadFile(filename, data) {
      const blob = new Blob([data], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link); // 為了更穩定的觸發下載
      link.click();
      document.body.removeChild(link); // 清理
      URL.revokeObjectURL(link.href); // 釋放資源
    }

    // 您原有的 exportToExcel 函式
    // 假設 XLSX 函式庫已載入
    function exportToExcel(data, columns, filename = 'data.xlsx') {
      // data 應該是物件陣列，例如: [{ "Country": "USA", "URL": "http://..." }, ...]
      // columns 應該是鍵名陣列，例如: ["Country", "School Name", "Department Name", "URL"]
      // SheetJS 的 json_to_sheet 第二個參數的 header 選項可以指定欄位順序和名稱
      const ws = XLSX.utils.json_to_sheet(data, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, filename);
    }


    // ---------- 新增的 Helper Function (用於 TXT) ----------
    /**
     * @description 從 JSON 數據中提取 'URL' 欄位的值，並將它們導出為 TXT 文件，每個 URL 佔一行。
     * @param {Array<Object>} jsonData - 包含對象的陣列，每個對象期望有一個 'URL' 鍵。
     * @param {string} [filename='urls.txt'] - 要導出的 TXT 文件的名稱。
     */
    function exportUrlsToTxt(jsonData, filename = 'urls.txt') {
      if (!Array.isArray(jsonData)) {
        console.error("輸入的數據必須是一個陣列 (Input data must be an array).");
        return;
      }

      const urls = jsonData
        .map(item => item && item.URL) // 取得 URL 值
        .filter(url => url !== undefined && url !== null) // 過濾掉 undefined 和 null
        .map(url => String(url)); // 確保是字串

      if (urls.length === 0) {
        console.warn("在提供的數據中沒有找到有效的 URL (No valid URLs found in the provided data).");
        // 如果您不希望下載空檔案，可以在這裡加上 alert 並 return
        // alert("未找到可匯出的 URL。");
        // return;
      }

      const textContent = urls.join('\n');
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("您的瀏覽器不支持此下載方法 (Your browser does not support this download method).");
      }
    }

  }); // End of $(document).ready

  fetchJsonData("data/data.json").then((data) => {
    console.log("載入 JSON：", data);

    data.forEach((item, index) => {
      if (!item["School Name"] || !item["Department Name"] || !item.URL) {
        console.warn(`第 ${index + 1} 筆資料有缺失:`, item);
      }
    });
  });
  // 更新日誌彈窗顯示/隱藏
  var showBtn = document.getElementById('show-changelog');
  var modal = document.getElementById('changelog-modal');
  var closeBtn = document.querySelector('.changelog-close');
  if (showBtn && modal && closeBtn) {
    showBtn.onclick = function () {
      modal.style.display = 'block';
    };
    closeBtn.onclick = function () {
      modal.style.display = 'none';
    };
    // 點擊 modal 外部區域也關閉
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
});
