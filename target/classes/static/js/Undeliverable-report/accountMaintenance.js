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
        table: '#accountTable',
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
        this.initDataTable();
        this.loadReasonsList();
        this.bindEvents();
    }

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
        this.elements.buttons?.add?.addEventListener('click', () => this.showModal());
        this.elements.buttons?.save?.addEventListener('click', () => this.saveAccount());
        this.elements.modal?.container?.addEventListener('hidden.bs.modal', () => this.resetForm());
    }

    initDataTable() {
        try {
            const self = this;
            
            // 如果已经初始化过，先销毁
            if (this.dataTable) {
                this.dataTable.destroy();
                this.dataTable = null;
            }

            // 重新初始化 DataTable
            this.dataTable = $(this.elements.table).DataTable({
                destroy: true,
                responsive: true,
                lengthChange: true,
                autoWidth: false,
                serverSide: true,
                processing: true,
                searching: false,
                ordering: false,
                pageLength: 10,
                lengthMenu: [10, 25, 50, 100],
                displayStart: 0,
                stateSave: false,
                deferRender: true,
                dom: '<"row"<"col-sm-12"tr>>' +
                     '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"p>>',
                ajax: function(data, callback, settings) {
                    $.ajax({
                        url: '/account-maintenance/list',
                        type: 'GET',
                        data: {
                            draw: data.draw,
                            start: data.start,
                            length: data.length
                        },
                        success: function(res) {
                            callback(res);
                        },
                        error: function(xhr, error, thrown) {
                            self.showMessage('Failed to load data: ' + error, 'error');
                        }
                    });
                },
                columns: [
                    { 
                        data: 'accountNo',
                        className: 'text-center'
                    },
                    { 
                        data: 'reasonDescription',
                        render: function(data) {
                            return data || '-';
                        }
                    },
                    { 
                        data: 'lastModifiedTime',
                        className: 'text-center',
                        render: function(data) {
                            return data ? `<span class="badge badge-success">${data}</span>` : '-';
                        }
                    },
                    {
                        data: null,
                        className: 'text-center',
                        render: function(data) {
                            return `
                                <div class="btn-group">
                                    <button class="btn btn-info btn-sm edit-btn" 
                                            data-toggle="tooltip" data-placement="top" title="Edit"
                                            onclick="window.accountPage.editAccount(${data.id}, '${self.escapeHtml(data.accountNo)}', ${data.reasonId})">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-btn" 
                                            data-toggle="tooltip" data-placement="top" title="Delete"
                                            onclick="window.accountPage.deleteAccount(${data.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="btn btn-primary btn-sm logs-btn" 
                                            data-toggle="tooltip" data-placement="top" title="Operation Logs"
                                            onclick="window.accountPage.showOperationLogs(${data.id}, '${self.escapeHtml(data.accountNo)}')">
                                        <i class="fas fa-history"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                language: {
                    emptyTable: "No data available",
                    info: "Showing _START_ to _END_ of _TOTAL_ entries",
                    infoEmpty: "Showing 0 to 0 of 0 entries",
                    lengthMenu: "Show _MENU_ entries",
                    loadingRecords: "Loading...",
                    processing: "Processing...",
                    zeroRecords: "No matching records found",
                    paginate: {
                        first: "First",
                        last: "Last",
                        next: "Next",
                        previous: "Previous"
                    }
                },
                drawCallback: function(settings) {
                    $('[data-toggle="tooltip"]').tooltip();
                }
            });

            // 监听分页事件
            this.dataTable.on('page.dt', function() {
                $('[data-toggle="tooltip"]').tooltip('dispose');
            });

            // 监听长度改变事件
            this.dataTable.on('length.dt', function() {
                $('[data-toggle="tooltip"]').tooltip('dispose');
            });
        } catch (error) {
            console.error('Error initializing DataTable:', error);
            this.showMessage('Failed to initialize table: ' + error, 'error');
        }
    }

    async loadReasonsList() {
        const overlay = this.showLoading('Loading reasons...');
        try {
            const response = await fetch('/reasons-maintenance/list?draw=1&start=0&length=1000');
            if (!response.ok) throw new Error('Failed to load reasons');
            
            const result = await response.json();
            const reasons = result.data || [];
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

    initFormValidation() {
        $(this.elements.form.container).validate({
            rules: AccountMaintenancePage.#config.validation.rules,
            messages: AccountMaintenancePage.#config.validation.messages,
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: element => $(element).addClass('is-invalid'),
            unhighlight: element => $(element).removeClass('is-invalid')
        });
    }

    async saveAccount() {
        try {
            if (!this.validateForm()) return;

            const overlay = this.showLoading('Saving account...');
            const id = this.elements.form.inputs.id.value;
            const data = this.getFormData();
            
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // 先关闭等待层
            this.hideLoading(overlay);
            
            // 关闭模态框
            $(this.elements.modal.container).modal('hide');
            
            // 显示成功消息
            this.showMessage(`Account ${id ? 'updated' : 'created'} successfully`);
            
            // 等待模态框完全关闭后再刷新数据
            setTimeout(() => {
                if (this.dataTable) {
                    this.dataTable.ajax.reload(null, false);
                }
            }, 300);

        } catch (error) {
            if (overlay) {
                this.hideLoading(overlay);
            }
            console.error('Error:', error);
            this.showMessage(`Failed to ${id ? 'update' : 'create'} account: ${error}`, 'error');
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
        
        // 确保原因列表已加载
        this.loadReasonsList().then(() => {
            $(this.elements.modal.container).modal('show');
        }).catch(error => {
            console.error('Error loading reasons:', error);
            this.showMessage('Failed to load reasons list', 'error');
        });
    }

    resetForm() {
        const form = this.elements.form.container;
        form.reset();
        this.elements.form.inputs.id.value = '';
        $(form).validate().resetForm();
        $(form).find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    }

    editAccount(id, account, reasonId) {
        this.showModal(id);
        this.elements.form.inputs.account.value = account;
        this.elements.form.inputs.reason.value = String(reasonId);
        
        // 触发 change 事件以确保表单验证状态更新
        $(this.elements.form.inputs.reason).trigger('change');
    }

    async deleteAccount(id) {
        try {
            if (!id || !confirm(AccountMaintenancePage.#config.modal.deleteConfirm)) return;

            const overlay = this.showLoading('Deleting account...');
            
            const response = await fetch(`/account-maintenance/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            
            // 先关闭等待层
            this.hideLoading(overlay);
            
            // 显示成功消息
            this.showMessage('Account deleted successfully');
            
            // 刷新数据
            if (this.dataTable) {
                this.dataTable.ajax.reload(null, false);
            }
        } catch (error) {
            if (overlay) {
                this.hideLoading(overlay);
            }
            console.error('Delete failed:', error);
            this.showMessage('Failed to delete account: ' + error, 'error');
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

document.addEventListener('DOMContentLoaded', () => {
    window.accountPage = new AccountMaintenancePage();
}); 