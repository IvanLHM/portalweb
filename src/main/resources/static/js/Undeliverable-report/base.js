class BasePage {
  constructor() {
    this.init();
  }

  init() {
    // 初始化tooltip
    $('[data-toggle="tooltip"]').tooltip();
    
    // 初始化popover
    $('[data-toggle="popover"]').popover();
    
    // 初始化文件输入框
    bsCustomFileInput.init();

    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    // 子类实现具体的事件绑定
  }

  // 通用的工具方法
  formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  showLoading($btn) {
    $btn.prop('disabled', true)
        .html('<i class="fas fa-spinner fa-spin mr-1"></i> Loading...');
  }

  // 通用的消息提示方法
  showMessage(message, type = 'success') {
    const alertHtml = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;
    $('#messageContainer').html(alertHtml);
  }

  // AJAX请求封装
  ajax(options) {
    const defaultOptions = {
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      error: (xhr, status, error) => {
        this.showMessage('操作失败：' + error, 'danger');
      }
    };
    
    $.ajax({
      ...defaultOptions,
      ...options
    });
  }
} 