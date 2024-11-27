/**
 * 账户维护页面类
 */
class AccountMaintenancePage extends BasePage {
    // 定义静态选择器配置
    static selectors = {
        table: '#accountTable',
        tableBody: '#accountTableBody',
        modal: {
            container: '#accountModal',
            label: '#accountModalLabel'
        },
        form: {
            container: '#accountForm',
            inputs: {
                id: '#accountId',
                account: '#account',
                reason: '#reason'
            }
        },
        buttons: {
            add: '#addAccountBtn',
            save: '#saveAccountBtn'
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
        this.loadReasonsList();
        this.bindEvents();
        
        // 添加防抖的保存方法
        this.debouncedSave = this.debounce(this.saveAccount.bind(this), 300);
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
        initElementsRecursive(AccountMaintenancePage.selectors, this.elements);
    }

    bindEvents() {
        this.bindStaticEvents();
        this.bindDynamicEvents();
    }

    bindStaticEvents() {
        const { buttons, modal } = this.elements;
        
        // 固定按钮事件
        buttons.add?.addEventListener('click', () => this.showModal());
        buttons.save?.addEventListener('click', () => this.debouncedSave());
        
        // Modal 事件
        modal.container?.addEventListener('hidden.bs.modal', () => this.resetForm());
    }

    bindDynamicEvents() {
        // 表格操作按钮的事件委托
        const tableBody = this.elements.tableBody;
        if (tableBody) {
            tableBody.addEventListener('click', e => this.handleTableAction(e));
        }
    }

    handleTableAction(e) {
        try {
            const target = e.target.closest('button');
            if (!target) return;

            const tr = target.closest('tr');
            if (!tr) return;

            const id = tr.dataset.id;
            if (!id) return;

            if (target.classList.contains('edit-btn')) {
                const account = target.dataset.account;
                const reasonId = target.dataset.reasonId;
                this.editAccount(id, account, reasonId);
            } else if (target.classList.contains('delete-btn')) {
                e.preventDefault();
                this.deleteAccount(id);
            } else if (target.classList.contains('logs-btn')) {
                this.showOperationLogs(id, target.dataset.account);
            }
        } catch (error) {
            console.error('Error handling table action:', error);
            this.showMessage('An error occurred while processing your request', 'error');
        }
    }

    async loadData() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-overlay';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.container.appendChild(loadingIndicator);

        try {
            const response = await fetch('/undeliverable-report/api/accounts');
            if (!response.ok) throw new Error('Network response was not ok');
            const accounts = await response.json();
            this.handleDataLoaded(accounts);
        } catch (error) {
            console.error('Failed to load accounts:', error);
            this.showMessage('Failed to load accounts', 'error');
        } finally {
            loadingIndicator.remove();
        }
    }

