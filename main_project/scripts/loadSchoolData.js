// ==================== 🎯 TDD + PDCA: School Data Table 重構版本 ====================
// Plan: 簡化邏輯,只響應學校篩選器(與 SchoolMap 一致)
//       + 加入 degree_statistics 展開功能
// Do: 實作類似 SchoolMap 的監聽機制 + 子行展開
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
 * 🎯 TDD: 初始化 School Data Table (深度記憶體優化版本)
 * ⚡ 優化: 使用物件格式 + columns.render,避免預先格式化
 * 目標: 記憶體從 532MB 降至 200MB 以內
 */
function initSchoolDataTable(data) {
    try {
        console.log('🏫 Initializing School Data Table with', data.length, 'schools (Memory Optimized)');
        
        // 🎯 PDCA Check: 如果已存在,先銷毀
        if ($.fn.DataTable.isDataTable('#school-data-table')) {
            $('#school-data-table').DataTable().destroy();
            console.log('📋 Destroying existing School DataTable...');
        }
    
        // ⚡ 記憶體優化: 直接使用原始資料物件,不預先格式化
        schoolDataTable = $("#school-data-table").DataTable({
            data: data,             // ✅ 直接傳入物件陣列 (不是陣列的陣列)
            deferRender: true,      // ✅ 延遲渲染,節省記憶體
            scrollY: '400px',       // 虛擬滾動
            scrollCollapse: true,
            scroller: {
                displayBuffer: 3,   // ⚡ 只預載 3 頁 (預設 9 頁) - 節省記憶體
                boundaryScale: 0.3  // ⚡ 減少邊界預載 (預設 0.5)
            },
            paging: true,
            pageLength: 25,         // ⚡ 從 50 降到 25,減少 DOM 元素
            columns: [
                {
                    data: null,
                    render: function() { return ''; },  // 展開按鈕不需要資料
                    className: 'details-control',
                    orderable: false,
                    width: '30px',
                    createdCell: function(td) {
                        $(td).addClass('details-control');
                    }
                },
                {
                    data: 'School_name',  // ✅ 直接引用物件屬性
                    title: "School Name"
                },
                {
                    data: 'Country',
                    title: "Country"
                },
                {
                    data: 'City',
                    title: "City"
                },
                {
                    data: 'Number_of_departments',
                    title: "科系數量"
                },
                {
                    data: '合作集團',
                    defaultContent: 'N/A',  // ✅ 處理空值
                    title: "合作集團"
                },
                {
                    data: 'URL',
                    title: "School URL",
                    render: function(data, type, row) {
                        // ⚡ 只在顯示(display)時才生成 HTML,排序/搜尋時用原始值
                        if (type === 'display' && data) {
                            const displayUrl = data.length > 30 ? 
                                data.substring(0, 30) + "..." : data;
                            return `<a href="${data}" target="_blank">${displayUrl}</a>`;
                        }
                        return data || 'N/A';
                    }
                }
            ],
            order: [[1, 'asc']], // 預設按學校名稱排序
            destroy: true,
            searching: true,
            ordering: true,
            info: true,
            language: {
                info: '顯示 _START_ 到 _END_ 筆,共 _TOTAL_ 筆',
                infoEmpty: '沒有資料',
                infoFiltered: '(從 _MAX_ 筆中篩選)',
                search: ' ',
                zeroRecords: '沒有符合的學校資料',
                loadingRecords: '載入中...',
                processing: '處理中...'
            },
            dom: 'frti',            // 隱藏分頁控制項
            initComplete: function() {
                console.log('✅ School Data Table initialized (Memory Optimized: Object format + Scroller)');
                $('#school-data-table').on('search.dt', function() {
                    updateSchoolTableStatsFromTable();
                });
            }
        });
        
        // 🎯 綁定展開/收合事件 (使用 off 避免重複綁定)
        $('#school-data-table tbody').off('click', 'td.details-control').on('click', 'td.details-control', function() {
            const tr = $(this).closest('tr');
            const row = schoolDataTable.row(tr);
            const rowData = row.data();  // ⚡ 直接取得物件資料
            
            if (row.child.isShown()) {
                // 收合子行
                row.child.hide();
                tr.removeClass('shown');
                $(this).removeClass('open');
                console.log('📥 Child row closed for:', rowData.School_name);
            } else {
                // 展開子行
                const detailHtml = formatSchoolDetailRow(rowData);  // ⚡ 直接傳入物件
                row.child(detailHtml).show();
                tr.addClass('shown');
                $(this).addClass('open');
                console.log('📤 Child row opened for:', rowData.School_name);
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
 * ⚡ 記憶體優化: 使用 DataTables 內建搜尋功能,避免重複創建 DOM
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
    
    // ⚡ 記憶體優化: 清空舊的搜尋函數
    if ($.fn.dataTable.ext.search.length > 0) {
        $.fn.dataTable.ext.search.length = 0;
    }
    
    // ⚡ 使用自定義搜尋函數 - 直接使用 rowData 物件
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex, rowData) {
        if (settings.nTable.id !== 'school-data-table') {
            return true; // 不是目標表格,保持原樣
        }
        
        // ✅ 直接使用 rowData 物件 (不用陣列索引)
        return checkedNames.includes(rowData.School_name);
    });
    
    // 重新繪製表格 (不重建 DOM)
    schoolDataTable.draw();
    
    // 更新統計
    updateSchoolTableStatsFromTable();
    
    console.log('✅ School Data Table filtered (memory optimized)');
}

/**
 * 🎯 TDD: 格式化學校詳細資訊子行
 * 顯示 degree_statistics 統計資訊和官網連結
 * ⚡ 優化: 使用陣列收集 + join,減少字串操作
 * @param {Object} schoolData - 學校資料物件
 * @returns {String} HTML 字串
 */
function formatSchoolDetailRow(schoolData) {
    const stats = schoolData.degree_statistics;
    
    if (!stats) {
        return '<div class="degree-stats-detail"><p>此學校無學位統計資料</p></div>';
    }
    
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        return '<div class="degree-stats-detail"><p>此學校所有學位類型數量均為 0</p></div>';
    }
    
    // 學位類型中英對照 - 使用簡短版本
    const degreeLabels = {
        'Undergraduate': '大學部', 'Graduate': '研究所', 
        'Doctoral': '博士', 'ShortCourse': '短期',
        'Certificate': '證書', 'Diploma': '文憑', 'Other': '其他'
    };
    
    // ⚡ 使用陣列收集,最後 join (比字串累加效能好)
    const cards = [];
    for (const [key, value] of Object.entries(stats)) {
        if (value > 0) {
            const pct = (value / total * 100).toFixed(1);
            cards.push(
                `<div class="stat-card">` +
                `<div class="stat-label">${degreeLabels[key]}</div>` +
                `<div class="stat-value">${value}</div>` +
                `<div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>` +
                `<div class="stat-percentage">${pct}%</div>` +
                `</div>`
            );
        }
    }
    
    // 官網按鈕 - 簡化版本
    const websiteBtn = schoolData.URL ? 
        `<a href="${schoolData.URL}" target="_blank" class="website-btn">🔗 Visit</a>` : 
        '<span class="website-btn disabled">無官網</span>';
    
    // ⚡ 一次性組合 HTML,減少字串操作
    return (
        '<div class="degree-stats-detail">' +
        '<div class="degree-stats-header">' +
        '<div class="header-left">' +
        '<span class="header-icon">📊</span>' +
        '<div>' +
        `<div class="header-title">${schoolData.School_name}</div>` +
        `<div class="header-subtitle">Total: ${total}</div>` +
        '</div>' +
        '</div>' +
        `<div class="header-right">${websiteBtn}</div>` +
        '</div>' +
        `<div class="stats-grid">${cards.join('')}</div>` +
        '</div>'
    );
}

/**
 * 🎯 TDD: 從 DataTable 當前狀態更新統計
 * 統計:總學校數、顯示學校數、涵蓋國家數
 * ⚡ 優化: 使用物件格式,減少陣列索引操作
 */
function updateSchoolTableStatsFromTable() {
    if (!schoolDataTable) return;
    
    try {
        // 取得當前顯示的資料（考慮搜尋篩選）
        const displayedData = schoolDataTable.rows({ search: 'applied' }).data();
        const displayCount = displayedData.length;
        
        // 統計國家數量 - 使用 Set 去重
        const countries = new Set();
        for (let i = 0; i < displayedData.length; i++) {
            const rowData = displayedData[i];
            if (rowData && rowData.Country) {  // ✅ 直接使用物件屬性
                countries.add(rowData.Country);
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
