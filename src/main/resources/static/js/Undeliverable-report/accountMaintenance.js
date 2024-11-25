/**
 * 账户维护页面类
 */
class AccountMaintenancePage extends BasePage {
    constructor() {
        super();
        this.$accountTable = $('#accountTable');
        this.initializeEvents();
        this.initFormValidation();
        this.loadData();
        this.loadReasonsList();
    }

    initializeEvents() {
        $(document).off('click', '#addAccountBtn')
                  .off('click', '#saveAccountBtn')
                  .off('click', '.edit-btn')
                  .off('click', '.delete-btn')
                  .off('click', '.logs-btn')
                  .off('hidden.bs.modal', '#accountModal');
        
        $(document)
            .on('click', '#addAccountBtn', () => {
                console.log('Add button clicked');
                this.showModal();
            })
            .on('click', '#saveAccountBtn', () => {
                console.log('Save button clicked');
                this.saveAccount();
            })
            .on('click', '.edit-btn', e => {
                const $btn = $(e.currentTarget);
                this.editAccount(
                    $btn.attr('data-id'),
                    $btn.attr('data-account'),
                    $btn.attr('data-reason-id')
                );
            })
            .on('click', '.delete-btn', e => {
                e.preventDefault();
                const id = $(e.currentTarget).attr('data-id');
                if (id) {
                    this.deleteAccount(String(id));
                }
            })
            .on('click', '.logs-btn', e => {
                const $btn = $(e.currentTarget);
                this.showOperationLogs(
                    $btn.attr('data-id'),
                    $btn.attr('data-account')
                );
            })
            .on('hidden.bs.modal', '#accountModal', () => this.resetForm());

        console.log('Events initialized');
    }

    validateForm() {
        return $('#accountForm').valid();
    }

    getFormData() {
        return {
            id: $('#accountId').val() ? String($('#accountId').val()) : null,
            account: $('#account').val(),
            reasonId: String($('#reason').val())
        };
    }

    getCurrentId() {
        return $('#accountId').val();
    }

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
            errorClass: 'invalid-feedback'
        });
    }

    loadReasonsList() {
        $.ajax({
            url: '/undeliverable-report/api/reasons',
            type: 'GET',
            success: reasons => {
                const $select = $('#reason');
                $select.empty().append('<option value="">Select a reason</option>');
                reasons?.forEach(reason => {
                    $select.append(`
                        <option value="${String(reason.id)}">
                            ${this.escapeHtml(reason.description)}
                        </option>
                    `);
                });
            },
            error: xhr => this.showMessage('Failed to load reasons', 'danger')
        });
    }

    handleDataLoaded(accounts) {
        if (!accounts || accounts.length === 0) {
            this.toggleView(false);
            return;
        }

        const $tbody = $('#accountTableBody');
        $tbody.empty();
        $tbody.html(accounts.map(account => this.createAccountRow(account)).join(''));
        this.toggleView(true);
    }

    createAccountRow(account) {
        return `
            <tr data-id="${account.id}">
                <td>${this.escapeHtml(account.account)}</td>
                <td>${this.escapeHtml(account.description || '')}</td>
                <td>${this.formatDate(account.lastUpdate)}</td>
                <td>
                    <div class="btn-group">
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
                    </div>
                </td>
            </tr>
        `;
    }

    loadData() {
        console.log('Loading account data...');
        $.ajax({
            url: '/undeliverable-report/api/accounts',
            type: 'GET',
            success: accounts => {
                console.log('Accounts loaded:', accounts);
                this.handleDataLoaded(accounts);
            },
            error: xhr => {
                console.error('Failed to load accounts:', xhr);
                this.showMessage('Failed to load accounts', 'danger');
            }
        });
    }

    showModal(id = null) {
        this.resetForm();
        $('#accountId').val(id);
        $('#accountModalLabel').text(id ? 'Edit Account' : 'Add Account');
        $('#accountModal').modal('show');
    }

    editAccount(id, account, reasonId) {
        this.showModal(id);
        $('#accountId').val(id);
        $('#account').val(account);
        $('#reason').val(reasonId);
    }

    saveAccount() {
        if (!this.validateForm()) return;

        const id = $('#accountId').val();
        const data = this.getFormData();

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
                this.showMessage(`Failed to ${id ? 'update' : 'create'} account: ${errorMessage}`, 'danger');
            }
        });
    }

    deleteAccount(id) {
        if (!id) return;
        
        if (!confirm('Are you sure you want to delete this account?')) return;

        const url = `/undeliverable-report/api/accounts/${String(id)}`;
        
        $.ajax({
            url,
            type: 'DELETE',
            success: () => {
                this.showMessage('Account deleted successfully');
                this.loadData();
            },
            error: xhr => {
                console.error('Delete failed:', xhr);
                this.showMessage('Failed to delete account: ' + (xhr.responseText || 'Unknown error'), 'danger');
            },
            complete: () => {
                this.loadData();
            }
        });
    }

    resetForm() {
        const $form = $('#accountForm');
        $form[0].reset();
        $('#accountId').val('');
        $form.validate().resetForm();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').hide();
    }

    toggleView(hasAccounts) {
        $('#accountTable').toggle(hasAccounts);
        $('#emptyState').toggle(!hasAccounts);
    }

    createActionButtons(account) {
        const id = String(account.id);
        return `
            <button class="btn btn-sm btn-info edit-btn" 
                    data-id="${id}" 
                    data-account="${this.escapeHtml(account.account)}"
                    data-reason-id="${String(account.reasonId)}"
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
                    data-account="${this.escapeHtml(account.account)}"
                    title="Operation Logs">
                <i class="fas fa-list-alt"></i>
            </button>
        `;
    }

    showOperationLogs(id, account) {
        $.ajax({
            url: `/undeliverable-report/api/accounts/${id}/logs`,
            type: 'GET',
            success: logs => {
                $('#logModalLabel').text(`Operation Logs - Account: ${account}`);
                this.renderTimeline(logs);
                $('#logModal').modal('show');
            },
            error: xhr => {
                console.error('Error:', xhr);
                this.showMessage('Failed to load operation logs', 'danger');
            }
        });
    }

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

$(document).ready(() => {
    console.log('Initializing AccountMaintenancePage');
    window.accountPage = new AccountMaintenancePage();
}); 