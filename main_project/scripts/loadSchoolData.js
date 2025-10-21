// ==================== 🎯 TDD + PDCA: School Data Table 重構版本 ====================
// Plan: 簡化邏輯，只響應學校篩選器（與 SchoolMap 一致）
// Do: 實作類似 SchoolMap 的監聽機制
// Check: 驗證功能正確性
// Act: 持續優化改進

// ✨ 全域變數
let schoolDataTable = null;  // DataTable 實例
let allSchoolData = [];      // 所有學校資料

document.addEventListener("DOMContentLoaded", function () {
    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            allSchoolData = data;
            
            // 初始化 School Data Table（顯示全部）
            initSchoolDataTable(data);
            
            // 🎯 監聽學校選擇變化事件（與 SchoolMap 一致）
            document.addEventListener("schoolSelectionChanged", updateSchoolDataTableByChecked);
            
            console.log('✅ School Data loaded:', data.length, 'schools');
            console.log('🔗 Listening to schoolSelectionChanged event');
        })
        .catch(error => {
            console.error("Failed to load School_data.json:", error);
            const container = document.getElementById("school-data-table-container");
            if (container) {
                container.innerHTML = "<p style='color: red;'>Failed to load school data.</p>";
            }
        });
});

/**
 * 🎯 TDD: 初始化 School Data Table (簡化版本)
 * 只負責初始化表格，不處理篩選邏輯
 */
function initSchoolDataTable(data) {
    try {
        console.log('🏫 Initializing School Data Table with', data.length, 'schools');
        
        // 格式化資料
        const formattedData = data.map(school => [
            school.School_name,
            school.Country,
            school.City,
            school.Number_of_departments,
            school.合作集團 || 'N/A',
            school.URL ? `<a href="${school.URL}" target="_blank">${school.URL.length > 30 ? school.URL.substring(0, 30) + "..." : school.URL}</a>` : "N/A"
        ]);
        
        // 🎯 PDCA Check: 如果已存在,先銷毀
        if ($.fn.DataTable.isDataTable('#school-data-table')) {
            $('#school-data-table').DataTable().destroy();
            console.log('📋 Destroying existing School DataTable...');
        }
    
        // 🎯 初始化 DataTable with Scroller (虛擬滾動)
        schoolDataTable = $("#school-data-table").DataTable({
            data: formattedData,
            deferRender: true,      // 延遲渲染,節省記憶體
            scrollY: '400px',       // 虛擬滾動
            scrollCollapse: true,
            scroller: true,         // Scroller 擴充功能
            paging: true,           // 🎯 Scroller 需要 paging 支援
            pageLength: 50,         // 虛擬頁面大小
            columns: [
                { title: "School Name" },
                { title: "Country" },
                { title: "City" },
                { title: "科系數量" },
                { title: "合作集團" },
                { title: "School URL" }
            ],
            destroy: true,
            searching: true,
            ordering: true,
            info: true,
            language: {
                info: '顯示 _START_ 到 _END_ 筆,共 _TOTAL_ 筆',
                infoEmpty: '沒有資料',
                infoFiltered: '(從 _MAX_ 筆中篩選)',
                search: '搜尋學校:',
                zeroRecords: '沒有符合的學校資料',
                loadingRecords: '載入中...',
                processing: '處理中...'
            },
            dom: 'frti',            // 🎯 隱藏分頁控制項，只保留篩選、表格、資訊
            initComplete: function() {
                console.log('✅ School Data Table initialized (Scroller mode)');
                // 綁定搜尋事件來更新統計
                $('#school-data-table').on('search.dt', function() {
                    updateSchoolTableStatsFromTable();
                });
            }
        });
        
        // 監聽 draw 事件以更新統計
        schoolDataTable.on('draw', function() {
            updateSchoolTableStatsFromTable();
        });
        
        // 🎯 初始統計
        updateSchoolTableStatsFromTable();
        
    } catch (error) {
        console.error('❌ School DataTable 初始化失敗:', error);
        alert('School Data Table 初始化失敗,請重新整理頁面');
    }
}

/**
 * 🎯 TDD: 根據勾選的學校更新表格（與 SchoolMap 完全一致的邏輯）
 * 只響應 schoolSelectionChanged 事件
 */
function updateSchoolDataTableByChecked() {
    if (!schoolDataTable || !allSchoolData) {
        console.warn('⚠️ School Data Table or data not ready');
        return;
    }
    
    // 🎯 關鍵：與 SchoolMap 完全相同的邏輯
    // 取得所有勾選的學校名稱
    const checkedNames = Array.from(document.querySelectorAll('.school-checkbox:checked')).map(cb => cb.value);
    
    console.log('🔄 Updating School Data Table...', checkedNames.length, 'schools checked');
    
    // 過濾資料 - 只顯示勾選的學校
    const filteredData = allSchoolData.filter(school => 
        checkedNames.includes(school.School_name)
    );
    
    // 格式化資料
    const formattedData = filteredData.map(school => [
        school.School_name,
        school.Country,
        school.City,
        school.Number_of_departments,
        school.合作集團 || 'N/A',
        school.URL ? `<a href="${school.URL}" target="_blank">${school.URL.length > 30 ? school.URL.substring(0, 30) + "..." : school.URL}</a>` : "N/A"
    ]);
    
    // 更新 DataTable
    schoolDataTable.clear();
    schoolDataTable.rows.add(formattedData);
    schoolDataTable.draw(false);  // 不重置滾動位置
    
    // 更新統計
    updateSchoolTableStatsFromTable();
    
    console.log('✅ School Data Table updated:', filteredData.length, 'schools displayed');
}

/**
 * 🎯 TDD: 從 DataTable 當前狀態更新統計
 * 統計：總學校數、顯示學校數、涵蓋國家數
 */
function updateSchoolTableStatsFromTable() {
    if (!schoolDataTable) return;
    
    try {
        // 取得當前顯示的資料（考慮搜尋篩選）
        const displayedData = schoolDataTable.rows({ search: 'applied' }).data();
        const displayCount = displayedData.length;
        
        // 統計國家數量
        const countries = new Set();
        for (let i = 0; i < displayedData.length; i++) {
            const row = displayedData[i];
            if (row && row[1]) { // Country 欄位在 index 1
                countries.add(row[1]);
            }
        }
        
        const countryCount = countries.size;
        const totalCount = allSchoolData.length;
        
        // 更新統計顯示
        const totalElem = document.getElementById('school-total-count');
        const displayElem = document.getElementById('school-display-count');
        const countryElem = document.getElementById('school-country-count');
        
        if (totalElem) totalElem.textContent = `${totalCount} 所`;
        if (displayElem) displayElem.textContent = `${displayCount} 所`;
        if (countryElem) countryElem.textContent = `${countryCount} 個`;
        
        console.log('📊 School stats:', { total: totalCount, displayed: displayCount, countries: countryCount });
    } catch (error) {
        console.error('❌ Error updating school stats:', error);
    }
}
