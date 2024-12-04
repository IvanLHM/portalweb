/**
 * 原因维护页面类
 */
class ReasonMaintenancePage extends BasePage {
    // 私有配置
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

    // 私有选择器
    static #selectors = {
        table: {
            container: '#reasonTable',
            body: '#reasonTableBody'
        },
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
        this.debouncedSave = this.debounce(this.saveReason.bind(this), 300);
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
                const description = target.dataset.description;
                this.editReason(id, description);
            } else if (target.classList.contains('delete-btn')) {
                e.preventDefault();
                this.deleteReason(id);
            } else if (target.classList.contains('logs-btn')) {
                this.showOperationLogs(id, id);
            }
        } catch (error) {
            console.error('Error handling table action:', error);
            this.showMessage('An error occurred while processing your request', 'error');
        }
    }

    async loadData() {
        const overlay = this.showLoading('Loading reasons...');
        try {
            const response = await fetch('/reasons-maintenance/list');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const reasons = await response.json();
            this.handleDataLoaded(reasons);
        } catch (error) {
            console.error('Failed to load reasons:', error);
            this.showMessage('Failed to load reasons', 'error');
        } finally {
            this.hideLoading(overlay);
        }
    }

    handleDataLoaded(reasons) {
        const hasReasons = reasons?.length > 0;
        this.toggleView(hasReasons);

        if (hasReasons) {
            // 按照 id 排序
            const sortedReasons = reasons.sort((a, b) => a.id - b.id);
            const html = sortedReasons.map(this.createReasonRow.bind(this)).join('');
            this.elements.table.body.innerHTML = html;
        }
    }

    createReasonRow(reason) {
        return `
            <tr data-id="${reason.id}">
                <td style="width: 80px;" class="text-center">${reason.id}</td>
                <td>${this.escapeHtml(reason.description)}</td>
                <td style="width: 180px;" class="text-center">${reason.lastModifiedTime || '-'}</td>
                <td style="width: 120px;" class="text-center">
                    <div class="btn-group">
                        ${this.createActionButtons(reason)}
                    </div>
                </td>
            </tr>
        `;
    }

    createActionButtons(reason) {
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

        // 添加实时验证
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
            await this.loadData();
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

    toggleView(hasReasons) {
        $(this.elements.table.container).toggle(hasReasons);
        $(this.elements.states.empty).toggle(!hasReasons);
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
            await this.loadData();
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

    /**
     * 防抖函数
     * @param {Function} func 需要防抖的函数
     * @param {number} wait 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
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