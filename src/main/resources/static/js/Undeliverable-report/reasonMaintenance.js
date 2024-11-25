/**
 * 原因维护页面类
 */
class ReasonMaintenancePage extends BasePage {
    constructor() {
        super();
        this.$reasonTable = $('#reasonTable');
        this.initFormValidation();
        this.loadData();
    }

    initializeEvents() {
        const $document = $(document);
        
        // 添加和保存按钮事件
        $document
            .on('click', '#addReasonBtn', () => this.showModal())
            .on('click', '#saveReasonBtn', () => this.saveReason());

        // 表格操作按钮事件
        $document
            .on('click', '.edit-btn', e => {
                const $btn = $(e.currentTarget);
                this.editReason(
                    $btn.attr('data-id'),
                    $btn.attr('data-description')
                );
            })
            .on('click', '.delete-btn', e => {
                e.preventDefault();
                const id = $(e.currentTarget).attr('data-id');
                if (id) {
                    this.deleteReason(String(id));
                }
            })
            .on('click', '.logs-btn', e => {
                const $btn = $(e.currentTarget);
                this.showOperationLogs(
                    $btn.attr('data-id'),
                    $btn.attr('data-reason-code')
                );
            });

        // 模态框事件
        $document.on('hidden.bs.modal', '#reasonModal', () => this.resetForm());
    }

    // 加载数据列表
    loadData() {
        $.ajax({
            url: '/undeliverable-report/api/reasons',
            type: 'GET',
            success: reasons => this.handleDataLoaded(reasons),
            error: xhr => {
                console.error('Failed to load reasons:', xhr);
                this.showMessage('Failed to load reasons', 'danger');
            }
        });
    }

    // 处理数据加载完成
    handleDataLoaded(reasons) {
        if (!reasons || reasons.length === 0) {
            this.toggleView(false);
            return;
        }

        const $tbody = $('#reasonTableBody');
        $tbody.empty();
        $tbody.html(reasons.map(reason => this.createReasonRow(reason)).join(''));
        this.toggleView(true);
    }

    // 创建行HTML
    createReasonRow(reason) {
        const id = String(reason.id);
        return `
            <tr data-id="${id}">
                <td>${id}</td>
                <td>${this.escapeHtml(reason.description)}</td>
                <td>${this.formatDate(reason.createdAt)}</td>
                <td>
                    <div class="btn-group">
                        ${this.createActionButtons(reason)}
                    </div>
                </td>
            </tr>
        `;
    }

    // 显示模态框
    showModal(id = null) {
        this.resetForm();
        $('#reasonId').val(id);
        $('#reasonModalLabel').text(id ? 'Edit Reason' : 'Add Reason');
        $('#reasonModal').modal('show');
    }

    // 编辑原因
    editReason(id, description) {
        this.showModal(id);
        $('#reasonId').val(id);
        $('#description').val(description);
    }

    // 保存原因
    saveReason() {
        if (!this.validateForm()) return;

        const id = $('#reasonId').val();
        const data = this.getFormData();

        const url = id ? 
            `/undeliverable-report/api/reasons/${id}` : 
            '/undeliverable-report/api/reasons';
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url,
            type: method,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: () => {
                $('#reasonModal').modal('hide');
                this.showMessage(`Reason ${id ? 'updated' : 'created'} successfully`);
                this.loadData();
            },
            error: xhr => {
                console.error('Error:', xhr);
                let errorMessage = '';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.message || response.error || xhr.responseText;
                } catch (e) {
                    errorMessage = xhr.responseText;
                }
                this.showMessage(`Failed to ${id ? 'update' : 'create'} reason: ${errorMessage}`, 'danger');
            }
        });
    }

    // 删除原因
    deleteReason(id) {
        if (!id) return;
        
        if (!confirm('Are you sure you want to delete this reason?')) return;

        const url = `/undeliverable-report/api/reasons/${String(id)}`;
        
        $.ajax({
            url,
            type: 'DELETE',
            success: response => {
                this.showMessage('Reason deleted successfully');
                setTimeout(() => this.loadData(), 100);
            },
            error: xhr => {
                console.error('Delete failed:', xhr);
                this.showMessage('Failed to delete reason: ' + (xhr.responseText || 'Unknown error'), 'danger');
            }
        });
    }

    // 显示操作日志
    showOperationLogs(id, reasonCode) {
        if (!id) return;
        
        $.ajax({
            url: `/undeliverable-report/api/reasons/${id}/logs`,
            type: 'GET',
            success: logs => {
                console.log('Loaded logs:', logs);  // 调试日志
                $('#logModalLabel').text(`Operation Logs - Reason: ${reasonCode}`);
                this.renderTimeline(logs);
                $('#logModal').modal('show');
            },
            error: xhr => {
                console.error('Error loading logs:', xhr);
                this.showMessage('Failed to load operation logs', 'danger');
            }
        });
    }

    // 重置表单
    resetForm() {
        const $form = $('#reasonForm');
        $form[0].reset();
        $('#reasonId').val('');
        $form.validate().resetForm();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').hide();
    }

    // 切换视图
    toggleView(hasReasons) {
        $('#reasonTable').toggle(hasReasons);
        $('#emptyState').toggle(!hasReasons);
    }

    // 创建操作按钮
    createActionButtons(reason) {
        const id = String(reason.id);
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-id="${id}" 
                    data-description="${this.escapeHtml(reason.description)}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    data-id="${id}" 
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    data-id="${id}"
                    data-reason-code="${id}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    // 渲染时间轴
    renderTimeline(logs) {
        const $timeline = $('#logTimeline');
        $timeline.empty();

        if (!logs || logs.length === 0) {
            $timeline.append(`
                <div class="time-label">
                    <span class="bg-secondary">No Logs</span>
                </div>
                <div>
                    <i class="fas fa-info bg-info"></i>
                    <div class="timeline-item">
                        <h3 class="timeline-header">No operation logs found</h3>
                    </div>
                </div>
            `);
            return;
        }

        const groupedLogs = this.groupLogsByDate(logs);
        Object.keys(groupedLogs).sort().reverse().forEach(date => {
            $timeline.append(`
                <div class="time-label">
                    <span class="bg-primary">${date}</span>
                </div>
            `);

            groupedLogs[date].forEach(log => {
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
                                ${this.escapeHtml(log.operationDesc)}
                            </h3>
                        </div>
                    </div>
                `);
            });
        });

        $timeline.append(`
            <div>
                <i class="fas fa-clock bg-gray"></i>
            </div>
        `);
    }

    // 按日期分组日志
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

    // 获取操作类型样式
    getOperationTypeClass(type) {
        const classes = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'danger'
        };
        return classes[type] || 'secondary';
    }

    // 添加缺失的表单验证相关方法
    validateForm() {
        return $('#reasonForm').valid();
    }

    getFormData() {
        return {
            id: $('#reasonId').val() ? String($('#reasonId').val()) : null,  // 转为字符串
            description: $('#description').val()
        };
    }

    initFormValidation() {
        $('#reasonForm').validate({
            rules: {
                description: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                description: {
                    required: "Please enter description",
                    maxlength: "Description cannot exceed 200 characters"
                }
            },
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: function(element) {
                $(element).addClass('is-invalid');
            },
            unhighlight: function(element) {
                $(element).removeClass('is-invalid');
            }
        });
    }
}

// 初始化页面
$(document).ready(() => {
    window.reasonPage = new ReasonMaintenancePage();
}); 