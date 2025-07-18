// Instructions panel and UI interactions
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

// Select panel scroll functionality
function initScrollableSelects() {
    const selectContainers = ['country-selector-content', 'school-selector-content', 'degree-selector-content'];

    selectContainers.forEach(function (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // 設置為滾動模式
            container.classList.add('scrollable-select');

            // 添加滾動事件處理
            container.addEventListener('wheel', function (e) {
                e.preventDefault();
                container.scrollTop += e.deltaY;
            });
        }
    });
}

// 確保在頁面載入後初始化滾動選擇器
document.addEventListener('DOMContentLoaded', function () {
    initScrollableSelects();
});
