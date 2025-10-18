// ✨ 全域變數 - 供篩選使用
let schoolDataTable = null;  // DataTable 實例
let allSchoolData = [];      // 所有學校資料

document.addEventListener("DOMContentLoaded", function () {
    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            // ✨ 保存到全域變數
            allSchoolData = data;
            
            // 初始化 School Data Table
            initSchoolDataTable(data);
            
            console.log('✅ School Data loaded:', data.length, 'schools');
        })
        .catch(error => {
            console.error("Failed to load School_data.json:", error);
            document.getElementById("school-data-table-container").innerHTML = "Failed to load school data.";
        });
});

/**
 * 初始化 School Data Table
 */
function initSchoolDataTable(data) {
    // 格式化資料
    const formattedData = data.map(school => [
        school.School_name,
        school.Country,
        school.City,
        school.Number_of_departments,
        school.合作集團 || 'N/A',
        school.URL ? `<a href="${school.URL}" target="_blank">${school.URL.length > 30 ? school.URL.substring(0, 30) + "..." : school.URL}</a>` : "N/A"
    ]);
    
    // 初始化 DataTable
    schoolDataTable = $("#school-data-table").DataTable({
        data: formattedData,
        pageLength: 100,
        lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]],
        columns: [
            { title: "School Name" },
            { title: "Country" },
            { title: "City" },
            { title: "科系數量" },
            { title: "合作集團" },
            { title: "School URL" }
        ],
        destroy: false,
        deferRender: true,  // 延遲渲染,節省記憶體
        language: {
            lengthMenu: '顯示 _MENU_ 筆',
            info: '顯示 _START_ 到 _END_ 筆,共 _TOTAL_ 筆',
            infoEmpty: '沒有資料',
            infoFiltered: '(從 _MAX_ 筆中篩選)',
            search: '搜尋:'
        }
    });
    
    console.log('✅ School Data Table initialized');
}

/**
 * 更新 School Data Table (記憶體優化版)
 */
function updateSchoolDataTable() {
    if (!schoolDataTable || !allSchoolData) {
        console.warn('⚠️ School Data Table or data not ready');
        return;
    }
    
    // 獲取選中的學校 (從全域變數)
    const selectedSchoolNames = typeof selectedSchools !== 'undefined' ? selectedSchools : [];
    
    // 過濾資料 - 只顯示選中的學校
    const filteredData = selectedSchoolNames.length === 0 
        ? allSchoolData  // 如果沒有選擇或全選,顯示全部
        : allSchoolData.filter(school => 
            selectedSchoolNames.includes(school.School_name)
          );
    
    // 格式化資料 (記憶體優化 - 一次性處理)
    const formattedData = filteredData.map(school => [
        school.School_name,
        school.Country,
        school.City,
        school.Number_of_departments,
        school.合作集團 || 'N/A',
        school.URL ? `<a href="${school.URL}" target="_blank">${school.URL.length > 30 ? school.URL.substring(0, 30) + "..." : school.URL}</a>` : "N/A"
    ]);
    
    // 更新 DataTable (清空 + 添加 + 重繪)
    schoolDataTable.clear();
    schoolDataTable.rows.add(formattedData);
    schoolDataTable.draw(false);  // false = 不重置分頁,保持使用者當前位置
    
    console.log('✅ School Data Table updated:', filteredData.length, 'schools');
}
