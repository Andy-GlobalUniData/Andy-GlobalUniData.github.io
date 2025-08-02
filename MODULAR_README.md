# Andy Global Uni Data - 模塊化系統說明

## 概述

這是 Andy Global Uni Data 全球大學資料查詢平台的模塊化版本。此版本將原本單一檔案的應用程式重新架構為模塊化系統，提供更好的可維護性、擴展性和性能。

## 系統架構

### 核心模塊 (Core Module)
- **檔案**: `scripts/modules/CoreModule.js`
- **功能**: 
  - 中央化數據管理
  - 篩選系統
  - 事件管理和模塊間通信
  - API 數據載入

### 功能模塊

#### 1. 科系資料模塊 (Department Module)
- **檔案**: `scripts/modules/DepartmentModule.js`
- **功能**:
  - DataTable 管理和顯示
  - 搜尋功能
  - 行選擇和批量操作
  - URL 複製功能

#### 2. 學校資料模塊 (School Module)
- **檔案**: `scripts/modules/SchoolModule.js`
- **功能**:
  - 學校資料表格管理
  - 學校統計資訊
  - 科系數量計算
  - 學校篩選功能

#### 3. 地圖模塊 (Map Module)
- **檔案**: `scripts/modules/MapModule.js`
- **功能**:
  - Leaflet.js 地圖整合
  - 學校位置標記
  - 互動式彈出窗
  - 地圖縮放和導航

#### 4. 匯出管理模塊 (Export Manager Module)
- **檔案**: `scripts/modules/ExportManagerModule.js`
- **功能**:
  - 多格式匯出 (JSON, Excel, TXT)
  - URL 複製功能
  - 批量匯出
  - 匯出歷史記錄

#### 5. 標籤頁管理模塊 (Tab Manager Module)
- **檔案**: `scripts/modules/TabManagerModule.js`
- **功能**:
  - 標籤頁切換管理
  - 鍵盤快捷鍵 (Alt+1/2/3)
  - 麵包屑導航
  - 標籤頁狀態管理

### 系統管理

#### 應用程式管理器 (App Manager)
- **檔案**: `scripts/modules/AppManager.js`
- **功能**:
  - 模塊初始化協調
  - 全局事件處理
  - 錯誤處理和復原
  - 應用程式生命周期管理

#### 測試框架 (Modular System Test)
- **檔案**: `scripts/modules/ModularSystemTest.js`
- **功能**:
  - 自動化模塊測試
  - 整合測試
  - 性能監控
  - 測試報告生成

## 模塊間通信

系統使用事件驅動的架構，所有模塊通過 CoreModule 進行通信：

### 主要事件

#### CoreModule 事件
- `coreReady`: 核心模塊初始化完成
- `dataLoaded`: 數據載入完成
- `dataFiltered`: 數據篩選更新
- `filterChanged`: 篩選器狀態變更
- `searchCompleted`: 搜尋完成

#### 模塊互動事件
- `selectionChanged`: 選擇狀態變更
- `tabChanged`: 標籤頁切換
- `exportCompleted`: 匯出完成
- `windowResize`: 窗口大小變更

## 安裝和使用

### 1. 檔案結構
```
project/
├── index.html                 # 主頁面 (模塊化版本)
├── css/
│   ├── style.css             # 基本樣式
│   ├── modules.css           # 模塊化系統樣式
│   └── floating-nav.css      # 導航樣式
├── scripts/
│   ├── modules/
│   │   ├── CoreModule.js         # 核心模塊
│   │   ├── DepartmentModule.js   # 科系模塊
│   │   ├── SchoolModule.js       # 學校模塊
│   │   ├── MapModule.js          # 地圖模塊
│   │   ├── ExportManagerModule.js # 匯出管理模塊
│   │   ├── TabManagerModule.js   # 標籤頁管理模塊
│   │   ├── AppManager.js         # 應用程式管理器
│   │   └── ModularSystemTest.js  # 測試框架
│   └── legacy/               # 舊版相容性檔案
└── data/
    ├── data.json             # 科系資料
    └── School_data.json      # 學校資料
```

### 2. 初始化流程

1. **CoreModule** 首先初始化，載入數據和設置事件系統
2. **功能模塊** 依序初始化，註冊到 CoreModule
3. **AppManager** 統一管理所有模塊的生命周期
4. **測試框架** 在開發模式下自動執行測試

### 3. 使用方式

#### 基本使用
```javascript
// 獲取模塊實例
const coreModule = window.appManager.getModule('core');
const departmentModule = window.appManager.getModule('department');

// 監聽事件
coreModule.on('dataLoaded', (e) => {
    console.log('數據載入完成:', e.detail);
});

// 觸發搜尋
departmentModule.performSearch('電腦科學');
```

#### 篩選操作
```javascript
// 設置國家篩選器
coreModule.setFilter('countries', ['美國', '英國']);

// 設置學校篩選器
coreModule.setFilter('schools', ['哈佛大學']);

// 獲取篩選後的數據
const filteredData = coreModule.applyFilters();
```

#### 匯出功能
```javascript
const exportManager = window.appManager.getModule('exportmanager');

// 匯出 JSON
await exportManager.exportJSON();

// 匯出 Excel
await exportManager.exportExcel();

// 複製 URL
await exportManager.copyAllURLs();
```

### 4. 開發和測試

#### 執行測試
```javascript
// 執行全部測試
const results = await window.modularSystemTest.runAllTests();

// 執行快速測試
const quickResults = await window.modularSystemTest.runQuickTest();

// 顯示測試結果
const report = window.modularSystemTest.displayResults();
```

