/**
 * ========================================
 * Theme Toggle - 主題切換功能
 * 功能：深色/淺色模式切換
 * 預設：淺色模式
 * 儲存：localStorage
 * ========================================
 */

(function() {
  'use strict';

  // 設定預設主題為淺色模式
  const DEFAULT_THEME = 'light';
  const STORAGE_KEY = 'andy-global-uni-theme';
  
  /**
   * 取得儲存的主題或使用預設主題
   */
  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || DEFAULT_THEME;
    } catch (e) {
      console.warn('無法存取 localStorage:', e);
      return DEFAULT_THEME;
    }
  }

  /**
   * 儲存主題到 localStorage
   */
  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn('無法儲存主題到 localStorage:', e);
    }
  }

  /**
   * 套用主題到 HTML
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新切換按鈕的文字和圖示
    updateToggleButton(theme);
    
    // 觸發自訂事件，讓其他程式碼知道主題已變更
    const event = new CustomEvent('themechange', { 
      detail: { theme } 
    });
    document.dispatchEvent(event);
    
    // 記錄到 console (開發用)
    console.log(`🎨 主題已切換為: ${theme === 'dark' ? '深色' : '淺色'}模式`);
  }

  /**
   * 更新切換按鈕的顯示
   */
  function updateToggleButton(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    if (theme === 'dark') {
      toggleBtn.innerHTML = '☀️ 淺色模式';
      toggleBtn.setAttribute('aria-label', '切換到淺色模式');
      toggleBtn.title = '切換到淺色模式';
    } else {
      toggleBtn.innerHTML = '🌙 深色模式';
      toggleBtn.setAttribute('aria-label', '切換到深色模式');
      toggleBtn.title = '切換到深色模式';
    }
  }

  /**
   * 切換主題
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    setStoredTheme(newTheme);
    
    // 添加切換動畫效果
    animateThemeChange();
  }

  /**
   * 主題切換動畫效果
   */
  function animateThemeChange() {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  /**
   * 初始化主題
   */
  function initTheme() {
    // 立即套用主題，避免閃爍
    const theme = getStoredTheme();
    applyTheme(theme);
    
    console.log(`✅ 主題系統初始化完成 - 當前主題: ${theme === 'dark' ? '深色' : '淺色'}模式`);
  }

  /**
   * 監聽系統主題變更 (可選功能)
   * 如果使用者沒有手動選擇主題，則跟隨系統設定
   */
  function watchSystemTheme() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      // 只有在使用者沒有手動選擇時才跟隨系統
      if (!localStorage.getItem(STORAGE_KEY)) {
        const systemTheme = e.matches ? 'dark' : 'light';
        applyTheme(systemTheme);
        console.log(`🔄 跟隨系統主題變更: ${systemTheme}`);
      }
    });
  }

  /**
   * 綁定切換按鈕事件
   */
  function bindToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) {
      console.warn('找不到主題切換按鈕 (#theme-toggle)');
      return;
    }

    toggleBtn.addEventListener('click', toggleTheme);
    
    // 鍵盤無障礙支援
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /**
   * DOM 載入完成後初始化
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindToggleButton();
      watchSystemTheme();
    });
  } else {
    bindToggleButton();
    watchSystemTheme();
  }

  // 立即初始化主題 (在 head 中執行，避免閃爍)
  initTheme();

  // 暴露到全域 (方便其他程式碼呼叫)
  window.themeToggle = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || DEFAULT_THEME,
    setTheme: (theme) => {
      if (theme === 'dark' || theme === 'light') {
        applyTheme(theme);
        setStoredTheme(theme);
      } else {
        console.error('無效的主題:', theme);
      }
    },
    toggle: toggleTheme,
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      applyTheme(DEFAULT_THEME);
      console.log('🔄 主題已重置為預設值');
    }
  };

  // 開發用：在 console 顯示可用指令
  console.log(`
🎨 主題切換系統已載入
---
可用指令:
  themeToggle.getTheme()     - 取得當前主題
  themeToggle.setTheme('dark')  - 設定為深色模式
  themeToggle.setTheme('light') - 設定為淺色模式
  themeToggle.toggle()          - 切換主題
  themeToggle.reset()           - 重置為預設主題
---
預設主題: ${DEFAULT_THEME}
當前主題: ${getStoredTheme()}
  `);

})();
