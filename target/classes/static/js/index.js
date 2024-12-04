/**
 * 首页类
 */
class IndexPage extends BasePage {
    constructor() {
        super();
        this.container = document.querySelector('.content-wrapper');
        this.initEvents();
    }

    initEvents() {
        // 添加快捷入口的点击事件
        document.querySelectorAll('.small-box').forEach(box => {
            box.addEventListener('click', (e) => {
                const link = box.querySelector('.small-box-footer');
                if (link && !e.target.closest('.small-box-footer')) {
                    window.location.href = link.getAttribute('href');
                }
            });
        });

        // 添加导航栏点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            });
        });
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    new IndexPage();
}); 