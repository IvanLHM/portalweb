/**
 * Reason Maintenance Page Class
 */
class ReasonMaintenancePage extends BasePage {
    // Private Configuration
    static #config = {
        modal: {
            addTitle: 'Add Reason',
            editTitle: 'Edit Reason',
            deleteConfirm: 'Are you sure you want to delete this reason?'
        },
        validation: {
            rules: {
                description: {
                    required: true,
                    minlength: 3,
                    maxlength: 200
                }
            },
            messages: {
                description: {
                    required: "Please enter reason description",
                    minlength: "Description must be at least 3 characters",
                    maxlength: "Description cannot exceed 200 characters"
                }
            }
        }
    };

    // Private Selectors
    static #selectors = {
        table: '#reasonTable',
        modal: {
            container: '#reasonModal',
            label: '#reasonModalLabel'
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
        this.debouncedSave = this.debounce(this.saveReason.bind(this), 300);
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
        let current = ReasonMaintenancePage.#selectors;

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
        this.elements.buttons?.save?.addEventListener('click', () => this.debouncedSave());
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
                        url: '/reasons-maintenance/list',
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
                        data: 'id',
                        className: 'text-center'
                    },
                    { 
                        data: 'description'
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
                                            onclick="window.reasonPage.editReason(${data.id}, '${self.escapeHtml(data.description)}')">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-btn" 
                                            data-toggle="tooltip" data-placement="top" title="Delete"
                                            onclick="window.reasonPage.deleteReason(${data.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="btn btn-primary btn-sm logs-btn" 
                                            data-toggle="tooltip" data-placement="top" title="Operation Logs"
                                            onclick="window.reasonPage.showOperationLogs(${data.id}, ${data.id})">
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

    initFormValidation() {
        $(this.elements.form.container).validate({
            rules: ReasonMaintenancePage.#config.validation.rules,
            messages: ReasonMaintenancePage.#config.validation.messages,
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: element => $(element).addClass('is-invalid'),
            unhighlight: element => $(element).removeClass('is-invalid'),
            submitHandler: (form, event) => {
                event.preventDefault();
                this.saveReason();
            }
        });

        const descInput = this.elements.form.inputs.description;
        if (descInput) {
            descInput.addEventListener('input', e => {
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

    async saveReason() {
        if (!this.validateForm()) return;

        const overlay = this.showLoading('Saving reason...');
        const id = this.elements.form.inputs.id.value;
        const data = this.getFormData();
        
        try {
            const response = await fetch(
                id ? `/reasons-maintenance/${id}` : '/reasons-maintenance', 
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
            this.dataTable.ajax.reload();
        } catch (error) {
            console.error('Error:', error);
            this.showMessage(`Failed to ${id ? 'update' : 'create'} reason: ${error}`, 'error');
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
            description: this.elements.form.inputs.description.value
        };
    }

    showModal(id = null) {
        this.resetForm();
        this.elements.form.inputs.id.value = id;
        this.elements.modal.label.textContent = id ? 
            ReasonMaintenancePage.#config.modal.editTitle : 
            ReasonMaintenancePage.#config.modal.addTitle;
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

    async deleteReason(id) {
        if (!id || !confirm(ReasonMaintenancePage.#config.modal.deleteConfirm)) return;

        const overlay = this.showLoading('Deleting reason...');
        try {
            const response = await fetch(`/reasons-maintenance/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw await response.text();
            
            this.showMessage('Reason deleted successfully');
            this.dataTable.ajax.reload();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showMessage('Failed to delete reason: ' + error, 'error');
        } finally {
            this.hideLoading(overlay);
        }
    }

    editReason(id, description) {
        this.showModal(id);
        this.elements.form.inputs.description.value = description;
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async showOperationLogs(id, description) {
        if (!id) return;
        
        const overlay = this.showLoading('Loading logs...');
        try {
            const response = await fetch(`/reasons-maintenance/${id}/logs`);
            if (!response.ok) throw new Error(await response.text());
            
            const logs = await response.json();
            
            const $logModal = $(this.elements.logs.modal);
            const $logLabel = $(this.elements.logs.label);
            const $logTimeline = $(this.elements.logs.timeline);

            $logLabel.text(`Operation Logs - Reason: ${description}`);
            
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.reasonPage = new ReasonMaintenancePage();
}); 