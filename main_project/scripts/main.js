/**
 * Andy Global University Data - 完整重構版本
 * All-in-One Refactored Version
 * @version 3.0.0
 * @author Andy
 * @date 2025-10-17
 */

(function() {
    'use strict';

    console.log('🚀 Andy Global Uni Data v3.0 - Refactored Version');

    // ==================== 全域變數 ====================
    let allData = [];           // 所有合併後的資料
    let dataTable = null;       // DataTable 實例
    let selectedCountries = []; // 選中的國家
    let selectedSchools = [];   // 選中的學校
    let selectedDegrees = [];   // 選中的學位
    let selectedRowURLs = [];   // 跨頁勾選的 URL 陣列

    const CHUNK_SIZE = 500;     // 分批載入大小
    let loadIndex = 0;          // 載入索引

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

            const schoolData = await schoolDataResponse.json();
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
     * 初始化 Country 選擇器
     */
    function initCountrySelector() {
        const container = document.getElementById('country-select');
        if (!container) return;

        // 取得所有國家並排序，過濾掉 N/A
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
            $('.country-checkbox').prop('checked', this.checked);
            updateFilters();
        });

        $('.country-checkbox').on('change', function() {
            const allChecked = $('.country-checkbox:checked').length === $('.country-checkbox').length;
            $('#select-all-countries').prop('checked', allChecked);
            updateFilters();
        });

        console.log('✅ Country selector initialized:', countries.length, 'countries');
    }

    /**
     * 初始化 School 選擇器
     */
    function initSchoolSelector() {
        const container = document.getElementById('school-select');
        if (!container) return;

        // 監聽 Country 變化來更新學校列表
        $(document).on('change', '.country-checkbox', function() {
            updateSchoolSelector();
        });

        updateSchoolSelector();
    }

    /**
     * 更新 School 選擇器
     */
    function updateSchoolSelector() {
        const container = document.getElementById('school-select');
        if (!container) return;

        // 取得選中的國家
        const selectedCountriesTemp = [];
        $('.country-checkbox:checked').each(function() {
            selectedCountriesTemp.push($(this).val());
        });

        // 篩選符合條件的學校，過濾掉 N/A
        const schools = [...new Set(
            allData
                .filter(item => selectedCountriesTemp.includes(item.Country))
                .map(item => item['School Name'])
                .filter(school => school && school !== 'N/A')
        )].sort();

        let html = '<h3>Select School</h3>';
        html += '<label><input type="checkbox" id="select-all-schools" checked> 全選學校</label><br>';
        
        schools.forEach(school => {
            html += `<label><input type="checkbox" class="school-checkbox" value="${school}" checked> ${school}</label><br>`;
        });

        container.innerHTML = html;

        // 初始化選中的學校
        selectedSchools = [...schools];

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

        console.log('✅ School selector updated:', schools.length, 'schools');
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
     * 初始化 DataTable
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
            pageLength: 100,
            lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]],
            searching: true,
            destroy: false,
            language: {
                search: 'Search Department：'
            },
            initComplete: function() {
                $('.dataTables_filter input').css({
                    'font-size': '18px',
                    'padding': '10px'
                });
                console.log('✅ DataTable initialized');
            }
        });

        // 綁定全選checkbox
        $(document).on('click', '#select-all', function() {
            const checked = this.checked;
            $('.row-checkbox').prop('checked', checked);
            
            $('#json-table tbody tr').each(function() {
                const url = $(this).find('td:eq(5) a').attr('href') || $(this).find('td:eq(5)').text();
                if (url && url !== 'N/A') {
                    if (checked) {
                        if (!selectedRowURLs.includes(url)) selectedRowURLs.push(url);
                    } else {
                        selectedRowURLs = selectedRowURLs.filter(u => u !== url);
                    }
                }
            });
        });

        // 綁定單行checkbox
        $(document).on('change', '.row-checkbox', function() {
            const row = $(this).closest('tr');
            const url = row.find('td:eq(5) a').attr('href') || row.find('td:eq(5)').text();
            
            if (url && url !== 'N/A') {
                if (this.checked) {
                    if (!selectedRowURLs.includes(url)) selectedRowURLs.push(url);
                } else {
                    selectedRowURLs = selectedRowURLs.filter(u => u !== url);
                }
            }
        });

        // 表格重繪時恢復勾選狀態
        $(document).on('draw.dt', function() {
            $('#json-table tbody tr').each(function() {
                const url = $(this).find('td:eq(5) a').attr('href') || $(this).find('td:eq(5)').text();
                if (selectedRowURLs.includes(url)) {
                    $(this).find('.row-checkbox').prop('checked', true);
                }
            });
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
     * 分批載入資料到表格
     */
    function loadNextChunk() {
        if (loadIndex >= allData.length) {
            console.log('✅ All data loaded to table');
            return;
        }

        const chunk = allData.slice(loadIndex, loadIndex + CHUNK_SIZE);
        loadIndex += CHUNK_SIZE;

        // 過濾資料 - 修正：只在有選擇時才過濾
        const filteredChunk = chunk.filter(item => {
            // Country 過濾：如果沒選任何國家，或者該項目的國家在選中列表中
            const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(item.Country);
            
            // School 過濾：如果沒選任何學校，或者該項目的學校在選中列表中
            const schoolMatch = selectedSchools.length === 0 || selectedSchools.includes(item['School Name']);
            
            // Degree 過濾：如果沒選任何學位，顯示全部；否則檢查是否匹配
            let degreeMatch = true; // 預設為 true（顯示全部）
            if (selectedDegrees.length > 0) {
                degreeMatch = selectedDegrees.some(deg => {
                    const degreeLevel = item['Degree Level'] || '';
                    return degreeLevel.includes(deg);
                });
            }
            
            return countryMatch && schoolMatch && degreeMatch;
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

        dataTable.rows.add(formattedData).draw(false);

        // 繼續載入下一批
        if (loadIndex < allData.length) {
            setTimeout(loadNextChunk, 10);
        }
    }

    /**
     * 更新過濾條件
     */
    function updateFilters() {
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

        // 重新載入表格資料
        dataTable.clear();
        loadIndex = 0;
        selectedRowURLs = []; // 清空勾選記錄
        loadNextChunk();

        // 觸發地圖更新事件 (for SchoolMap.js)
        document.dispatchEvent(new Event('schoolSelectionChanged'));

        console.log('🔄 Filters updated - Countries:', selectedCountries.length, 'Schools:', selectedSchools.length, 'Degrees:', selectedDegrees.length);
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

            // 2. 初始化選擇器
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
