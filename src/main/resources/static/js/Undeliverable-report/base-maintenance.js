/**
 * 基础维护页面类
 * 提供通用的CRUD和日志功能
 */
class BaseMaintenancePage extends BasePage {
    constructor(options) {
        super();
        this.options = {
            tableId: '',
            modalId: '',
            apiPath: '',
            ...options
        };
        this.initFormValidation();
        this.loadData();
    }

    initializeEvents() {
        const $document = $(document);
        
        // 添加和保存按钮事件
        $document
            .on('click', '#addBtn', () => this.showModal())
            .on('click', '#saveBtn', () => this.saveData());

        // 表格操作按钮事件
        $document
            .on('click', '.edit-btn', e => this.handleEdit(e))
            .on('click', '.delete-btn', e => this.handleDelete(e))
            .on('click', '.logs-btn', e => this.handleLogs(e));

        // 模态框事件
        $document.on('hidden.bs.modal', `#${this.options.modalId}`, () => this.resetForm());
    }

    /**
     * 加载数据列表
     */
    loadData() {
        $.ajax({
            url: this.options.apiPath,
            type: 'GET',
            success: data => this.handleDataLoaded(data),
            error: xhr => {
                console.error('Failed to load data:', xhr);
                this.showMessage('Failed to load data', 'danger');
            }
        });
    }

    /**
     * 保存数据
     */
    saveData() {
        if (!this.validateForm()) return;

        const data = this.getFormData();
        const id = this.getCurrentId();
        const config = this.getRequestConfig(id);

        $.ajax({
            url: config.url,
            type: config.method,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: () => this.handleSaveSuccess(id),
            error: xhr => this.handleSaveError(xhr, id)
        });
    }

    /**
     * 删除数据
     */
    deleteData(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        $.ajax({
            url: `${this.options.apiPath}/${id}`,
            type: 'DELETE',
            success: () => {
                this.showMessage('Item deleted successfully');
                this.loadData();
            },
            error: xhr => this.showMessage('Failed to delete: ' + xhr.responseText, 'danger')
        });
    }

    /**
     * 显示操作日志
     */
    showOperationLogs(id, title) {
        $.ajax({
            url: `${this.options.apiPath}/${id}/logs`,
            type: 'GET',
            success: logs => {
                $('#logModalLabel').text(`Operation Logs - ${title}`);
                this.renderTimeline(logs);
                $('#logModal').modal('show');
            },
            error: xhr => this.showMessage('Failed to load operation logs', 'danger')
        });
    }

    /**
     * 渲染时间轴
     */
    renderTimeline(logs) {
        if (!logs || logs.length === 0) {
            this.renderEmptyTimeline();
            return;
        }

        const groupedLogs = this.groupLogsByDate(logs);
        this.renderGroupedLogs(groupedLogs);
    }

    /**
     * 工具方法
     */
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

    // 需要子类实现的方法
    validateForm() { throw new Error('Must be implemented by subclass'); }
    getFormData() { throw new Error('Must be implemented by subclass'); }
    handleDataLoaded(data) { throw new Error('Must be implemented by subclass'); }
    getCurrentId() { throw new Error('Must be implemented by subclass'); }
    initFormValidation() { throw new Error('Must be implemented by subclass'); }
} 