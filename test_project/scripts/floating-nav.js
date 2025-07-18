// YouTube風格的漢堡菜單切換邏輯
document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('floating-nav');
    var btn = document.getElementById('floating-nav-toggle');
    var wrapper = document.getElementById('floating-nav-wrapper');

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

    // 預設打開導航
    openNav();

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
});
