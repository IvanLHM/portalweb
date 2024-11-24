class ReasonMaintenancePage extends BasePage {
    constructor() {
        super();
        this.$reasonTable = $('#reasonTable');
        this.init();
    }

    init() {
        this.initEvents();
        this.initFormValidation();
        this.loadReasonsList();
    }

    initEvents() {
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
                    $btn.data('id'),
                    $btn.data('description')
                );
            })
            .on('click', '.delete-btn', e => this.deleteReason($(e.currentTarget).data('id')))
            .on('click', '.logs-btn', e => {
                const $btn = $(e.currentTarget);
                this.showOperationLogs($btn.data('id'), $btn.data('reason-code'));
            });

        // 模态框事件
        $document.on('hidden.bs.modal', '#reasonModal', () => this.resetForm());
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
            },
            errorPlacement: function(error, element) {
                error.insertAfter(element);
            },
            success: function(label) {
                // 不添加成功状态的样式
            }
        });
    }

    loadReasonsList() {
        $.ajax({
            url: '/undeliverable-report/api/reasons',
            type: 'GET',
            success: reasons => this.handleReasonsLoaded(reasons),
            error: xhr => {
                console.error('Failed to load reasons:', xhr);
                this.showMessage('Failed to load reasons', 'danger');
            }
        });
    }

    handleReasonsLoaded(reasons) {
        if (!reasons || reasons.length === 0) {
            this.toggleView(false);
            return;
        }

        const $tbody = $('#reasonTableBody');
        $tbody.empty();

        const tableRows = reasons.map(reason => this.createReasonRow(reason)).join('');
        $tbody.html(tableRows);
        this.toggleView(true);
    }

    createReasonRow(reason) {
        return `
            <tr data-id="${reason.id}">
                <td>${reason.id}</td>
                <td>${this.escapeHtml(reason.description)}</td>
                <td>${this.formatDate(reason.createdAt)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info edit-btn" 
                                data-id="${reason.id}" 
                                data-description="${this.escapeHtml(reason.description)}"
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" 
                                data-id="${reason.id}"
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-primary logs-btn" 
                                data-id="${reason.id}"
                                data-reason-code="${reason.id}"
                                title="Operation Logs">
                            <i class="fas fa-list-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    createActionButtons(reason) {
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-id="${reason.id}" 
                    data-reason-code="${this.escapeHtml(reason.reasonCode)}" 
                    data-description="${this.escapeHtml(reason.description || '')}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    data-id="${reason.id}"
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    data-id="${reason.id}"
                    data-reason-code="${this.escapeHtml(reason.reasonCode)}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    toggleView(hasReasons) {
        $('#reasonTable').toggle(hasReasons);
        $('#emptyState').toggle(!hasReasons);
    }

    showModal(id = null) {
        this.resetForm();
        $('#reasonId').val(id);
        $('#reasonModalLabel').text(id ? 'Edit Reason' : 'Add Reason');
        $('.reason-code-group').toggle(!!id);
        if (id) {
            $('#reasonCode').val(id);
        }
        $('#reasonModal').modal('show');
    }

    editReason(id, description) {
        this.showModal(id);
        $('#reasonId').val(id);
        $('#reasonCode').val(id);
        $('#description').val(description);
    }

    saveReason() {
        if (!$('#reasonForm').valid()) {
            return;
        }

        const id = $('#reasonId').val();
        const data = {
            description: $('#description').val()
        };

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
                this.loadReasonsList();
            },
            error: xhr => {
                let errorMessage = xhr.responseText;
                errorMessage = errorMessage.replace(/"/g, '');
                const $description = $('#description');
                $description.addClass('is-invalid');
                let $feedback = $description.next('.invalid-feedback');
                if ($feedback.length === 0) {
                    $feedback = $('<div class="invalid-feedback"></div>');
                    $description.after($feedback);
                }
                $feedback.text(errorMessage);
                $feedback.show();
            }
        });
    }

    deleteReason(id) {
        if (!confirm('Are you sure you want to delete this reason?')) {
            return;
        }

        $.ajax({
            url: `/undeliverable-report/api/reasons/${id}`,
            type: 'DELETE',
            success: () => {
                this.showMessage('Reason deleted successfully');
                this.loadReasonsList();
            },
            error: xhr => {
                console.error('Error:', xhr.responseText);
                this.showMessage('Failed to delete reason: ' + xhr.responseText, 'danger');
            }
        });
    }

    showOperationLogs(id, reasonCode) {
        $.ajax({
            url: `/undeliverable-report/api/reasons/${id}/logs`,
            type: 'GET',
            success: logs => {
                $('#logModalLabel').text(`Operation Logs - Reason: ${reasonCode}`);
                this.renderTimeline(logs);
                $('#logModal').modal('show');
            },
            error: xhr => {
                console.error('Error:', xhr.responseText);
                this.showMessage('Failed to load operation logs', 'danger');
            }
        });
    }

    resetForm() {
        const $form = $('#reasonForm');
        $form[0].reset();
        $('#reasonId').val('');
        $form.validate().resetForm();
        $('.is-invalid').removeClass('is-invalid');
        $('.is-valid').removeClass('is-valid');
        $('.invalid-feedback').hide();
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

    /**
     * 渲染时间轴
     */
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

        // 按日期分组
        const groupedLogs = this.groupLogsByDate(logs);
        
        // 渲染每个日期组
        Object.keys(groupedLogs).sort().reverse().forEach(date => {
            // 添加日期标签
            $timeline.append(`
                <div class="time-label">
                    <span class="bg-primary">${date}</span>
                </div>
            `);

            // 渲染该日期下的所有日志
            groupedLogs[date].forEach(log => {
                const icon = this.getOperationIcon(log.operationType);
                const bgClass = this.getOperationBgClass(log.operationType);
                const time = new Date(log.createdAt).toLocaleTimeString();
                
                $timeline.append(`
                    <div>
                        <i class="${icon} ${bgClass}"></i>
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

        // 添加结束标记
        $timeline.append(`
            <div>
                <i class="fas fa-clock bg-gray"></i>
            </div>
        `);
    }

    /**
     * 按日期分组
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
     * 获取操作类型图标
     */
    getOperationIcon(type) {
        switch (type.toUpperCase()) {
            case 'CREATE': return 'fas fa-plus';
            case 'UPDATE': return 'fas fa-edit';
            case 'DELETE': return 'fas fa-trash';
            default: return 'fas fa-info';
        }
    }

    /**
     * 获取操作类型背景样式
     */
    getOperationBgClass(type) {
        switch (type.toUpperCase()) {
            case 'CREATE': return 'bg-success';
            case 'UPDATE': return 'bg-info';
            case 'DELETE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    /**
     * 获取操作类型徽章样式
     */
    getOperationTypeClass(type) {
        switch (type.toUpperCase()) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'danger';
            default: return 'secondary';
        }
    }

    handleSaveError(xhr, id) {
        console.error('Error:', xhr.responseText);
        let errorMessage = xhr.responseText;
        if (errorMessage.includes('already exists')) {
            errorMessage = 'This description already exists. Please use a different description.';
        }
        this.showMessage(`Failed to ${id ? 'update' : 'create'} reason: ${errorMessage}`, 'danger');
    }
}

// 初始化页面
$(document).ready(() => {
    window.reasonPage = new ReasonMaintenancePage();
}); 