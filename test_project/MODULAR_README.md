# Andy Global Uni Data - 模塊化重構 v2.0

## 🎯 重構目標

本次重構將原本的單體應用程序拆分為獨立的模塊，實現了：

- 📋 **科系資料模塊** (`DepartmentModule`) - 獨立處理科系數據顯示和操作
- 🏫 **學校資料模塊** (`SchoolModule`) - 獨立處理學校數據顯示和管理  
- 🗺️ **地圖檢視模塊** (`MapModule`) - 獨立處理地圖顯示和學校位置標記
- ⚙️ **核心模塊** (`CoreModule`) - 統一的數據管理和篩選功能
- 🎛️ **標籤頁管理模塊** (`TabManagerModule`) - 標籤頁切換和狀態管理
- 📤 **匯出管理模塊** (`ExportManagerModule`) - 統一的匯出功能

## 🏗️ 架構設計

### 模塊架構圖
```
AppManager (應用程序管理器)
├── CoreModule (核心模塊)
│   ├── 數據載入管理
│   ├── 篩選器系統
│   ├── 事件總線
│   └── 全局狀態管理
├── DepartmentModule (科系資料模塊)
│   ├── DataTable 管理
│   ├── 搜尋功能
│   └── 行選擇管理
├── SchoolModule (學校資料模塊) 
│   ├── 學校數據表格
│   ├── 學校篩選功能
│   └── 統計信息
├── MapModule (地圖檢視模塊)
│   ├── Leaflet 地圖管理
│   ├── 學校位置標記
│   └── 地圖控制功能
├── TabManagerModule (標籤頁管理)
│   ├── 標籤頁切換
│   ├── 狀態管理
│   └── 麵包屑導航
└── ExportManagerModule (匯出管理)
    ├── JSON 匯出
    ├── Excel 匯出
    ├── TXT 匯出
    └── URL 複製
```

## 📁 文件結構

```
scripts/
├── modules/
│   ├── AppManager.js          # 應用程序入口和協調器
│   ├── CoreModule.js          # 核心功能模塊
│   ├── DepartmentModule.js    # 科系資料模塊
│   ├── SchoolModule.js        # 學校資料模塊
│   ├── MapModule.js           # 地圖檢視模塊
│   ├── TabManagerModule.js    # 標籤頁管理模塊
│   └── ExportManagerModule.js # 匯出管理模塊
├── ui-controls.js             # UI 控制（保留）
└── ui-interactions.js         # UI 交互（保留）
css/
├── style.css                  # 主要樣式
├── floating-nav.css           # 浮動導航樣式
├── leaflet-google.css         # 地圖樣式
└── modules.css                # 模塊專用樣式
```

## 🔧 模塊詳細說明

### CoreModule (核心模塊)
- **職責**: 數據載入、篩選管理、事件系統
- **主要功能**:
  - 載入三個主要數據文件 (data.json, School_data.json, Degree_data.json)
  - 統一的篩選器系統 (國家、學校、學位)
  - 事件總線系統用於模塊間通信
  - 搜尋功能
- **事件**: `dataLoaded`, `filterChanged`, `searchCompleted`, `coreReady`

### DepartmentModule (科系資料模塊)
- **職責**: 科系數據的顯示、搜索、選擇
- **主要功能**:
  - DataTable 管理和配置
  - 搜尋功能 (科系名稱、學校名稱)
  - 行選擇和跨頁選擇追蹤
  - URL 複製功能
- **依賴**: CoreModule
- **事件**: `selectionChanged`

### SchoolModule (學校資料模塊)
- **職責**: 學校數據的顯示和管理
- **主要功能**:
  - 學校數據表格
  - 科系數量統計
  - 學校篩選功能
  - 學校統計信息
- **依賴**: CoreModule

### MapModule (地圖檢視模塊)
- **職責**: 地圖顯示和學校位置標記
- **主要功能**:
  - Leaflet 地圖初始化和管理
  - 學校位置標記
  - 地圖控制面板
  - 彈出視窗信息
  - 響應篩選變化
- **依賴**: CoreModule, Leaflet 庫

### TabManagerModule (標籤頁管理模塊)
- **職責**: 管理三個主要標籤頁的切換
- **主要功能**:
  - 標籤頁狀態管理
  - 切換動畫效果
  - 麵包屑導航
  - 鍵盤快捷鍵支持 (Ctrl+1/2/3)
- **依賴**: CoreModule

### ExportManagerModule (匯出管理模塊)
- **職責**: 統一的匯出功能
- **主要功能**:
  - JSON 匯出
  - Excel 匯出 (使用 XLSX.js)
  - TXT 匯出 (URLs)
  - 批量匯出
  - 複製所有 URLs
- **依賴**: CoreModule, DepartmentModule

## 🎛️ 事件系統

模塊間通過事件系統進行通信，主要事件包括：

```javascript
// 核心事件
'dataLoaded'        // 數據載入完成
'filterChanged'     // 篩選器變化
'searchCompleted'   // 搜尋完成
'coreReady'         // 核心模塊就緒

// UI 事件
'tabChanged'        // 標籤頁變化
'selectionChanged'  // 選擇變化

// 應用程序事件
'appReady'          // 應用程序就緒
```

## 🚀 使用方式

### 開發模式
1. 載入所有模塊文件
2. `AppManager.js` 會自動初始化所有模塊
3. 應用程序會在 `appReady` 事件觸發時完全就緒

### 添加新功能
1. 創建新的模塊文件
2. 繼承基本模塊結構
3. 在 `AppManager` 中註冊新模塊
4. 使用事件系統與其他模塊通信

### 模塊模板
```javascript
class NewModule {
    constructor(coreModule) {
        this.core = coreModule;
        this.isInitialized = false;
    }
    
    init() {
        this.core.registerModule('newModule', this);
        this.core.on('coreReady', () => this.setup());
    }
    
    setup() {
        // 模塊初始化邏輯
        this.isInitialized = true;
    }
    
    destroy() {
        this.isInitialized = false;
    }
}
```

## 📋 TODO 清單

- [ ] 添加單元測試
- [ ] 實作標記聚合功能
- [ ] 添加更多匯出格式
- [ ] 實作數據緩存機制
- [ ] 添加離線支持
- [ ] 性能監控和優化
- [ ] 添加更多鍵盤快捷鍵
- [ ] 實作主題系統模塊化

## 🔄 從舊版本遷移

舊版本的功能已經完全保留，只是重新組織到不同的模塊中：

- `main_complete.js` → `DepartmentModule.js`
- `School_data.js` + `loadSchoolData.js` → `SchoolModule.js`
- `SchoolMap.js` → `MapModule.js`
- `exportManager.js` → `ExportManagerModule.js`
- `degreeFilter_complete.js` → `CoreModule.js` (篩選功能)

## 🎨 樣式系統

新增 `modules.css` 包含：
- 模塊專用樣式
- 地圖控制面板樣式
- 標籤頁增強樣式
- 響應式設計改進
- 深色主題適配

## 🛠️ 調試和監控

使用瀏覽器開發者工具：
```javascript
// 獲取應用程序統計
window.app.getAppStats()

// 獲取特定模塊
window.app.getModule('department')

// 重啟應用程序
window.app.restart()

// 查看所有模塊
window.app.getAllModules()
```

## 📞 支援

如果遇到問題：
1. 檢查瀏覽器控制台是否有錯誤訊息
2. 確認所有模塊文件已正確載入
3. 檢查數據文件是否可正常訪問
4. 重新整理頁面重新初始化

---

**版本**: 2.0.0  
**最後更新**: 2025-08-02  
**作者**: [@Andy87877]
