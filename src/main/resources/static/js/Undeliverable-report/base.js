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
}