    async loadReasonsList() {
        try {
            const response = await fetch('/undeliverable-report/api/reasons');
            if (!response.ok) throw new Error('Failed to load reasons');
            
            const reasons = await response.json();
            const select = this.elements.form.inputs.reason;
            
            if (select) {
                select.innerHTML = '<option value="">Select a reason</option>' +
                    reasons.map(reason => 
                        `<option value="${String(reason.id)}">${this.escapeHtml(reason.description)}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to load reasons:', error);
            this.showMessage('Failed to load reasons list', 'error');
        }
    }

    handleDataLoaded(accounts) {
        if (!accounts?.length) {
            this.toggleView(false);
            return;
        }

        const $tableBody = $(this.elements.tableBody);
        if ($tableBody.length) {
            $tableBody.html(accounts.map(this.createAccountRow.bind(this)).join(''));
            this.toggleView(true);
        } else {
            console.error('Table body element not found');
            this.showMessage('Failed to update table content', 'error');
        }
    }

    createAccountRow(account) {
        const id = String(account.id);
        return `
            <tr data-id="${id}">
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

    createActionButtons(account) {
        const id = String(account.id);
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-account="${this.escapeHtml(account.account)}"
                    data-reason-id="${String(account.reasonId)}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    data-account="${this.escapeHtml(account.account)}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    showModal(id = null) {
        this.resetForm();
        this.elements.form.inputs.id.value = id;
        this.elements.modal.label.textContent = id ? 'Edit Account' : 'Add Account';
        $(this.elements.modal.container).modal('show');
    }

    editAccount(id, account, reasonId) {
        this.showModal(id);
        this.elements.form.inputs.id.value = id;
        this.elements.form.inputs.account.value = account;
        this.elements.form.inputs.reason.value = reasonId;
    }

    async saveAccount() {
        if (!this.validateForm()) return;

        const id = this.elements.form.inputs.id.value;
        const data = this.getFormData();
        
        try {
            const response = await fetch(
                id ? `/undeliverable-report/api/accounts/${id}` : '/undeliverable-report/api/accounts', 
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
            this.showMessage(`Account ${id ? 'updated' : 'created'} successfully`);
            await this.loadData();
        } catch (error) {
            console.error('Error:', error);
            this.showMessage(`Failed to ${id ? 'update' : 'create'} account: ${error}`, 'error');
        }
    }

    async deleteAccount(id) {
        if (!id || !confirm('Are you sure you want to delete this account?')) return;

        try {
            const response = await fetch(`/undeliverable-report/api/accounts/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw await response.text();
            
            this.showMessage('Account deleted successfully');
            await this.loadData();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showMessage('Failed to delete account: ' + error, 'error');
        }
    }

    async showOperationLogs(id, account) {
        if (!id) return;
        
        try {
            const response = await fetch(`/undeliverable-report/api/accounts/${id}/logs`);
            if (!response.ok) throw new Error(await response.text());
            
            const logs = await response.json();
            
            const $logModal = $(this.elements.logs.modal);
            const $logLabel = $(this.elements.logs.label);
            const $logTimeline = $(this.elements.logs.timeline);

            $logLabel.text(`Operation Logs - Account: ${account}`);
            
            if (!logs || logs.length === 0) {
                $logTimeline.html(this.getEmptyLogsHtml());
            } else {
                $logTimeline.html(this.getTimelineHtml(logs));
            }

            $logModal.modal('show');
        } catch (error) {
            console.error('Error loading logs:', error);
            this.showMessage('Failed to load operation logs: ' + error.message, 'error');
        }
    }

    getEmptyLogsHtml() {
        return `
            <div class="time-label">
                <span class="bg-secondary">No Logs</span>
            </div>
            <div>
                <i class="fas fa-info bg-info"></i>
                <div class="timeline-item">
                    <h3 class="timeline-header">No operation logs found</h3>
                </div>
            </div>
        `;
    }

    getTimelineHtml(logs) {
        const groupedLogs = this.groupLogsByDate(logs);
        let html = '';
        
        Object.keys(groupedLogs).sort().reverse().forEach(date => {
            html += `
                <div class="time-label">
                    <span class="bg-primary">${date}</span>
                </div>
            `;

            groupedLogs[date].forEach(log => {
                const time = new Date(log.createdAt).toLocaleTimeString();
                html += `
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

        html += `
            <div>
                <i class="fas fa-clock bg-gray"></i>
            </div>
        `;

        return html;
    }

    resetForm() {
        const form = this.elements.form.container;
        form.reset();
        this.elements.form.inputs.id.value = '';
        $(form).validate().resetForm();
        $(form).find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $(form).find('.invalid-feedback').hide();
    }

    toggleView(hasAccounts) {
        const $table = $(this.elements.table);
        const $emptyState = $(this.elements.states.empty);

        if ($table.length) {
            $table.toggle(hasAccounts);
        }
        
        if ($emptyState.length) {
            $emptyState.toggle(!hasAccounts);
        }
    }

    validateForm() {
        return $(this.elements.form.container).valid();
    }

    getFormData() {
        return {
            id: this.elements.form.inputs.id.value || null,
            account: this.elements.form.inputs.account.value,
            reasonId: this.elements.form.inputs.reason.value
        };
    }

    initFormValidation() {
        $(this.elements.form.container).validate({
            rules: {
                account: {
                    required: true,
                    minlength: 3,
                    maxlength: 100
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
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: element => $(element).addClass('is-invalid'),
            unhighlight: element => $(element).removeClass('is-invalid'),
            success: element => {
                $(element).remove();
            }
        });

        // 添加实时验证
        const accountInput = this.elements.form.inputs.account;
        if (accountInput) {
            accountInput.addEventListener('input', e => {
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

    getOperationTypeClass(type) {
        const classes = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'danger'
        };
        return classes[type] || 'secondary';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accountPage = new AccountMaintenancePage();
}); 