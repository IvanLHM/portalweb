/**
 * 账户维护页面类
 */
class AccountMaintenancePage extends BasePage {
    constructor() {
        super();
        this.$accountTable = $('#accountTable');
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.initEvents();
        this.initFormValidation();
        this.loadData();
    }

    /**
     * 加载初始数据
     */
    loadData() {
        Promise.all([
            this.loadAccountsList(),
            this.loadReasonsList()
        ]).catch(error => {
            console.error('Failed to load initial data:', error);
            this.showMessage('Failed to load data', 'danger');
        });
    }

    /**
     * 加载账户列表
     */
    loadAccountsList() {
        return $.ajax({
            url: '/undeliverable-report/api/accounts',
            type: 'GET',
            success: accounts => this.handleAccountsLoaded(accounts),
            error: xhr => {
                console.error('Failed to load accounts:', xhr);
                this.showMessage('Failed to load accounts', 'danger');
            }
        });
    }

    /**
     * 账户数据加载完成
     */
    handleAccountsLoaded(accounts) {
        if (!accounts || accounts.length === 0) {
            this.toggleView(false);
            return;
        }

        const $tbody = $('#accountTableBody');
        $tbody.empty();

        // 使用模板字符串渲染表格行
        const tableRows = accounts.map(account => this.createAccountRow(account)).join('');
        $tbody.html(tableRows);
        this.toggleView(true);
    }

