const Utils = {
    // 日期格式化函数
    formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    },

    // 表格下载函数
    downloadTable(tableId, fileName) {
        const table = document.getElementById(tableId);
        const wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
        XLSX.writeFile(wb, fileName);
    },

    // 显示加载状态
    showLoading($btn) {
        $btn.prop('disabled', true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i> Loading...');
    },

    // 隐藏加载状态
    hideLoading($btn, text) {
        $btn.prop('disabled', false)
            .html(`<i class="fas fa-file-alt mr-1"></i> ${text}`);
    }
}; 