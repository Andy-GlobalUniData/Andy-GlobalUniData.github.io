// 用於處理數據並添加 Degree Level 欄位的腳本
async function processDataWithDegreeLevel() {
    try {
        // 載入原始數據和學位分類
        const dataResponse = await fetch('data/data.json');
        const degreeResponse = await fetch('data/Degree_data.json');

        const originalData = await dataResponse.json();
        const degreeData = await degreeResponse.json();

        console.log('開始處理', originalData.length, '筆數據...');

        // 創建學位關鍵字到學位等級的映射
        const degreeMapping = {};

        Object.keys(degreeData).forEach(degreeLevel => {
            degreeData[degreeLevel].forEach(keyword => {
                degreeMapping[keyword.toLowerCase()] = degreeLevel;
            });
        });

        // 處理每筆數據，添加 Degree Level 欄位
        const processedData = originalData.map((item, index) => {
            const departmentName = item["Department Name"] || "";
            let degreeLevel = "Other"; // 預設值

            // 檢查科系名稱中是否包含學位關鍵字
            for (const keyword in degreeMapping) {
                if (departmentName.toLowerCase().includes(keyword)) {
                    degreeLevel = degreeMapping[keyword];
                    break;
                }
            }

            // 額外的規則來更好地識別學位等級
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

            if (index < 10) {
                console.log(`樣本 ${index + 1}: "${departmentName}" -> ${degreeLevel}`);
            }

            return {
                ...item,
                "Degree Level": degreeLevel
            };
        });

        // 統計各學位等級的數量
        const stats = {};
        processedData.forEach(item => {
            const level = item["Degree Level"];
            stats[level] = (stats[level] || 0) + 1;
        });

        console.log('學位等級統計:', stats);

        // 返回處理後的數據
        return processedData;

    } catch (error) {
        console.error('處理數據時發生錯誤:', error);
        throw error;
    }
}

// 導出函數供其他腳本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processDataWithDegreeLevel };
} else {
    window.processDataWithDegreeLevel = processDataWithDegreeLevel;
}
