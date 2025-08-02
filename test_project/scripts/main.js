document.addEventListener("DOMContentLoaded", function () {
  let dataTable;
  let totalData = [];
  let index = 0;
  const chunkSize = 500;

  // 初始 selectedCountries, selectedSchools 和 selectedDepartments 為空陣列
  let selectedCountries = [];
  let selectedSchools = [];
  let selectedDepartments = [];

  // 將 dataTable 設為全局變量以便其他腳本訪問
  window.dataTable = null;

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
    if (dataTable) {
      dataTable.clear();
      index = 0; // 重置索引
      loadNextChunk(); // 重新加載資料
    }
  }

  // 頁面加載後，將所有國家、學校和學位的勾選框設為選中狀態
  $(document).ready(function () {
    // 首先載入數據表格
    fetchJsonData("data/data.json");

    // 簡單的延遲等待，讓選擇器先載入
    setTimeout(() => {
      console.log("Setting default selections...");
      $(".country-checkbox").prop("checked", true);
      $(".school-checkbox").prop("checked", true);
      $(".degree-checkbox").prop("checked", true);

      // 確保"不篩選學位"選項被選中
      $('.degree-checkbox[value="No Filter"]').prop("checked", true);

      updateSelectedFilters();
    }, 1500); // 1.5秒延遲
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
      const rawData = await response.json();

      // 載入學位分類數據
      const degreeResponse = await fetch('data/Degree_data.json');
      const degreeData = await degreeResponse.json();

      // 創建學位關鍵字到學位等級的映射
      const degreeMapping = {};
      Object.keys(degreeData).forEach(degreeLevel => {
        degreeData[degreeLevel].forEach(keyword => {
          degreeMapping[keyword.toLowerCase()] = degreeLevel;
        });
      });

      // 處理數據，添加 Degree Level 欄位
      totalData = rawData.map(item => {
        const departmentName = item["Department Name"] || "";
        let degreeLevel = "Other"; // 預設值

        const deptLower = departmentName.toLowerCase();

        // 博士學位識別
        if (deptLower.includes('phd') || deptLower.includes('ph.d') || deptLower.includes('doctoral')) {
          degreeLevel = "Doctoral Degrees / Ph.D.";
        }
        // 碩士學位識別
        else if (deptLower.includes('msc') || deptLower.includes('m.sc') ||
          deptLower.includes('ma ') || deptLower.includes('m.a') ||
          deptLower.includes('mba') || deptLower.includes('m.b.a') ||
          deptLower.includes('med') || deptLower.includes('m.ed') ||
          deptLower.includes('meng') || deptLower.includes('m.eng') ||
          deptLower.includes('mfa') || deptLower.includes('m.f.a') ||
          deptLower.includes('llm') || deptLower.includes('ll.m') ||
          deptLower.includes('master') || deptLower.includes('graduate') ||
          deptLower.includes('postgraduate')) {
          degreeLevel = "Graduate / Master Degrees";
        }
        // 學士學位識別
        else if (deptLower.includes('bsc') || deptLower.includes('b.sc') ||
          deptLower.includes('ba ') || deptLower.includes('b.a') ||
          deptLower.includes('bba') || deptLower.includes('b.b.a') ||
          deptLower.includes('bed') || deptLower.includes('b.ed') ||
          deptLower.includes('beng') || deptLower.includes('b.eng') ||
          deptLower.includes('bfa') || deptLower.includes('b.f.a') ||
          deptLower.includes('llb') || deptLower.includes('ll.b') ||
          deptLower.includes('bachelor') || deptLower.includes('undergraduate') ||
          deptLower.includes('majors') || deptLower.includes('minors')) {
          degreeLevel = "Undergraduate / Bachelor";
        }

        return {
          ...item,
          "Degree Level": degreeLevel
        };
      });

      // 如果 DataTable 已經存在，先銷毀它
      if ($.fn.dataTable.isDataTable('#json-table')) {
        $('#json-table').DataTable().destroy();
      }

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
          { title: "Degree Level", data: 4 },
          {
            title: "URL",
            data: 5,
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
              const url = row[5] || "";
              return url
                ? `<button class="copy-url-btn" data-url="${url}">Copy URL</button>`
                : "N/A";
            },
          },
        ],
        pageLength: 100,
        lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]],
        searching: true,
        destroy: true,
        language: {
          search: "Search Department：",
        },
        initComplete: function () {
          $('.dataTables_filter input').css({
            'font-size': '18px',
            'padding': '10px'
          });
          
          // 通知科系查詢功能 DataTable 已準備好
          console.log('DataTable 初始化完成，通知科系查詢功能');
          
          // 觸發自定義事件
          document.dispatchEvent(new Event('dataTableReady'));
        }
      });

      // 將 dataTable 設為全局變量
      window.dataTable = dataTable;

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
    const degreeLevel = row.find("td:nth-child(5)").text(); // Get Degree Level

    navigator.clipboard.writeText(url).then(() => {
      alert(`URL copied to clipboard!\n\nSchool: ${schoolName}\nDepartment: ${departmentName}\nDegree Level: ${degreeLevel}\nURL: ${url}`);
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
    const url = row.find("td:nth-child(6) a").attr("href") || row.find("td:nth-child(6)").text();
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
    if (index >= totalData.length || !dataTable) return;

    const chunk = totalData.slice(index, index + chunkSize);
    index += chunkSize;

    const formattedData = chunk.map((item) => {
      const isCountrySelected = selectedCountries.length === 0 || selectedCountries.includes(item["Country"]);
      const isSchoolSelected = selectedSchools.length === 0 || selectedSchools.includes(item["School Name"]);
      const isDegreeSelected = selectedDepartments.length === 0 ||
        selectedDepartments.includes("No Filter") ||
        selectedDepartments.includes(item["Degree Level"]);

      // 如果沒有選擇任何篩選條件，顯示所有數據
      const shouldShow = (selectedCountries.length === 0 && selectedSchools.length === 0 &&
        (selectedDepartments.length === 0 || selectedDepartments.includes("No Filter"))) ||
        (isCountrySelected || isSchoolSelected) && isDegreeSelected;

      if (!shouldShow) return null;

      return [
        '<input type="checkbox" class="row-checkbox">',
        item["Country"] || "N/A",
        item["School Name"] || "N/A",
        item["Department Name"] || "N/A",
        item["Degree Level"] || "Other",
        item.URL || "N/A",
      ];
    }).filter(row => row !== null); // 過濾掉null值

    if (formattedData.length > 0) {
      dataTable.rows.add(formattedData).draw(false);
    }

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

  $(document).on("click", "#select-all", function () {
    $(".row-checkbox").prop("checked", this.checked);
  });

  // 匯出 JSON
  $("#export-json").on("click", function () {
    const selectedData = getSelectedDataStable();
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).");
      return;
    }
    const jsonData = JSON.stringify(selectedData, null, 2);
    downloadFile("data.json", jsonData);
  });

  // 匯出 Excel
  $("#export-excel").on("click", function () {
    const selectedData = getSelectedDataStable();
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).");
      return;
    }
    const columns = ["Country", "School Name", "Department Name", "URL"];
    exportToExcel(selectedData, columns, 'selected_data.xlsx');
  });

  // 匯出 TXT (僅含 URL)
  $("#export-txt").on("click", function () {
    const selectedData = getSelectedDataStable();
    if (selectedData.length === 0) {
      alert("請先選擇至少一筆資料 (Please select at least one item).");
      return;
    }
    exportUrlsToTxt(selectedData, "selected_urls.txt");
  });

  // 從 DataTable 取得選中的資料
  function getSelectedData() {
    const selectedData = [];
    if (typeof dataTable === 'undefined' || !dataTable) {
      console.error("DataTable instance is not defined or initialized.");
      alert("表格尚未初始化，無法取得資料 (DataTable not initialized).");
      return selectedData;
    }

    dataTable.rows().every(function () {
      const rowNode = this.node();
      const checkbox = $(rowNode).find(".row-checkbox")[0];

      if (checkbox && checkbox.checked) {
        const data = this.data();
        selectedData.push({
          "Country": data[1],
          "School Name": data[2],
          "Department Name": data[3],
          "Degree Level": data[4],
          "URL": data[5],
        });
      }
    });
    return selectedData;
  }

  // 下載文件函數
  function downloadFile(filename, data) {
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // 匯出到 Excel
  function exportToExcel(data, columns, filename = 'data.xlsx') {
    const ws = XLSX.utils.json_to_sheet(data, { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  }

  // 匯出 URLs 到 TXT
  function exportUrlsToTxt(jsonData, filename = 'urls.txt') {
    if (!Array.isArray(jsonData)) {
      console.error("輸入的數據必須是一個陣列 (Input data must be an array).");
      return;
    }

    const urls = jsonData
      .map(item => item && item.URL)
      .filter(url => url !== undefined && url !== null)
      .map(url => String(url));

    if (urls.length === 0) {
      console.warn("在提供的數據中沒有找到有效的 URL (No valid URLs found in the provided data).");
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

  // 載入JSON數據並驗證
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
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
});
