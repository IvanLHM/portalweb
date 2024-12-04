/**
 * 基础页面类
 */
class BasePage {
    constructor() {
        this.initCommon();
    }

    /**
     * 初始化公共功能
     */
    initCommon() {
        // 初始化侧边栏
        this.initSidebar();
        // 初始化其他公共功能
        this.initOthers();
    }

    /**
     * 初始化侧边栏
     */
    initSidebar() {
        // 处理侧边栏折叠
        $('[data-widget="pushmenu"]').on('click', function(e) {
            e.preventDefault();
            $('body').toggleClass('sidebar-collapse');
        });

        // 处理菜单项点击
        $('.nav-sidebar .nav-link').on('click', function(e) {
            const href = $(this).attr('href');
            if (href && href !== '#') {
                e.preventDefault();
                window.location.href = href;
            }
        });
    }

    /**
     * 初始化其他公共功能
     */
    initOthers() {
        // 处理全局 AJAX 错误
        $(document).ajaxError((event, jqXHR, settings, error) => {
            console.error('AJAX Error:', error);
            // 可以添加错误提示
        });
    }

    /**
     * 显示加载中
     */
    showLoading() {
        // 可以添加加载动画
    }

    /**
     * 隐藏加载中
     */
    hideLoading() {
        // 可以移除加载动画
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        console.error(message);
        // 可以添加错误提示
    }
} 