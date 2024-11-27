/**
 * 原因维护页面类
 */
class ReasonMaintenancePage extends BasePage {
    // 定义静态选择器配置
    static selectors = {
        table: '#reasonTable',
        tableBody: '#reasonTableBody',
        modal: {
            container: '#reasonModal'
        },
        form: {
            container: '#reasonForm',
            inputs: {
                id: '#reasonId',
                description: '#description'
            }
        },
        buttons: {
            add: '#addReasonBtn',
            save: '#saveReasonBtn'
        },
        states: {
            empty: '#emptyState'
        },
        logs: {
            modal: '#logModal',
            label: '#logModalLabel',
            timeline: '#logTimeline'
        }
    };

    constructor() {
        super();
        this.container = document.querySelector('.content-wrapper');
        this.initElements();
        this.initFormValidation();
        this.loadData();
        this.bindEvents();
        
        // 添加防抖的保存方法
        this.debouncedSave = this.debounce(this.saveReason.bind(this), 300);
    }

    initElements() {
        this.elements = {};
        const initElementsRecursive = (config, target) => {
            Object.entries(config).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    target[key] = this.container.querySelector(value);
                } else if (typeof value === 'object') {
                    target[key] = {};
                    initElementsRecursive(value, target[key]);
                }
            });
        };
        initElementsRecursive(ReasonMaintenancePage.selectors, this.elements);
    }

    // 根据属性名获取选择器
    getSelector(prop) {
        // 递归查找选择器
        const findSelector = (obj, key) => {
            if (typeof obj === 'string') return obj;
            if (typeof obj !== 'object' || !obj) return null;
            
            for (const [k, v] of Object.entries(obj)) {
                if (k === key) return v;
                const found = findSelector(v, key);
                if (found) return found;
            }
            return null;
        };

        return findSelector(ReasonMaintenancePage.selectors, prop);
    }

    bindEvents() {
        this.bindStaticEvents();
        this.bindDynamicEvents();
    }

    // 静态元素事件绑定
    bindStaticEvents() {
        const { buttons, modal } = this.elements;
        
        // 固定按钮事件
        buttons.add?.addEventListener('click', () => this.showModal());
        buttons.save?.addEventListener('click', () => this.debouncedSave());
        
        // Modal 事件
        modal.container?.addEventListener('hidden.bs.modal', () => this.resetForm());
    }

    // 动态元素事件绑定（使用事件委托）
    bindDynamicEvents() {
        // 表格操作按钮的事件委托
        const tableBody = this.elements.tableBody;
        if (tableBody) {
            tableBody.addEventListener('click', e => this.handleTableAction(e));
        }
    }

    // 表格操作按钮的事件处理
    handleTableAction(e) {
        try {
            // 修改目标元素的查找方式
            const target = e.target.closest('button');  // 直接查找最近的按钮
            if (!target) return;

            // 获取按钮所在行的数据
            const tr = target.closest('tr');
            if (!tr) return;

            const id = tr.dataset.id;
            if (!id) return;

            // 根据按钮的类来判断操作类型
            if (target.classList.contains('edit-btn')) {
                const description = target.dataset.description;
                this.editReason(id, description);
            } else if (target.classList.contains('delete-btn')) {
                e.preventDefault();
                this.deleteReason(id);
            } else if (target.classList.contains('logs-btn')) {
                this.showOperationLogs(id, id);  // 使用 id 作为 reasonCode
            }
        } catch (error) {
            console.error('Error handling table action:', error);
            this.showMessage('An error occurred while processing your request', 'error');
        }
    }

    createActionButtons(reason) {
        const id = String(reason.id);
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-description="${this.escapeHtml(reason.description)}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    async loadData() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-overlay';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.container.appendChild(loadingIndicator);

        try {
            const response = await fetch('/undeliverable-report/api/reasons');
            if (!response.ok) throw new Error('Network response was not ok');
            const reasons = await response.json();
            this.handleDataLoaded(reasons);
        } catch (error) {
            console.error('Failed to load reasons:', error);
            this.showMessage('Failed to load reasons', 'error');
        } finally {
            loadingIndicator.remove();
        }
    }

    handleDataLoaded(reasons) {
        if (!reasons?.length) {
            this.toggleView(false);
            return;
        }

        // 使用 jQuery 选择器确保安全访问
        const $tableBody = $(this.elements.tableBody);
        if ($tableBody.length) {
            $tableBody.html(reasons.map(this.createReasonRow.bind(this)).join(''));
            this.toggleView(true);
        } else {
            console.error('Table body element not found');
            this.showMessage('Failed to update table content', 'error');
        }
    }

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

    showModal(id = null) {
        this.resetForm();
        this.elements.form.inputs.id.value = id;
        this.elements.modal.label.textContent = id ? 'Edit Reason' : 'Add Reason';
        $(this.elements.modal.container).modal('show');
    }

    editReason(id, description) {
        this.showModal(id);
        this.elements.form.inputs.id.value = id;
        this.elements.form.inputs.description.value = description;
    }

    async saveReason() {
        if (!this.validateForm()) return;

        const id = this.elements.form.inputs.id.value;
        const data = this.getFormData();
        
        try {
            const response = await fetch(
                id ? `/undeliverable-report/api/reasons/${id}` : '/undeliverable-report/api/reasons', 
                {
                    method: id ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) throw await response.text();

            $(this.elements.modal.container).modal('hide');
            this.showMessage(`Reason ${id ? 'updated' : 'created'} successfully`);
            await this.loadData();
        } catch (error) {
            console.error('Error:', error);
            this.showMessage(`Failed to ${id ? 'update' : 'create'} reason: ${error}`, 'error');
        }
    }

    async deleteReason(id) {
        if (!id || !confirm('Are you sure you want to delete this reason?')) return;

        try {
            await $.ajax({
                url: `/undeliverable-report/api/reasons/${id}`,
                type: 'DELETE'
            });
            
            this.showMessage('Reason deleted successfully');
            await this.loadData();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showMessage('Failed to delete reason: ' + (error.responseText || 'Unknown error'), 'error');
        }
    }

    async showOperationLogs(id, reasonCode) {
        if (!id) return;
        
        try {
            const response = await fetch(`/undeliverable-report/api/reasons/${id}/logs`);
            if (!response.ok) {
                throw new Error(await response.text());
            }
            
            const logs = await response.json();
            
            // 使用 jQuery 确保模态框和内容更新正确
            const $logModal = $(this.elements.logs.modal);
            const $logLabel = $(this.elements.logs.label);
            const $logTimeline = $(this.elements.logs.timeline);

            $logLabel.text(`Operation Logs - Reason: ${reasonCode}`);
            
            // 渲染日志内容
            if (!logs || logs.length === 0) {
                $logTimeline.html(`
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
            } else {
                const groupedLogs = this.groupLogsByDate(logs);
                let timelineHtml = '';
                
                Object.keys(groupedLogs).sort().reverse().forEach(date => {
                    timelineHtml += `
                        <div class="time-label">
                            <span class="bg-primary">${date}</span>
                        </div>
                    `;

                    groupedLogs[date].forEach(log => {
                        const time = new Date(log.createdAt).toLocaleTimeString();
                        timelineHtml += `
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
                        `;
                    });
                });

                timelineHtml += `
                    <div>
                        <i class="fas fa-clock bg-gray"></i>
                    </div>
                `;

                $logTimeline.html(timelineHtml);
            }

            // 显示模态框
            $logModal.modal('show');

        } catch (error) {
            console.error('Error loading logs:', error);
            this.showMessage('Failed to load operation logs: ' + error.message, 'error');
        }
    }

    parseErrorMessage(error) {
        try {
            const response = JSON.parse(error.responseText);
            return response.message || response.error || error.responseText;
        } catch (e) {
            return error.responseText;
        }
    }

    resetForm() {
        const form = this.elements.form.container;
        form.reset();
        this.elements.form.inputs.id.value = '';
        $(form).validate().resetForm();
        $(form).find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $(form).find('.invalid-feedback').hide();
    }

    toggleView(hasReasons) {
        // 使用 jQuery 选择器确保安全访问
        const $table = $(this.elements.table);
        const $emptyState = $(this.elements.states.empty);

        if ($table.length) {
            $table.toggle(hasReasons);
        }
        
        if ($emptyState.length) {
            $emptyState.toggle(!hasReasons);
        }
    }

    validateForm() {
        return $(this.elements.form.container).valid();
    }

    getFormData() {
        return {
            id: this.elements.form.inputs.id.value || null,
            description: this.elements.form.inputs.description.value
        };
    }

    initFormValidation() {
        $(this.elements.form.container).validate({
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
            highlight: element => $(element).addClass('is-invalid'),
            unhighlight: element => $(element).removeClass('is-invalid'),
            success: element => {
                $(element).remove();
            },
            submitHandler: (form, event) => {
                event.preventDefault();
                this.saveReason();
            }
        });

        $(this.elements.form.inputs.description).on('input', e => {
            const input = e.target;
            if (input.value) {
                if (input.validity.valid) {
                    input.classList.remove('is-invalid');
                    input.classList.remove('is-valid');
                } else {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                }
            } else {
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 添加 groupLogsByDate 方法
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

    // 添加辅助方法
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

    getOperationTypeClass(type) {
        const classes = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'danger'
        };
        return classes[type] || 'secondary';
    }
}

// 使用 DOMContentLoaded 事件
document.addEventListener('DOMContentLoaded', () => {
    window.reasonPage = new ReasonMaintenancePage();
}); 