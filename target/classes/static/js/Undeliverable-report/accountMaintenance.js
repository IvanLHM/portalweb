/**
 * 账户维护页面类
 */
class AccountMaintenancePage extends BasePage {
    // 私有配置
    static #config = {
        modal: {
            addTitle: 'Add Account',
            editTitle: 'Edit Account',
            deleteConfirm: 'Are you sure you want to delete this account?'
        },
        validation: {
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
            }
        }
    };

    // 私有选择器
    static #selectors = {
        table: {
            container: '#accountTable',
            body: '#accountTableBody'
        },
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
        this.elements = this.initElements();
        this.initFormValidation();
        this.loadData();
        this.loadReasonsList();
        this.debouncedSave = this.debounce(this.saveAccount.bind(this), 300);
        this.bindEvents();
    }

    // 使用代理模式初始化元素
    initElements() {
        const cache = new Map();

        const createProxy = (path = '') => {
            return new Proxy({}, {
                get: (target, prop) => {
                    const fullPath = path ? `${path}.${prop}` : prop;
                    
                    if (cache.has(fullPath)) {
                        return cache.get(fullPath);
                    }

                    const selector = this.getSelector(fullPath);
                    if (!selector) return undefined;

                    if (typeof selector === 'object') {
                        const nestedProxy = createProxy(fullPath);
                        cache.set(fullPath, nestedProxy);
                        return nestedProxy;
                    }

                    const element = this.container.querySelector(selector);
                    cache.set(fullPath, element);
                    return element;
                }
            });
        };

        return createProxy();
    }

    getSelector(path) {
        const parts = path.split('.');
        let current = AccountMaintenancePage.#selectors;

        for (const part of parts) {
            if (!current || typeof current !== 'object') {
                return null;
            }
            current = current[part];
        }

        return current;
    }

    bindEvents() {
        // 静态事件
        this.elements.buttons?.add?.addEventListener('click', () => this.showModal());
        this.elements.buttons?.save?.addEventListener('click', () => this.debouncedSave());
        this.elements.modal?.container?.addEventListener('hidden.bs.modal', () => this.resetForm());

        // 动态事件
        this.elements.table?.body?.addEventListener('click', e => this.handleTableAction(e));
    }

    handleTableAction(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const tr = target.closest('tr');
        if (!tr) return;

        const id = tr.dataset.id;
        if (!id) return;

        try {
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
        const overlay = this.showLoading('Loading accounts...');
        try {
            const response = await fetch('/account-maintenance/list');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const accounts = await response.json();
            this.handleDataLoaded(accounts);
        } catch (error) {
            console.error('Failed to load accounts:', error);
            this.showMessage('Failed to load accounts', 'error');
        } finally {
            this.hideLoading(overlay);
        }
    }

    async loadReasonsList() {
        const overlay = this.showLoading('Loading reasons...');
        try {
            const response = await fetch('/reasons/list');
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
        } finally {
            this.hideLoading(overlay);
        }
    }

    handleDataLoaded(accounts) {
        const hasAccounts = accounts?.length > 0;
        this.toggleView(hasAccounts);

        if (hasAccounts) {
            const html = accounts.map(this.createAccountRow.bind(this)).join('');
            this.elements.table.body.innerHTML = html;
        }
    }

    createAccountRow(account) {
        return `
            <tr data-id="${account.id}">
                <td>${this.escapeHtml(account.accountNo)}</td>
                <td>${this.escapeHtml(account.reasonDescription || '-')}</td>
                <td>${account.lastModifiedTime || '-'}</td>
                <td>
                    <div class="btn-group">
                        ${this.createActionButtons(account)}
                    </div>
                </td>
            </tr>
        `;
    }

    createActionButtons(account) {
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-account="${this.escapeHtml(account.accountNo)}"
                    data-reason-id="${String(account.reasonId)}"
                    title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" 
                    title="Delete">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm btn-primary logs-btn" 
                    data-account="${this.escapeHtml(account.accountNo)}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
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
                    required: "Please enter account number",
                    minlength: "Account number must be at least 3 characters",
                    maxlength: "Account number cannot exceed 100 characters"
                },
                reason: {
                    required: "Please select a reason"
                }
            },
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: element => $(element).addClass('is-invalid'),
            unhighlight: element => $(element).removeClass('is-invalid')
        });
    }

    async saveAccount() {
        if (!this.validateForm()) return;

        const overlay = this.showLoading('Saving account...');
        const id = this.elements.form.inputs.id.value;
        const data = this.getFormData();
        
        try {
            const response = await fetch(
                id ? `/account-maintenance/${id}` : '/account-maintenance', 
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
        } finally {
            this.hideLoading(overlay);
        }
    }

    validateForm() {
        return $(this.elements.form.container).valid();
    }

    getFormData() {
        return {
            id: this.elements.form.inputs.id.value || null,
            accountNo: this.elements.form.inputs.account.value,
            reasonId: this.elements.form.inputs.reason.value
        };
    }

    showModal(id = null) {
        this.resetForm();
        this.elements.form.inputs.id.value = id;
        this.elements.modal.label.textContent = id ? 
            AccountMaintenancePage.#config.modal.editTitle : 
            AccountMaintenancePage.#config.modal.addTitle;
        $(this.elements.modal.container).modal('show');
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
        $(this.elements.table.container).toggle(hasAccounts);
        $(this.elements.states.empty).toggle(!hasAccounts);
    }

    editAccount(id, account, reasonId) {
        this.showModal(id);
        this.elements.form.inputs.account.value = account;
        this.elements.form.inputs.reason.value = reasonId;
    }

    async deleteAccount(id) {
        if (!id || !confirm(AccountMaintenancePage.#config.modal.deleteConfirm)) return;

        const overlay = this.showLoading('Deleting account...');
        try {
            const response = await fetch(`/account-maintenance/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw await response.text();
            
            this.showMessage('Account deleted successfully');
            await this.loadData();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showMessage('Failed to delete account: ' + error, 'error');
        } finally {
            this.hideLoading(overlay);
        }
    }

    async showOperationLogs(id, account) {
        if (!id) return;
        
        const overlay = this.showLoading('Loading logs...');
        try {
            const response = await fetch(`/account-maintenance/${id}/logs`);
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
        } finally {
            this.hideLoading(overlay);
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