// UI Interactions - 主題切換、導航、面板控制等
document.addEventListener('DOMContentLoaded', function () {
    // 主題切換功能
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.icon');
        const themeText = themeToggle.querySelector('.text');

        // 檢查本地存儲的主題設置，默認為明亮模式
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);

        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        });

        function updateThemeButton(theme) {
            if (theme === 'dark') {
                themeIcon.textContent = '☀️';
                themeText.textContent = '明亮模式';
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = '深色模式';
            }
        }
    }

    // 漢堡菜單切換邏輯
    const nav = document.getElementById('floating-nav');
    const btn = document.getElementById('floating-nav-toggle');
    const wrapper = document.getElementById('floating-nav-wrapper');

    if (nav && btn && wrapper) {
        // 預設開啟導航
        nav.classList.add('open');
        btn.classList.add('open');
        wrapper.classList.add('nav-open');

        function closeNav() {
            nav.classList.remove('open');
            btn.classList.remove('open');
            wrapper.classList.remove('nav-open');
        }

        function openNav() {
            nav.classList.add('open');
            btn.classList.add('open');
            wrapper.classList.add('nav-open');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (nav.classList.contains('open')) {
                closeNav();
            } else {
                openNav();
            }
        });

        // 點擊導覽連結自動收合
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeNav();
            });
        });

        // 點擊外部自動收合
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target) && nav.classList.contains('open')) {
                closeNav();
            }
        });

        // ESC鍵關閉
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeNav();
            }
        });
    }

    // 設置所有select panel的預設狀態
    const selectContents = ['country-selector-content', 'school-selector-content', 'degree-selector-content'];
    selectContents.forEach(function (contentId) {
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('select-content-collapsed');
        }
    });
});

// Instructions panel toggle functionality
function toggleInstructions() {
    const panel = document.getElementById('instructionsPanel');
    const icon = panel.querySelector('.toggle-icon');

    if (panel.classList.contains('collapsed')) {
        panel.classList.remove('collapsed');
        panel.classList.add('expanded');
        icon.textContent = '▲';
    } else {
        panel.classList.remove('expanded');
        panel.classList.add('collapsed');
        icon.textContent = '▼';
    }
}

// Select panel toggle functionality - 僅限學位面板使用
function toggleSelectContent(contentId, headerElement) {
    // 只允許學位面板使用此功能
    if (contentId !== 'degree-selector-content') {
        return;
    }

    const content = document.getElementById(contentId);
    const toggle = headerElement.querySelector('.expand-toggle');

    if (content.classList.contains('select-content-collapsed')) {
        content.classList.remove('select-content-collapsed');
        content.classList.add('select-content-expanded');
        toggle.textContent = '收合 ▲';
    } else {
        content.classList.remove('select-content-expanded');
        content.classList.add('select-content-collapsed');
        toggle.textContent = '顯示更多 ▼';
    }
}

// 標籤頁功能
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // 移除所有活動狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // 設置當前活動狀態
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // 如果切換到地圖標籤，觸發地圖重新渲染（如果需要）
            if (targetTab === 'map-view' && window.schoolMap) {
                setTimeout(() => {
                    window.schoolMap.invalidateSize();
                }, 100);
            }
        });
    });
}

// 增強的視覺效果
function initVisualEnhancements() {
    // 為選擇器容器添加懸停效果
    const selectContainers = document.querySelectorAll('.scroll-select-container');
    selectContainers.forEach(container => {
        container.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        });

        container.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });

    // 為標籤按鈕添加波紋效果
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(99, 102, 241, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加CSS動畫
    if (!document.getElementById('ui-interactions-styles')) {
        const style = document.createElement('style');
        style.id = 'ui-interactions-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            .scroll-select-container {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .tab-button {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化新功能
setTimeout(function () {
    initTabs();
    initVisualEnhancements();
}, 100);
