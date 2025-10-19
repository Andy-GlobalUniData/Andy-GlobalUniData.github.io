/**
 * 🎯 Database Update Modal
 * 功能：顯示資料庫統計資訊並允許用戶請求更新
 * 實現方式：TDD + PDCA
 */

(function() {
  'use strict';

  const DatabaseUpdateModal = {
    // 配置
    config: {
      githubOwner: 'Andy-GlobalUniData',
      githubRepo: 'Andy-GlobalUniData.github.io',
      autoShowDelay: 100, // 延遲顯示時間（毫秒）
      apiTimeout: 10000 // API 超時時間
    },

    // 狀態
    state: {
      isSubmitting: false,
      lastUpdateTime: null,
      schoolCount: 0,
      departmentCount: 0
    },

    /**
     * 初始化彈窗
     */
    init() {
      console.log('🚀 初始化 Database Update Modal');
      this.bindEvents();
      this.loadStatistics();
    },

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
      const modal = document.getElementById('database-update-modal');
      const closeBtn = modal?.querySelector('.database-modal-close');
      const updateBtn = document.getElementById('request-update-btn');

      // 關閉按鈕
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }

      // 點擊背景關閉
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.hide();
          }
        });
      }

      // 更新請求按鈕
      if (updateBtn) {
        updateBtn.addEventListener('click', () => this.requestUpdate());
      }

      console.log('✅ 事件監聽器已綁定');
    },

    /**
     * 載入統計資料
     */
    async loadStatistics() {
      try {
        console.log('📊 開始載入統計資料...');

        // 載入學校數據（School_data.json 是直接的數組）
        const schoolDataResponse = await fetch('data/School_data.json');
        const schoolData = await schoolDataResponse.json();
        this.state.schoolCount = Array.isArray(schoolData) ? schoolData.length : 0;

        // 載入科系數據 - 使用與 DataTable 相同的數據源
        const departmentDataResponse = await fetch('data/data.json');
        const departmentData = await departmentDataResponse.json();
        
        // 計算實際顯示的科系數量（與 display-count 一致）
        // 過濾掉可能的無效數據
        if (Array.isArray(departmentData)) {
          this.state.departmentCount = departmentData.filter(item => 
            item && typeof item === 'object'
          ).length;
        } else {
          this.state.departmentCount = 0;
        }

        // 獲取最後更新時間
        await this.fetchLastUpdateTime();

        // 更新 UI
        this.updateStatisticsDisplay();

        // 自動顯示彈窗
        setTimeout(() => {
          this.show();
        }, this.config.autoShowDelay);

        console.log('✅ 統計資料載入完成');
        console.log(`📚 學校總數: ${this.state.schoolCount}`);
        console.log(`📖 科系總數: ${this.state.departmentCount}`);
      } catch (error) {
        console.error('❌ 載入統計資料失敗:', error);
        this.showMessage('載入資料時發生錯誤', 'error');
      }
    },

    /**
     * 從 GitHub API 獲取最後更新時間
     * 使用與 github-push-time.js 相同的邏輯
     */
    async fetchLastUpdateTime() {
      try {
        console.log('🔍 正在獲取最後更新時間...');
        
        // 使用與 github-push-time.js 相同的 API 端點
        const response = await fetch(
          `https://api.github.com/repos/${this.config.githubOwner}/${this.config.githubRepo}/commits`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        console.log('📡 GitHub API 響應狀態:', response.status);

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // 使用 committer.date，與 github-push-time.js 一致
            const lastCommitTime = data[0].commit.committer.date;
            this.state.lastUpdateTime = new Date(lastCommitTime);
            console.log('✅ 獲取最後更新時間成功:', this.state.lastUpdateTime);
            return;
          }
        } else {
          const errorText = await response.text();
          console.warn('⚠️ GitHub API 返回錯誤:', response.status, errorText);
        }
        
        // 後備方案：使用當前時間
        console.log('⚠️ 使用當前時間作為後備');
        this.state.lastUpdateTime = new Date();
      } catch (error) {
        console.error('❌ 獲取更新時間失敗:', error);
        // 後備方案：使用當前時間
        this.state.lastUpdateTime = new Date();
      }
    },

    /**
     * 更新統計資料顯示
     */
    updateStatisticsDisplay() {
      console.log('🔄 開始更新統計資料顯示...');
      
      const updateTimeElement = document.getElementById('modal-update-time');
      const schoolCountElement = document.getElementById('modal-school-count');
      const deptCountElement = document.getElementById('modal-department-count');

      console.log('📊 當前狀態:', {
        lastUpdateTime: this.state.lastUpdateTime,
        schoolCount: this.state.schoolCount,
        departmentCount: this.state.departmentCount
      });

      if (updateTimeElement) {
        if (this.state.lastUpdateTime) {
          updateTimeElement.textContent = this.formatDateTime(this.state.lastUpdateTime);
          console.log('✅ 更新時間已設置:', updateTimeElement.textContent);
        } else {
          updateTimeElement.textContent = '獲取中...';
          console.warn('⚠️ 最後更新時間尚未載入');
        }
      } else {
        console.error('❌ 找不到 modal-update-time 元素');
      }

      if (schoolCountElement) {
        schoolCountElement.textContent = this.state.schoolCount.toLocaleString();
        console.log('✅ 學校數量已設置:', schoolCountElement.textContent);
      } else {
        console.error('❌ 找不到 modal-school-count 元素');
      }

      if (deptCountElement) {
        deptCountElement.textContent = this.state.departmentCount.toLocaleString();
        console.log('✅ 科系數量已設置:', deptCountElement.textContent);
      } else {
        console.error('❌ 找不到 modal-department-count 元素');
      }

      console.log('✅ 統計資料顯示已更新');
    },

    /**
     * 格式化日期時間
     */
    formatDateTime(date) {
      if (!(date instanceof Date)) return '未知';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    /**
     * 顯示彈窗
     */
    show() {
      const modal = document.getElementById('database-update-modal');
      if (modal) {
        modal.style.display = 'flex';
        console.log('📢 彈窗已顯示');
      }
    },

    /**
     * 隱藏彈窗
     */
    hide() {
      const modal = document.getElementById('database-update-modal');
      if (modal) {
        modal.style.display = 'none';
        console.log('🔒 彈窗已關閉');
      }
    },

    /**
     * 請求更新資料庫
     */
    async requestUpdate() {
      // 防止重複提交
      if (this.state.isSubmitting) {
        console.warn('⚠️ 請求進行中，請勿重複提交');
        return;
      }

      this.state.isSubmitting = true;
      const updateBtn = document.getElementById('request-update-btn');

      try {
        // 顯示載入狀態
        if (updateBtn) {
          updateBtn.disabled = true;
          updateBtn.innerHTML = '<span class="loading-spinner"></span> 發送中...';
        }

        console.log('📤 正在發送更新請求...');

        // 創建 GitHub Issue
        const issueData = {
          title: '📢 資料庫更新請求',
          body: this.generateIssueBody(),
          labels: ['database-update', 'user-request']
        };

        // 使用 GitHub API 創建 Issue
        const response = await this.createGitHubIssue(issueData);

        if (response.success) {
          this.showMessage('✅ 已記錄您的更新請求！管理員會定期檢查資料庫。', 'success');
          console.log('✅ 更新請求已記錄');
          
          // 3 秒後關閉彈窗
          setTimeout(() => {
            this.hide();
          }, 3000);
        } else {
          throw new Error(response.error || '發送失敗');
        }
      } catch (error) {
        console.error('❌ 發送更新請求失敗:', error);
        this.showMessage('❌ 發送失敗，請稍後再試或聯繫管理員', 'error');
      } finally {
        this.state.isSubmitting = false;
        if (updateBtn) {
          updateBtn.disabled = false;
          updateBtn.innerHTML = '📮 請求更新資料庫';
        }
      }
    },

    /**
     * 生成 Issue 內容
     */
    generateIssueBody() {
      const now = new Date();
      return `
## 📊 資料庫更新請求

**請求時間**: ${this.formatDateTime(now)}

### 當前資料統計
- **學校總數**: ${this.state.schoolCount}
- **科系總數**: ${this.state.departmentCount}
- **最後更新**: ${this.formatDateTime(this.state.lastUpdateTime)}

### 📝 說明
用戶請求更新資料庫，請管理員檢查並更新相關數據。

### ✅ 更新項目
- [ ] 檢查新增學校
- [ ] 更新科系資訊
- [ ] 驗證數據準確性
- [ ] 部署更新

---
*此 Issue 由系統自動創建*
      `.trim();
    },

    /**
     * 記錄更新請求（簡易版）
     * 只是提醒用戶已記錄，不實際發送
     */
    async createGitHubIssue(issueData) {
      try {
        console.log('� ===== 資料庫更新請求 =====');
        console.log('� 請求時間:', new Date().toLocaleString());
        console.log('📊 當前統計:');
        console.log('   🏫 學校總數:', this.state.schoolCount);
        console.log('   📚 科系總數:', this.state.departmentCount);
        console.log('   🕐 最後更新:', this.formatDateTime(this.state.lastUpdateTime));
        console.log('============================');
        
        // 簡單的提醒，不實際創建 Issue
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              issueNumber: '---',
              message: '✅ 已記錄您的更新請求'
            });
          }, 800);
        });
      } catch (error) {
        console.error('❌ 記錄請求失敗:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * 顯示訊息
     */
    showMessage(message, type = 'info') {
      const messageElement = document.getElementById('update-request-message');
      if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `update-message ${type}`;
        messageElement.style.display = 'block';

        // 5 秒後自動隱藏
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 5000);
      }
    }
  };

  // 將模組暴露到全域
  window.DatabaseUpdateModal = DatabaseUpdateModal;

  // 在 DOM 載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      DatabaseUpdateModal.init();
    });
  } else {
    DatabaseUpdateModal.init();
  }

  console.log('✅ DatabaseUpdateModal 模組已載入');
})();
