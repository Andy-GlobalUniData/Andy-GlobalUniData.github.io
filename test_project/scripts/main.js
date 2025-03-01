document.addEventListener("DOMContentLoaded", function () {
    let dataTable;
    let totalData = [];
    let index = 0;
    const chunkSize = 200;
  
    let selectedCountries = [];
  
    function updateSelectedCountries() {
      selectedCountries = [];
      $(".country-checkbox:checked").each(function () {
        selectedCountries.push($(this).val());
      });
      dataTable.clear();
      index = 0; // 重置索引
      loadNextChunk(); // 重新加載資料
    }
  
    $(document).ready(function () {
      loadCountryList("data/countries.json"); // 這是載入國家列表的地方
      updateSelectedCountries(); // 呼叫更新函數以加載資料
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
                return `<a href="${data}" target="_blank">${data.length > 50 ? data.substring(0, 50) + "..." : data}</a>`;
              },
            },
          ],
          pageLength: 10,
          searching: true,
          destroy: false,
        });
  
        setupSearchFilters(dataTable);
        loadNextChunk();
      } catch (error) {
        console.error("Error loading JSON:", error);
        alert("Error loading JSON: " + error.message);
      }
    }
  
    function loadNextChunk() {
      if (index >= totalData.length) return;
  
      const chunk = totalData.slice(index, index + chunkSize);
      index += chunkSize;
  
      const formattedData = chunk.map((item) => {
        const isSelected = selectedCountries.includes(item["Country"]);
        return [
          isSelected ? '<input type="checkbox" class="row-checkbox" checked>' : '<input type="checkbox" class="row-checkbox">', // 自動選取
          item["Country"] || "N/A",
          item["School Name"] || "N/A",
          item["Department Name"] || "N/A",
          item.URL || "N/A",
        ];
      });
  
      // 只新增選中的國家的資料
      const filteredData = formattedData.filter(row => selectedCountries.includes(row[1]));
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
  
    // 選取所有 checkbox
    $(document).on("click", "#select-all", function () {
      $(".row-checkbox").prop("checked", this.checked);
    });
  
    // 匯出 JSON
    $("#export-json").on("click", function () {
      const selectedData = getSelectedData();
      const jsonData = JSON.stringify(selectedData, null, 2);
      downloadFile("data.json", jsonData);
    });
  
    // 匯出 Excel
    $("#export-excel").on("click", function () {
      const selectedData = getSelectedData();
      const excelData = selectedData.map((item) => [
        item["Country"],
        item["School Name"],
        item["Department Name"],
        item.URL,
      ]);
      exportToExcel(excelData);
    });
  
    function getSelectedData() {
      const selectedData = [];
      dataTable.rows().every(function () {
        const row = this.node();
        const checkbox = $(row).find(".row-checkbox")[0];
        if (checkbox && checkbox.checked) {
          const data = this.data();
          selectedData.push({
            "Country": data[1],
            "School Name": data[2],
            "Department Name": data[3],
            URL: data[4],
          });
        }
      });
      return selectedData;
    }
  
    function downloadFile(filename, data) {
      const blob = new Blob([data], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  
    function exportToExcel(data) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([["Country", "School Name", "Department Name", "URL"], ...data]);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, "data.xlsx");
    }
  
    fetchJsonData("data/data.json").then((data) => {
      console.log("載入 JSON：", data);
  
      data.forEach((item, index) => {
        if (!item["School Name"] || !item["Department Name"] || !item.URL) {
          console.warn(`第 ${index + 1} 筆資料有缺失:`, item);
        }
      });
    });
  });
  