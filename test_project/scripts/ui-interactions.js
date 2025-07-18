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
