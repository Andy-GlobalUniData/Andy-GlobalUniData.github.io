/**
 * Andy Global University Data - 完整重構版本
 * @version 3.0.1
 * @author Andy
 * @date 2025-10-20
 */

(function() {
    'use strict';

    console.log('🚀 Andy Global Uni Data v3.0 - Refactored Version');

    // ==================== 全域變數 ====================
    let allData = [];           // 所有合併後的資料
    let schoolData = [];        // 學校資料 (包含集團資訊) ✨
    let dataTable = null;       // DataTable 實例
    let selectedGroups = [];    // 選中的集團 ✨
    let selectedCountries = []; // 選中的國家
    let selectedSchools = [];   // 選中的學校
    let selectedDegrees = [];   // 選中的學位
    let selectedRowURLs = [];   // 跨頁勾選的 URL 陣列
    let schoolToGroupMap = {};  // 學校→集團對應表 (記憶體優化:只建立一次) ✨

    const CHUNK_SIZE = 1000;    // 🎯 TDD: 增加批次到1000,減少批次數量
    let loadIndex = 0;          // 載入索引
    let isLoadingComplete = false; // 載入完成標記
    // ✨ PDCA Plan: 自動載入所有資料,使用虛擬滾動優化渲染

    // ==================== 1. 資料載入與合併 ====================
    
    /**
     * 載入並合併資料
     */
    async function loadAndMergeData() {
        try {
            console.log('📥 Loading data files...');

            // 並行載入兩個資料檔
            const [schoolDataResponse, departmentDataResponse] = await Promise.all([
                fetch('data/School_data.json'),
                fetch('data/data.json')
            ]);

            schoolData = await schoolDataResponse.json(); // 儲存到全域變數 ✨
            const departmentData = await departmentDataResponse.json();

            console.log('✅ School data loaded:', schoolData.length, 'schools');
            console.log('✅ Department data loaded:', departmentData.length, 'departments');

            // 建立 School Name → Country 對照表
            const schoolToCountry = new Map();
            schoolData.forEach(school => {
                const schoolName = school.School_name || school['School Name'];
                const country = school.Country;
                if (schoolName && country) {
                    schoolToCountry.set(schoolName, country);
                }
            });

            // 建立學校→集團對應表 (記憶體優化:只建立一次,包含"無_Group") ✨
            schoolToGroupMap = {};
            schoolData.forEach(school => {
                const schoolName = school.School_name || school['School Name'];
                const group = school['合作集團'];
                if (schoolName) {
                    // 如果沒有集團,對應到"無_Group" ✨
                    if (!group || group === '.' || group === 'N/A') {
                        schoolToGroupMap[schoolName] = '無_Group';
                    } else {
                        schoolToGroupMap[schoolName] = group;
                    }
                }
            });
            console.log('✅ School-to-Group map created:', Object.keys(schoolToGroupMap).length, 'entries');

            // 合併資料：為每個 department 加入 Country
            const mergedData = departmentData.map(item => ({
                'Country': schoolToCountry.get(item['School Name']) || 'Unknown',
                'School Name': item['School Name'] || 'N/A',
                'Department Name': item['Department Name'] || 'N/A',
                'Degree Level': item['Degree Level'] || 'N/A',
                'URL': item.URL || 'N/A'
            }));

            // 過濾掉沒有有效 Country 的資料
            allData = mergedData.filter(item => {
                if (item.Country === 'Unknown' || item.Country === 'N/A') {
                    console.warn('⚠️ Skipping item without country:', item['School Name']);
                    return false;
                }
                return true;
            });

            console.log('✅ Data merged successfully:', allData.length, 'records');
            console.log('📊 Filtered out:', mergedData.length - allData.length, 'records without country');
            return allData;

        } catch (error) {
            console.error('❌ Error loading data:', error);
            alert('Error loading data: ' + error.message);
            throw error;
        }
    }

    // ==================== 2. 選擇器初始化 ====================

    /**
     * 初始化 Group (集團) 選擇器 ✨
     */
    function initGroupSelector() {
        const container = document.getElementById('group-select');
        if (!container) return;

        // 取得所有集團並排序 ✨
        const groups = [...new Set(schoolData.map(item => item['合作集團']))]
            .filter(group => group && group !== '.' && group !== 'N/A')
            .sort();
        
        // 檢查是否有沒有集團的學校 ✨
        const hasNoGroupSchools = schoolData.some(school => {
            const group = school['合作集團'];
            return !group || group === '.' || group === 'N/A';
        });
        
        let html = '<h3>Select Group</h3>';
        html += '<label><input type="checkbox" id="select-all-groups" checked> 全選集團</label><br>';
        
        groups.forEach(group => {
            html += `<label><input type="checkbox" class="group-checkbox" value="${group}" checked> ${group}</label><br>`;
        });
        
        // 如果有沒有集團的學校,添加"無_Group"選項 ✨
        if (hasNoGroupSchools) {
            html += `<label><input type="checkbox" class="group-checkbox" value="無_Group" checked> 無_Group</label><br>`;
            groups.push('無_Group');
        }

        container.innerHTML = html;

        // 初始化選中的集團 (包含"無_Group")
        selectedGroups = [...groups];

        // 綁定事件
        $('#select-all-groups').on('change', function() {
            console.log('🔄 全選集團:', this.checked ? '勾選' : '取消');
            $('.group-checkbox').prop('checked', this.checked);
            updateSchoolSelector();  // ✨ 更新學校列表
            updateFilters();
        });

        $('.group-checkbox').on('change', function() {
            const allChecked = $('.group-checkbox:checked').length === $('.group-checkbox').length;
            $('#select-all-groups').prop('checked', allChecked);
            updateSchoolSelector();  // ✨ 更新學校列表
            updateFilters();
        });

        console.log('✅ Group selector initialized:', groups.length, 'groups');
    }

    /**
     * 初始化 Country 選擇器 (獨立版本 - 不受集團影響) ✨
     */
    function initCountrySelector() {
        const container = document.getElementById('country-select');
        if (!container) return;

        // 國家選擇器獨立,不監聽集團變化 ✨
        // 取得所有國家並排序
        const countries = [...new Set(allData.map(item => item.Country))]
            .filter(country => country && country !== 'N/A')
            .sort();
        
        let html = '<h3>Select Country</h3>';
        html += '<label><input type="checkbox" id="select-all-countries" checked> 全選國家</label><br>';
        
        countries.forEach(country => {
            html += `<label><input type="checkbox" class="country-checkbox" value="${country}" checked> ${country}</label><br>`;
        });

        container.innerHTML = html;

        // 初始化選中的國家
        selectedCountries = [...countries];

        // 綁定事件
        $('#select-all-countries').on('change', function() {
            console.log('🔄 全選國家:', this.checked ? '勾選' : '取消');
            $('.country-checkbox').prop('checked', this.checked);
            updateSchoolSelector();  // ✨ 更新學校列表
            updateFilters();
        });

        $('.country-checkbox').on('change', function() {
            const allChecked = $('.country-checkbox:checked').length === $('.country-checkbox').length;
            $('#select-all-countries').prop('checked', allChecked);
            updateSchoolSelector();  // ✨ 更新學校列表
            updateFilters();
        });

        console.log('✅ Country selector initialized (independent):', countries.length, 'countries');
    }

    /**
     * 初始化 School 選擇器 (交集版本 - 集團 AND 國家) ✨
     */
    function initSchoolSelector() {
        const container = document.getElementById('school-select');
        if (!container) return;

        // 監聽 Group 和 Country 的變化來更新學校列表 (AND 邏輯) ✨
        $(document).on('change.schoolUpdate', '.group-checkbox, .country-checkbox', function() {
            updateSchoolSelector();
        });

        updateSchoolSelector();
    }

    /**
     * 更新 School 選擇器 (AND 邏輯 - 集團 AND 國家的交集) ✨
     * 記憶體優化版本: 減少中間陣列,使用 Array.from 代替展開運算符
     */
    function updateSchoolSelector() {
        const container = document.getElementById('school-select');
        if (!container) return;

        // 使用 Array.from 直接建立陣列,避免 jQuery each (記憶體優化) ✨
        const groupCheckboxes = document.querySelectorAll('.group-checkbox:checked');
        const countryCheckboxes = document.querySelectorAll('.country-checkbox:checked');
        
        const selectedGroupsTemp = Array.from(groupCheckboxes, cb => cb.value);
        const selectedCountriesTemp = Array.from(countryCheckboxes, cb => cb.value);

        // 學校 = 集團 AND 國家的交集 ✨
        let filteredSchools = schoolData;
        
        // 依集團篩選 (如果有選擇) - 包含"無_Group"處理 ✨
        if (selectedGroupsTemp.length > 0) {
            filteredSchools = filteredSchools.filter(school => {
                const schoolGroup = school['合作集團'];
                
                // 如果學校沒有集團,檢查是否選中了"無_Group"
                if (!schoolGroup || schoolGroup === '.' || schoolGroup === 'N/A') {
                    return selectedGroupsTemp.includes('無_Group');
                }
                
                // 否則檢查學校的集團是否在選中列表中
                return selectedGroupsTemp.includes(schoolGroup);
            });
        }
        
        // 依國家篩選 (如果有選擇) - AND 邏輯
        if (selectedCountriesTemp.length > 0) {
            filteredSchools = filteredSchools.filter(school => 
                selectedCountriesTemp.includes(school.Country)
            );
        }

        // 使用 Array.from 取代展開運算符,減少記憶體 ✨
        const schools = Array.from(
            new Set(
                filteredSchools
                    .map(school => school.School_name)
                    .filter(school => school && school !== 'N/A')
            )
        ).sort();

        // 使用陣列 join 代替字串拼接,提升效能 ✨
        const htmlParts = [
            '<h3>Select School</h3>',
            '<label><input type="checkbox" id="select-all-schools" checked> 全選學校</label><br>'
        ];
        
        schools.forEach(school => {
            htmlParts.push(`<label><input type="checkbox" class="school-checkbox" value="${school}" checked> ${school}</label><br>`);
        });
        
        container.innerHTML = htmlParts.join('');  // 一次性寫入 DOM ✨

        // 更新全域變數 (不使用展開運算符,直接賦值) ✨
        selectedSchools = schools;

        // 綁定事件
        $('#select-all-schools').on('change', function() {
            $('.school-checkbox').prop('checked', this.checked);
            updateFilters();
        });

        $('.school-checkbox').on('change', function() {
            const allChecked = $('.school-checkbox:checked').length === $('.school-checkbox').length;
            $('#select-all-schools').prop('checked', allChecked);
            updateFilters();
        });

        console.log('✅ School selector updated:', schools.length, 'schools (AND logic: groups AND countries)');
    }

    /**
     * 初始化 Degree 選擇器
     */
    function initDegreeSelector() {
        const container = document.getElementById('degree-select');
        if (!container) return;

        // 定義學位類型
        const degrees = [
            { value: 'Bachelor', label: 'Undergraduate / Bachelor' },
            { value: 'Master', label: 'Graduate / Master Degrees' },
            { value: 'Doctoral', label: 'Doctoral Degrees / Ph.D.' },
            { value: 'Short Course', label: 'Short Course' },
            { value: 'Certificate', label: 'Certificate' },
            { value: 'Diploma', label: 'Diploma' }
        ];

        let html = '<h3>Select Degree Level</h3>';
        html += '<label><input type="checkbox" id="no-degree-filter" checked> 不篩選學位</label><br>';
        
        degrees.forEach(degree => {
            html += `<label><input type="checkbox" class="degree-checkbox" value="${degree.value}"> ${degree.label}</label><br>`;
        });

        container.innerHTML = html;

        // 綁定「不篩選學位」checkbox
        $('#no-degree-filter').on('change', function() {
            if (this.checked) {
                $('.degree-checkbox').prop('checked', false);
                selectedDegrees = [];
            }
            updateFilters();
        });

        // 綁定學位 checkbox
        $('.degree-checkbox').on('change', function() {
            if ($('.degree-checkbox:checked').length > 0) {
                $('#no-degree-filter').prop('checked', false);
            } else {
                $('#no-degree-filter').prop('checked', true);
            }
            updateFilters();
        });

        console.log('✅ Degree selector initialized');
    }

    // ==================== 3. 表格初始化 ====================

    /**
     * 初始化 DataTable (優化版本 - 減少記憶體使用)
     */
    function initDataTable() {
        dataTable = $('#json-table').DataTable({
            data: [],
            columns: [
                {
                    title: '<input type="checkbox" id="select-all">',
                    orderable: false,
                    render: function() {
                        return '<input type="checkbox" class="row-checkbox">';
                    }
                },
                { title: 'Country', data: 1 },
                { title: 'School Name', data: 2 },
                { title: 'Department Name', data: 3 },
                { title: 'Degree Level', data: 4 },
                {
                    title: 'URL',
                    data: 5,
                    render: function(data) {
                        if (!data || data === 'N/A') return 'N/A';
                        const displayText = data.length > 40 ? data.substring(0, 40) + '...' : data;
                        return `<a href="${data}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
                    }
                },
                {
                    title: 'Copy URL',
                    orderable: false,
                    render: function(data, type, row) {
                        const url = row[5];
                        if (!url || url === 'N/A') return 'N/A';
                        return `<button class="copy-url-btn" data-url="${url}">Copy URL</button>`;
                    }
                }
            ],
            // 🎯 TDD + PDCA 優化配置
            // Plan: 使用 Scroller 虛擬滾動 + 自動載入所有資料
            scrollY: '600px',       // 固定高度,啟用滾動
            scrollCollapse: true,   // 高度自適應
            deferRender: true,      // ✅ 延遲渲染 - 只渲染可見行
            scroller: {             // ✅ 虛擬滾動配置
                displayBuffer: 9,   // 預載入前後9行 (約20行在視窗內)
                loadingIndicator: true, // 顯示載入指示器
                boundaryScale: 0.5  // 滾動邊界縮放
            },
            paging: true,           // Scroller 需要分頁支援
            pageLength: 0.01,        // 虛擬頁面大小
            searching: true,        // ✅ 啟用搜尋
            ordering: true,         // ✅ 啟用排序
            destroy: false,
            processing: true,       // 顯示處理中
            orderClasses: false,    // 不添加排序類別,節省記憶體
            autoWidth: false,       // 不自動計算寬度
            language: {
                search: '.',
                processing: '⏳ 載入中...',
                info: '顯示 _START_ 到 _END_ 筆，共 _TOTAL_ 筆',
                infoEmpty: '沒有資料',
                infoFiltered: '(從 _MAX_ 筆中篩選)',
                loadingRecords: '載入中...',
                zeroRecords: '沒有符合的資料'
            },
            initComplete: function() {
                // 隱藏搜尋框但保持 searching:true，避免表格鎖死 ✨
                $('#departmentTable_wrapper .dataTables_filter').hide();
                console.log('✅ Department DataTable initialized (search box hidden)');
            },
            drawCallback: function() {
                // 🎯 TDD: 每次重繪時更新統計
                updateTableStats();
            }
        });

        // 🎯 TDD + PDCA Act: 修復全選功能 - 使用 DataTable API 而非 DOM 查詢 ✨
        // Test Case 1: 全選應該選中所有過濾後的資料 (包含不可見的行)
        // Test Case 2: 取消全選應該清空所有選取
        // Test Case 3: 換頁後勾選狀態應該正確恢復
        $(document).on('click', '#select-all', function() {
            const checked = this.checked;
            
            // 🎯 TDD: 先更新可見行的 checkbox (即時回饋)
            $('.row-checkbox').prop('checked', checked);
            
            if (checked) {
                // 🎯 PDCA Do: 使用 DataTable API 取得所有過濾後的行資料
                // rows({ search: 'applied' }) 會取得所有符合當前搜尋/篩選條件的行
                const allFilteredRows = dataTable.rows({ search: 'applied' }).data();
                
                // 清空並重新建立選取列表
                selectedRowURLs = [];
                
                // 遍歷所有行，提取 URL (index 5 是 URL 欄位)
                allFilteredRows.each(function(rowData) {
                    const url = rowData[5]; // URL 在第6欄 (index 5)
                    if (url && url !== 'N/A' && url !== '<input type="checkbox" class="row-checkbox">') {
                        // 避免重複添加
                        if (!selectedRowURLs.includes(url)) {
                            selectedRowURLs.push(url);
                        }
                    }
                });
                
                console.log(`✅ TDD Check: 全選完成 - 已選取 ${selectedRowURLs.length} 個 URL (包含不可見的行)`);
            } else {
                // 🎯 TDD: 取消全選 - 清空所有選取
                selectedRowURLs = [];
                console.log('✅ TDD Check: 取消全選 - 已清空所有選取');
            }
        });

        // 🎯 TDD: 綁定單行 checkbox - 同步更新全選狀態 ✨
        // Test Case: 當所有行都被勾選時，全選 checkbox 應該自動勾選
        // Test Case: 當任一行被取消勾選時，全選 checkbox 應該自動取消
        $(document).on('change', '.row-checkbox', function() {
            const row = $(this).closest('tr');
            const url = row.find('td:eq(5) a').attr('href') || row.find('td:eq(5)').text();
            
            if (url && url !== 'N/A') {
                if (this.checked) {
                    // 🎯 TDD: 勾選時添加到選取列表
                    if (!selectedRowURLs.includes(url)) {
                        selectedRowURLs.push(url);
                    }
                } else {
                    // 🎯 TDD: 取消勾選時從列表移除
                    selectedRowURLs = selectedRowURLs.filter(u => u !== url);
                }
                
                // 🎯 PDCA Check: 同步更新全選 checkbox 狀態
                // 如果選取數量等於所有過濾後的資料數量，則勾選全選 checkbox
                const totalFilteredRows = dataTable.rows({ search: 'applied' }).count();
                const allSelected = selectedRowURLs.length === totalFilteredRows;
                $('#select-all').prop('checked', allSelected);
                
                console.log(`🔄 TDD Check: 已選取 ${selectedRowURLs.length}/${totalFilteredRows} 個 URL`);
            }
        });

        // 🎯 TDD + PDCA Check: 表格重繪時恢復勾選狀態 ✨
        // Test Case: 換頁或滾動後，已勾選的行應該保持勾選狀態
        // Test Case: 全選狀態應該在換頁後正確顯示
        $(document).on('draw.dt', function() {
            // 恢復可見行的勾選狀態
            $('#json-table tbody tr').each(function() {
                const url = $(this).find('td:eq(5) a').attr('href') || $(this).find('td:eq(5)').text();
                if (selectedRowURLs.includes(url)) {
                    $(this).find('.row-checkbox').prop('checked', true);
                }
            });
            
            // 🎯 PDCA Check: 同步更新全選 checkbox 狀態
            const totalFilteredRows = dataTable.rows({ search: 'applied' }).count();
            const allSelected = selectedRowURLs.length > 0 && selectedRowURLs.length === totalFilteredRows;
            $('#select-all').prop('checked', allSelected);
        });

        // 綁定複製單個URL按鈕
        $(document).on('click', '.copy-url-btn', function() {
            const url = $(this).data('url');
            const row = $(this).closest('tr');
            const school = row.find('td:eq(2)').text();
            const department = row.find('td:eq(3)').text();
            const degree = row.find('td:eq(4)').text();

            navigator.clipboard.writeText(url).then(() => {
                alert(`URL copied to clipboard!\n\nSchool: ${school}\nDepartment: ${department}\nDegree: ${degree}\nURL: ${url}`);
            }).catch(err => {
                console.error('Copy failed:', err);
                alert('Failed to copy URL');
            });
        });
    }

    /**
     * 🎯 TDD: 分批載入資料到表格 (自動完成版本)
     * PDCA Do: 自動批次載入,顯示進度,用戶無需操作
     */
    function loadNextChunk() {
        if (loadIndex >= allData.length) {
            isLoadingComplete = true;
            console.log(`✅ 所有資料載入完成 (${dataTable.rows().count()} 筆)`);
            updateLoadStatus(`✅ 已載入全部 ${dataTable.rows().count()} 筆資料`, false);
            return;
        }

        // 計算進度
        const progress = Math.round((loadIndex / allData.length) * 100);
        updateLoadStatus(`⏳ 正在載入資料... ${progress}% (${loadIndex}/${allData.length})`, false);

        const chunk = allData.slice(loadIndex, loadIndex + CHUNK_SIZE);
        loadIndex += CHUNK_SIZE;

        // 過濾資料
        const filteredChunk = chunk.filter(item => {
            const schoolMatch = selectedSchools.length === 0 || selectedSchools.includes(item['School Name']);
            
            let degreeMatch = true;
            if (selectedDegrees.length > 0) {
                degreeMatch = selectedDegrees.some(deg => {
                    const degreeLevel = item['Degree Level'] || '';
                    return degreeLevel.includes(deg);
                });
            }
            
            return schoolMatch && degreeMatch;
        });

        // 格式化資料
        const formattedData = filteredChunk.map(item => [
            '<input type="checkbox" class="row-checkbox">',
            item.Country,
            item['School Name'],
            item['Department Name'],
            item['Degree Level'],
            item.URL
        ]);

        // 批次添加資料
        if (formattedData.length > 0) {
            dataTable.rows.add(formattedData).draw(false);
        }

        // 🎯 PDCA Check: 自動繼續載入
        if (loadIndex < allData.length) {
            setTimeout(loadNextChunk, 10); // 10ms 間隔,快速載入但不阻塞 UI
        } else {
            isLoadingComplete = true;
            const finalCount = dataTable.rows().count();
            console.log(`✅ 載入完成: ${finalCount} 筆資料`);
            updateLoadStatus(`✅ 已載入全部 ${finalCount} 筆資料`, false);
            updateTableStats(); // 🎯 TDD: 更新統計顯示
        }
    }

    /**
     * 🎯 PDCA Check: 更新載入狀態顯示
     */
    function updateLoadStatus(message, showButton) {
        const statusDiv = document.getElementById('load-status');
        const statusText = document.getElementById('load-status-text');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (statusDiv && statusText) {
            statusText.textContent = message;
            statusDiv.style.display = message ? 'block' : 'none';
            
            // 自動載入,不需要按鈕
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    /**
     * 🎯 TDD: 更新表格統計資訊
     */
    function updateTableStats() {
        const loadedCountEl = document.getElementById('loaded-count');
        const displayCountEl = document.getElementById('display-count');
        
        if (!dataTable) return;
        
        const totalRows = dataTable.rows().count();
        const displayedRows = dataTable.rows({ search: 'applied' }).count();
        
        if (loadedCountEl) {
            loadedCountEl.textContent = `已載入全部 ${totalRows.toLocaleString()} 筆資料`;
        }
        
        if (displayCountEl) {
            if (displayedRows === totalRows) {
                displayCountEl.textContent = `共 ${totalRows.toLocaleString()} 筆資料`;
            } else {
                displayCountEl.textContent = `共 ${displayedRows.toLocaleString()} 筆資料 (從 ${totalRows.toLocaleString()} 筆中篩選)`;
            }
        }
    }

    /**
     * 更新過濾條件 (優化版本 - 添加集團篩選支援) ✨
     */
    function updateFilters() {
        // 更新選中的集團 ✨
        selectedGroups = [];
        $('.group-checkbox:checked').each(function() {
            selectedGroups.push($(this).val());
        });

        // 更新選中的國家
        selectedCountries = [];
        $('.country-checkbox:checked').each(function() {
            selectedCountries.push($(this).val());
        });

        // 更新選中的學校
        selectedSchools = [];
        $('.school-checkbox:checked').each(function() {
            selectedSchools.push($(this).val());
        });

        // 更新選中的學位
        selectedDegrees = [];
        $('.degree-checkbox:checked').each(function() {
            selectedDegrees.push($(this).val());
        });

        // 清理舊資料，釋放記憶體
        if (dataTable) {
            dataTable.clear();
            dataTable.draw(false); // 不重繪,節省效能
        }
        
        // 清空勾選記錄
        selectedRowURLs = [];
        loadIndex = 0;
        isLoadingComplete = false; // 重置載入狀態
        
        // 延遲載入，讓瀏覽器有時間釋放記憶體
        setTimeout(() => {
            loadNextChunk();
        }, 50);

        // ✨ 更新 School Data Table
        if (typeof updateSchoolDataTable === 'function') {
            updateSchoolDataTable();
        }
        
        // 🎯 TDD: 篩選後更新統計
        setTimeout(() => {
            if (isLoadingComplete) {
                updateTableStats();
            }
        }, 100);

        // 觸發地圖更新事件 (for SchoolMap.js)
        document.dispatchEvent(new Event('schoolSelectionChanged'));

        console.log('🔄 Filters updated - Groups:', selectedGroups.length, 'Countries:', selectedCountries.length, 'Schools:', selectedSchools.length, 'Degrees:', selectedDegrees.length);
    }

    // ==================== 4. 匯出功能 ====================

    /**
     * 取得選中的資料
     */
    function getSelectedData() {
        return allData.filter(item => selectedRowURLs.includes(item.URL));
    }

    /**
     * 匯出 JSON
     */
    function exportJSON() {
        const selectedData = getSelectedData();
        
        if (selectedData.length === 0) {
            alert('請先選擇至少一筆資料 (Please select at least one item).');
            return;
        }

        const jsonContent = JSON.stringify(selectedData, null, 2);
        downloadFile('selected_data.json', jsonContent, 'application/json');
    }

    /**
     * 匯出 Excel
     */
    function exportExcel() {
        const selectedData = getSelectedData();
        
        if (selectedData.length === 0) {
            alert('請先選擇至少一筆資料 (Please select at least one item).');
            return;
        }

        try {
            const ws = XLSX.utils.json_to_sheet(selectedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            XLSX.writeFile(wb, 'selected_data.xlsx');
        } catch (error) {
            console.error('Export Excel error:', error);
            alert('匯出失敗: ' + error.message);
        }
    }

    /**
     * 匯出 TXT (僅 URLs)
     */
    function exportTXT() {
        const selectedData = getSelectedData();
        
        if (selectedData.length === 0) {
            alert('請先選擇至少一筆資料 (Please select at least one item).');
            return;
        }

        const urls = selectedData
            .map(item => item.URL)
            .filter(url => url && url !== 'N/A');

        if (urls.length === 0) {
            alert('勾選的資料沒有有效的URL。\nNo valid URLs in selected items.');
            return;
        }

        const textContent = urls.join('\n');
        downloadFile('selected_urls.txt', textContent, 'text/plain;charset=utf-8');
    }

    /**
     * 複製所有選中的 URLs
     */
    async function copyAllURLs() {
        const selectedData = getSelectedData();
        
        if (selectedData.length === 0) {
            alert('請先選擇至少一筆資料 (Please select at least one item).');
            return;
        }

        const urls = selectedData
            .map(item => item.URL)
            .filter(url => url && url !== 'N/A');

        if (urls.length === 0) {
            alert('勾選的資料沒有有效的URL。\nNo valid URLs in selected items.');
            return;
        }

        const urlText = urls.join('\n');

        try {
            await navigator.clipboard.writeText(urlText);
            alert(`已複製 ${urls.length} 個URL到剪貼簿！\nCopied ${urls.length} URLs to clipboard!\n\n${urlText.substring(0, 200)}${urlText.length > 200 ? '...' : ''}`);
        } catch (error) {
            console.error('Copy failed:', error);
            alert('複製失敗，請手動複製。');
        }
    }

    /**
     * 下載檔案
     */
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }

    // ==================== 5. UI 功能 ====================

    /**
     * 初始化浮動導覽
     */
    function initFloatingNav() {
        const nav = document.getElementById('floating-nav');
        const btn = document.getElementById('floating-nav-toggle');
        const wrapper = document.getElementById('floating-nav-wrapper');

        if (!nav || !btn || !wrapper) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('open');
            btn.classList.toggle('open');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                btn.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                nav.classList.remove('open');
                btn.classList.remove('open');
            }
        });

        console.log('✅ Floating nav initialized');
    }

    /**
     * 初始化更新日誌
     */
    function initChangelog() {
        const showBtn = document.getElementById('show-changelog');
        const modal = document.getElementById('changelog-modal');
        const closeBtn = document.querySelector('.changelog-close');

        if (!showBtn || !modal || !closeBtn) return;

        showBtn.onclick = () => modal.style.display = 'block';
        closeBtn.onclick = () => modal.style.display = 'none';
        
        window.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };

        console.log('✅ Changelog initialized');
    }

    // ==================== 6. 主初始化流程 ====================

    /**
     * 主初始化函數
     */
    async function init() {
        try {
            console.log('⏳ Initializing application...');

            // 1. 載入並合併資料
            await loadAndMergeData();

            // 2. 初始化選擇器 (集團 → 國家 → 學校 → 學位) ✨
            initGroupSelector();      // 新增：集團篩選器 ✨
            initCountrySelector();
            initSchoolSelector();
            initDegreeSelector();

            // 3. 初始化表格
            initDataTable();

            // 4. 載入資料到表格
            updateFilters();

            // 5. 綁定匯出按鈕
            $('#export-json').on('click', exportJSON);
            $('#export-excel').on('click', exportExcel);
            $('#export-txt').on('click', exportTXT);
            $('#copy-all-urls').on('click', copyAllURLs);

            // 6. 初始化 UI
            initFloatingNav();
            initChangelog();

            // 7. 綁定學位過濾器變化事件
            $(document).on('change', '.degree-checkbox', updateFilters);

            console.log('✅ Application initialized successfully!');
            console.log('📊 Total records:', allData.length);
            console.log('🏢 Total groups:', selectedGroups.length);

        } catch (error) {
            console.error('❌ Initialization error:', error);
            alert('系統初始化失敗: ' + error.message);
        }
    }

    // ==================== 7. 啟動應用程式 ====================

    // 等待 DOM 和 jQuery 準備好
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            $(document).ready(init);
        });
    } else {
        $(document).ready(init);
    }

})();