    /**
     * 创建账户行HTML
     */
    createAccountRow(account) {
        return `
            <tr data-id="${account.id}">
                <td>${this.escapeHtml(account.account)}</td>
                <td>${this.escapeHtml(account.description || '')}</td>
                <td>${this.formatDate(account.lastUpdate)}</td>
                <td>
                    <div class="btn-group">
                        ${this.createActionButtons(account)}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 创建操作按钮HTML
     */
    createActionButtons(account) {
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-id="${account.id}" 
                    data-account="${this.escapeHtml(account.account)}" 
                    data-reason-id="${account.reasonId}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    data-id="${account.id}"
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    data-id="${account.id}"
                    data-account="${this.escapeHtml(account.account)}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    /**
     * HTML转义，防止XSS攻击
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * 保存成功后刷新列表
     */
    handleSaveSuccess(id) {
        $('#accountModal').modal('hide');
        this.showMessage(`Account ${id ? 'updated' : 'created'} successfully`);
        this.loadAccountsList();  // 重新加载列表
    }

    /**
     * 事件绑定
     */
    initEvents() {
        const $document = $(document);
        
        // 账户操作事件
        $document
            .on('click', '#addAccountBtn, #emptyStateAddBtn', () => this.showModal())
            .on('click', '#saveAccountBtn', () => this.saveAccount());

        // 表格按钮事件
        $document
            .on('click', '.edit-btn', e => this.handleEdit(e))
            .on('click', '.delete-btn', e => this.handleDelete(e))
            .on('click', '.logs-btn', e => this.handleLogs(e));

        // 模态框事件
        $document.on('hidden.bs.modal', '#accountModal', () => this.resetForm());
    }

    /**
     * 数据加载相关方法
     */
    loadReasonsList() {
        return $.ajax({
            url: '/undeliverable-report/api/reasons',
            type: 'GET',
            success: reasons => {
                console.log('Loaded reasons:', reasons); // 调试日志
                const $select = $('#reason');
                $select.empty().append('<option value="">Select a reason</option>');
                if (reasons && reasons.length > 0) {
                    reasons.forEach(reason => {
                        if (reason && reason.id && reason.description) {
                            $select.append(`
                                <option value="${String(reason.id)}">
                                    ${this.escapeHtml(reason.description)}
                                </option>
                            `);
                        }
                    });
                }
            },
            error: xhr => {
                console.error('Failed to load reasons:', xhr);
                this.showMessage('Failed to load reasons', 'danger');
            }
        });
    }

    toggleView(hasAccounts) {
        $('#accountTable').toggle(hasAccounts);
        $('#emptyState').toggle(!hasAccounts);
    }

    /**
     * 按钮事件处理方法
     */
    handleEdit(e) {
        const $btn = $(e.currentTarget);
        this.editAccount(
            $btn.data('id'),
            $btn.data('account'),
            $btn.data('reason-id')
        );
    }

    handleDelete(e) {
        const id = $(e.currentTarget).data('id');
        this.deleteAccount(id);
    }

    handleLogs(e) {
        const $btn = $(e.currentTarget);
        this.showOperationLogs($btn.data('id'), $btn.data('account'));
    }

    /**
     * 账户操作方法
     */
    showModal(id = null) {
        this.resetForm();  // 确保清除之前的错误提示
        $('#accountId').val(id);
        $('#accountModalLabel').text(id ? 'Edit Account' : 'Add Account');
        $('#accountModal').modal('show');
    }

    editAccount(id, account, reasonId) {
        this.showModal(id);
        $('#accountId').val(String(id));
        $('#account').val(account);
        $('#reason').val(String(reasonId));
    }

    deleteAccount(id) {
        if (!confirm('Are you sure you want to delete this account?')) return;

        $.ajax({
            url: `/undeliverable-report/api/accounts/${id}`,
            type: 'DELETE',
            success: () => {
                this.showMessage('Account deleted successfully');
                this.loadAccountsList();
            },
            error: xhr => this.showMessage('Failed to delete account: ' + xhr.responseText, 'danger')
        });
    }

    /**
     * 初始化表单验证
     */
    initFormValidation() {
        $.validator.addMethod("accountFormat", function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9_-]*$/.test(value);
        }, "Account can only contain letters, numbers, underscores and hyphens");

        $('#accountForm').validate({
            rules: {
                account: {
                    required: true,
                    minlength: 3,
                    maxlength: 100,
                    accountFormat: true
                },
                reason: {
                    required: true
                }
            },
            messages: {
                account: {
                    required: "Please enter account",
                    minlength: "Account must be at least 3 characters",
                    maxlength: "Account cannot exceed 100 characters"
                },
                reason: {
                    required: "Please select a reason"
                }
            },
            errorClass: 'invalid-feedback',
            highlight: function(element) {
                $(element).addClass('is-invalid');
            },
            unhighlight: function(element) {
                $(element).removeClass('is-invalid');
            }
        });
    }

    /**
     * 保存账户
     */
    saveAccount() {
        if (!$('#accountForm').valid()) {
            return;
        }

        const id = $('#accountId').val();
        const data = {
            id: id ? String(id) : null,
            account: $('#account').val(),
            reasonId: String($('#reason').val())  // 使用String类型保存reasonId
        };

        if (!data.account || !data.reasonId) {
            this.showMessage('Please fill in all required fields', 'warning');
            return;
        }

        const url = id ? 
            `/undeliverable-report/api/accounts/${id}` : 
            '/undeliverable-report/api/accounts';
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url,
            type: method,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: () => {
                $('#accountModal').modal('hide');
                this.showMessage(`Account ${id ? 'updated' : 'created'} successfully`);
                this.loadAccountsList();
            },
            error: xhr => {
                console.error('Error:', xhr.responseText);
                this.showMessage(`Failed to ${id ? 'update' : 'create'} account: ${xhr.responseText}`, 'danger');
            }
        });
    }

    /**
     * 表单相关方法
     */
    getFormData() {
        const id = $('#accountId').val();
        return {
            id: id || null,
            account: $('#account').val(),
            reasonId: parseInt($('#reason').val())
        };
    }

    getRequestConfig(id) {
        return {
            url: id ? `/undeliverable-report/api/accounts/${id}` : '/undeliverable-report/api/accounts',
            method: id ? 'PUT' : 'POST'
        };
    }

    /**
     * 处理保存错误
     */
    handleSaveError(xhr, id) {
        console.error('Error:', xhr.responseText);
        let errorMessage = xhr.responseText;
        
        try {
            // 尝试解析后端返回的错误信息
            const errors = JSON.parse(xhr.responseText);
            if (Array.isArray(errors)) {
                errorMessage = errors.join('<br>');
            }
        } catch (e) {
            // 如果解析失败，使用原始错误信息
        }
        
        this.showMessage(`Failed to ${id ? 'update' : 'create'} account:<br>${errorMessage}`, 'danger');
    }

    /**
     * 重置表单
     */
    resetForm() {
        const $form = $('#accountForm');
        $form[0].reset();
        $('#accountId').val('');
        $form.validate().resetForm();
        $('.is-invalid').removeClass('is-invalid');
        $('.fa-exclamation-circle').remove();
    }

    /**
     * 操作日志相关方法
     */
    showOperationLogs(id, account) {
        $.ajax({
            url: `/undeliverable-report/api/accounts/${id}/logs`,
            type: 'GET',
            success: logs => {
                $('#logModalLabel').text(`Operation Logs - Account: ${account}`);
                this.renderTimeline(logs);
                $('#logModal').modal('show');
            },
            error: xhr => this.showMessage('Failed to load operation logs: ' + xhr.responseText, 'danger')
        });
    }

    /**
     * 操作日志时间轴渲染
     */
    renderTimeline(logs) {
        const $timeline = $('#logTimeline');
        $timeline.empty();

        if (!logs || logs.length === 0) {
            this.renderEmptyTimeline($timeline);
            return;
        }

        // 按日期分组并渲染
        const groupedLogs = this.groupLogsByDate(logs);
        this.renderGroupedLogs($timeline, groupedLogs);

        // 添加结束标记
        $timeline.append(`
            <div>
                <i class="fas fa-clock bg-gray"></i>
            </div>
        `);
    }

    /**
     * 渲染空日志提示
     */
    renderEmptyTimeline($timeline) {
        $timeline.append(`
            <div class="time-label">
                <span class="bg-secondary">No Logs</span>
            </div>
            <div>
                <i class="fas fa-info bg-info"></i>
                <div class="timeline-item">
                    <h3 class="timeline-header">No operation logs found for this account</h3>
                </div>
            </div>
        `);
    }

    /**
     * 按日期分组渲染日志
     */
    renderGroupedLogs($timeline, groupedLogs) {
        Object.keys(groupedLogs)
            .sort()
            .reverse()
            .forEach(date => {
                // 添加日期标签
                $timeline.append(`
                    <div class="time-label">
                        <span class="bg-primary">${date}</span>
                    </div>
                `);

                // 渲染该日期下的所有日志
                groupedLogs[date].forEach(log => {
                    this.renderLogItem($timeline, log);
                });
            });
    }

    /**
     * 渲染单条日志
     */
    renderLogItem($timeline, log) {
        const time = new Date(log.createdAt).toLocaleTimeString();
        
        $timeline.append(`
            <div>
                <i class="${this.getOperationIcon(log.operationType)} ${this.getOperationBgClass(log.operationType)}"></i>
                <div class="timeline-item">
                    <span class="time">
                        <i class="fas fa-clock"></i> ${time}
                    </span>
                    <h3 class="timeline-header">
                        <span class="badge badge-${this.getOperationTypeClass(log.operationType)}">
                            ${log.operationType}
                        </span>
                        ${log.operationDesc}
                    </h3>
                </div>
            </div>
        `);
    }

    /**
     * 日志分组方法
     */
    groupLogsByDate(logs) {
        return logs.reduce((groups, log) => {
            const date = new Date(log.createdAt).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(log);
            return groups;
        }, {});
    }

    /**
     * 操作类型图标映射
     */
    getOperationIcon(type) {
        const icons = {
            'CREATE': 'fas fa-plus',
            'UPDATE': 'fas fa-edit',
            'DELETE': 'fas fa-trash',
            'DEFAULT': 'fas fa-info'
        };
        return icons[type] || icons.DEFAULT;
    }

    /**
     * 操作类型背景样式映射
     */
    getOperationBgClass(type) {
        const bgClasses = {
            'CREATE': 'bg-success',
            'UPDATE': 'bg-info',
            'DELETE': 'bg-danger',
            'DEFAULT': 'bg-secondary'
        };
        return bgClasses[type] || bgClasses.DEFAULT;
    }

    /**
     * 操作类型徽章样式映射
     */
    getOperationTypeClass(type) {
        const badgeClasses = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'danger',
            'DEFAULT': 'secondary'
        };
        return badgeClasses[type] || badgeClasses.DEFAULT;
    }
}

// 初始化页面
$(document).ready(() => {
    window.accountPage = new AccountMaintenancePage();
}); 