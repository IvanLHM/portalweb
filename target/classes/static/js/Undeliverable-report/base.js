class BasePage {
  constructor() {
      this.initializeEvents();
      this.initToastr();
  }

  initializeEvents() {
      // 基类的事件初始化逻辑
  }

  initToastr() {
      // 配置 toastr
      if (typeof toastr !== 'undefined') {
          toastr.options = {
              closeButton: true,
              progressBar: true,
              positionClass: "toast-top-right",
              timeOut: 3000
          };
      }
  }

  // 通用的工具方法
  formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  escapeHtml(unsafe) {
      if (!unsafe) return '';
      return String(unsafe)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
  }

  showMessage(message, type = 'success') {
      if (typeof toastr !== 'undefined') {
          // 将 danger 类型映射为 error
          if (type === 'danger') {
              type = 'error';
          }
          toastr[type](message);
      } else {
          alert(`${type.toUpperCase()}: ${message}`);
      }
  }

  // 通用的操作类型样式
  getOperationIcon(type) {
      const icons = {
          'CREATE': 'fas fa-plus',
          'UPDATE': 'fas fa-edit',
          'DELETE': 'fas fa-trash'
      };
      return icons[type] || 'fas fa-info';
  }

  getOperationBgClass(type) {
      const classes = {
          'CREATE': 'bg-success',
          'UPDATE': 'bg-info',
          'DELETE': 'bg-danger'
      };
      return classes[type] || 'bg-secondary';
  }

  /**
   * 防抖函数
   * @param {Function} func 需要防抖的函数
   * @param {number} wait 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait) {
      let timeout;
      return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
      };
  }

  /**
   * 显示等待层
   * @param {string} [message='Loading...'] - 显示的消息
   * @returns {HTMLElement} - 等待层元素
   */
  showLoading(message = 'Loading...') {
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.innerHTML = `
          <div class="overlay-content">
              <i class="fas fa-spinner fa-spin"></i>
              <span class="ml-2">${message}</span>
          </div>
      `;
      this.container.appendChild(overlay);
      return overlay;
  }

  /**
   * 隐藏等待层
   * @param {HTMLElement} overlay - 等待层元素
   */
  hideLoading(overlay) {
      if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
      }
  }
}