#### 性能監控
```javascript
// 獲取應用程式狀態
const appStatus = window.appManager.getAppStatus();
console.log('應用程式運行時間:', appStatus.uptime);

// 獲取模塊狀態
const modules = window.appManager.getAllModules();
modules.forEach((module, key) => {
    console.log(`模塊 ${key}:`, module.isInitialized ? '已初始化' : '未初始化');
});
```

## API 參考

### CoreModule API

#### 数据管理
- `loadData()`: 載入所有數據
- `getData()`: 獲取科系數據
- `getSchoolData()`: 獲取學校數據

#### 篩選系統
- `setFilter(type, values)`: 設置篩選器
- `getFilter(type)`: 獲取篩選器狀態
- `clearFilter(type)`: 清除特定篩選器
- `clearAllFilters()`: 清除所有篩選器
- `applyFilters()`: 應用篩選器並返回結果

#### 搜尋功能
- `searchData(query, fields)`: 搜尋數據

#### 事件系統
- `on(event, handler)`: 註冊事件監聽器
- `off(event, handler)`: 移除事件監聽器
- `emit(event, data)`: 觸發事件

### DepartmentModule API

#### 表格管理
- `updateTable(data)`: 更新表格數據
- `getCurrentData()`: 獲取當前顯示數據
- `getSelectedData()`: 獲取選中數據

#### 搜尋功能
- `performSearch(query)`: 執行搜尋
- `clearSearch()`: 清除搜尋

#### 選擇管理
- `clearSelection()`: 清除選擇
- `selectAllVisible()`: 全選當前頁面

### SchoolModule API

#### 學校數據
- `processSchoolData(data)`: 處理學校數據
- `getCurrentSchoolData()`: 獲取當前學校數據
- `getSchoolStats()`: 獲取學校統計

#### 搜尋功能
- `searchSchools(query)`: 搜尋學校

### MapModule API

#### 地圖管理
- `loadSchoolMarkers(data)`: 載入學校標記
- `updateMarkers()`: 更新標記顯示
- `clearMarkers()`: 清除所有標記

#### 導航功能
- `fitToMarkers()`: 縮放到所有標記
- `focusOnSchool(schoolName)`: 聚焦到特定學校

### ExportManagerModule API

#### 匯出功能
- `exportJSON()`: 匯出 JSON 格式
- `exportExcel()`: 匯出 Excel 格式
- `exportTXT()`: 匯出文字格式

#### URL 管理
- `copyAllURLs()`: 複製所有 URL
- `copySelectedURLs()`: 複製選中 URL

#### 歷史記錄
- `getExportHistory()`: 獲取匯出歷史
- `clearExportHistory()`: 清除匯出歷史

### TabManagerModule API

#### 標籤頁管理
- `switchTab(tabId)`: 切換標籤頁
- `getCurrentTab()`: 獲取當前標籤頁
- `goToPreviousTab()`: 前往上一個標籤頁
- `goToNextTab()`: 前往下一個標籤頁

#### 配置管理
- `getTabConfig(tabId)`: 獲取標籤頁配置
- `getAllTabs()`: 獲取所有標籤頁

### AppManager API

#### 應用程式管理
- `init()`: 初始化應用程式
- `restart()`: 重啟應用程式
- `destroy()`: 銷毀應用程式

#### 模塊管理
- `getModule(key)`: 獲取模塊實例
- `getAllModules()`: 獲取所有模塊

#### 狀態監控
- `getAppStatus()`: 獲取應用程式狀態

## 最佳實踐

### 性能優化

1. **模塊懶載入**: 只在需要時初始化模塊
2. **事件防抖**: 使用 debounce 來限制高頻率事件
3. **數據緩存**: 避免重複載入相同數據
4. **DOM 優化**: 減少 DOM 操作和重新繪製

### 錯誤處理

1. **優雅降級**: 模塊失敗不影響整體應用
2. **錯誤還原**: 提供重試機制
3. **用戶反饋**: 明確的錯誤信息和建議

### 可維護性

1. **模塊化設計**: 每個模塊負責單一功能
2. **明確的 API**: 統一的接口設計
3. **詳細文檔**: 完整的 API 和使用說明
4. **單元測試**: 自動化測試穩定性

### 擴展性

1. **插件機制**: 支持新模塊的加入
2. **事件驅動**: 模塊間鬆合度低
3. **配置化**: 支持動態配置設定

## 常見問題

### Q1: 如何添加新的模塊？

A: 創建新的模塊檔案，實現基本的模塊結構，並在 AppManager 中註冊。

### Q2: 模塊間如何通信？

A: 通過 CoreModule 的事件系統，使用 `emit()` 發送事件，`on()` 監聽事件。

### Q3: 如何進行單元測試？

A: 使用 ModularSystemTest 框架，或者在瀏覽器控制台執行 `window.modularSystemTest.runAllTests()`。

### Q4: 如何調試模塊問題？

A: 使用瀏覽器開發者工具，檢查控制台日誌和模塊狀態。

### Q5: 可以更改模塊加載順序嗎？

A: CoreModule 必須首先加載，AppManager 必須最後加載，其他模塊順序可以調整。

## 版本歷史

### v2.0.0 (模塊化版本)
- ✅ 完整的模塊化重構
- ✅ 事件驅動架構
- ✅ 自動化測試框架
- ✅ 性能優化和錯誤處理
- ✅ 支持鍵盤快捷鍵
- ✅ 地圖模塊集成
- ✅ 匯出功能增強

## 責任聲明

Copyright (C) [2025] [@Andy87877]

All rights reserved. This software is provided "as is" and is intended for personal or internal use only. Users are not permitted to modify, distribute, or create derivative works based on this software.

For inquiries regarding usage rights, please contact [andy8787main@gmail.com].