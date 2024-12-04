/**
 * 导入页面类
 */
class ImportPage extends BasePage {
    // 私有选择器配置
    static #selectors = {
        generate: {
            dateInput: '#dateInput',
            button: '#generateBtn',
            result: '#generateResult',
            stats: {
                date: '#generateDate',
                totalRecords: '#generateTotalRecords',
                status: '#generateStatus',
                time: '#generateTime'
            }
        },
        upload: {
            form: '#uploadForm',
            fileInput: '#fileInput',
            result: '#uploadResult',
            stats: {
                date: '#uploadDate',
                totalRecords: '#uploadTotalRecords',
                status: '#uploadStatus',
                time: '#uploadTime'
            }
        }
    };

    constructor() {
        super();
        this.container = document.querySelector('.content-wrapper');
        this.elements = this.initElements();
        this.initDatePicker();
        this.initFileUpload();
        this.debouncedGenerate = this.debounce(this.generateData.bind(this), 300);
        this.bindEvents();
    }

    // 使用代理模式初始化元素
    initElements() {
        const cache = new Map();

        const createProxy = (path = '') => {
            return new Proxy({}, {
                get: (target, prop) => {
                    const fullPath = path ? `${path}.${prop}` : prop;
                    
                    // 如果已经缓存了元素，直接返回
                    if (cache.has(fullPath)) {
                        return cache.get(fullPath);
                    }

                    // 获取选择器
                    const selector = this.getSelector(fullPath);
                    if (!selector) return undefined;

                    // 如果是对象，返回新的代理
                    if (typeof selector === 'object') {
                        const nestedProxy = createProxy(fullPath);
                        cache.set(fullPath, nestedProxy);
                        return nestedProxy;
                    }

                    // 查找并缓存元素
                    const element = this.container.querySelector(selector);
                    cache.set(fullPath, element);
                    return element;
                }
            });
        };

        return createProxy();
    }

    // 获取选择器
    getSelector(path) {
        const parts = path.split('.');
        let current = ImportPage.#selectors;

        for (const part of parts) {
            if (!current || typeof current !== 'object') {
                return null;
            }
            current = current[part];
        }

        return current;
    }

    initDatePicker() {
        const yesterday = moment().subtract(1, 'days');
        const minDate = moment().subtract(30, 'days');
        
        laydate.render({
            elem: this.elements.generate.dateInput,
            type: 'date',
            format: 'yyyy-MM-dd',
            value: yesterday.format('YYYY-MM-DD'),
            min: minDate.format('YYYY-MM-DD'),
            max: yesterday.format('YYYY-MM-DD'),
            trigger: 'click',
            theme: '#1890ff'
        });
    }

    initFileUpload() {
        $("#fileInput").fileinput({
            theme: 'fa5',
            language: 'en',
            uploadUrl: '/margin-trade-limit/import',
            allowedFileExtensions: ['txt'],
            maxFileSize: 5000,
            showClose: false,
            showCaption: true,
            showBrowse: true,
            showUpload: true,
            showRemove: true,
            showCancel: false,
            browseClass: 'btn btn-primary',
            uploadClass: 'btn btn-info',
            removeClass: 'btn btn-danger',
            browseLabel: 'Browse',
            uploadLabel: 'Upload',
            removeLabel: 'Clear',
            browseIcon: '<i class="fas fa-folder-open"></i> ',
            uploadIcon: '<i class="fas fa-upload"></i> ',
            removeIcon: '<i class="fas fa-trash"></i> ',
            uploadAsync: true,
            minFileCount: 1,
            maxFileCount: 1,
            msgNoFilesSelected: 'No file selected',
            msgFilesTooMany: 'Number of files selected for upload ({n}) exceeds maximum allowed limit of {m}.'
        }).on('fileuploaded', (event, data) => {
            this.showMessage('File uploaded successfully');
            this.updateUploadStats({ 
                file: data.files[0], 
                response: data.response 
            });
        });
    }

    bindEvents() {
        // 使用可选链和代理
        this.elements.generate?.button?.addEventListener('click', () => {
            this.debouncedGenerate(this.elements.generate.dateInput.value);
        });

        $('a[data-toggle="pill"]').on('shown.bs.tab', (e) => {
            const targetId = $(e.target).attr('href');
            if (targetId === '#custom-tabs-one-general') {
                this.resetGenerateStats();
            } else if (targetId === '#custom-tabs-one-upload') {
                this.resetUploadStats();
            }
        });
    }

    resetGenerateStats() {
        const { stats } = this.elements.generate;
        if (stats) {
            stats.date.textContent = '-';
            stats.totalRecords.textContent = '-';
            stats.status.innerHTML = '-';
            stats.time.textContent = '-';
        }

        const result = this.elements.generate.result;
        if (result) {
            result.style.display = 'none';
        }

        const dateInput = this.elements.generate.dateInput;
        if (dateInput) {
            const yesterday = moment().subtract(1, 'days');
            dateInput.value = yesterday.format('YYYY-MM-DD');
        }
    }

    resetUploadStats() {
        const { stats } = this.elements.upload;
        if (stats) {
            stats.date.textContent = '-';
            stats.totalRecords.textContent = '-';
            stats.status.innerHTML = '-';
            stats.time.textContent = '-';
        }
        
        if (this.elements.upload.result) {
            this.elements.upload.result.style.display = 'none';
        }
        
        if (this.elements.upload.form) {
            this.elements.upload.form.reset();
        }
    }

    // 添加防抖方法
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

    async generateData(date) {
        const button = this.elements.generate.button;
        const result = this.elements.generate.result;
        
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generating...';
            result.style.display = 'none';

            const response = await fetch('/margin-trade-limit/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `date=${date}`
            });

            if (!response.ok) throw await response.text();
            
            const data = await response.json();
            this.showMessage('Data generated successfully');
            this.updateGenerateStats({ date, response: data });
            
        } catch (error) {
            console.error('Generate failed:', error);
            this.showMessage(`Failed to generate data: ${error}`, 'error');
            this.updateGenerateStats({ 
                date, 
                error: error.toString(),
                isError: true 
            });
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-file-alt mr-1"></i> General Report';
            result.style.display = 'block';
        }
    }

    updateGenerateStats({ date, response = {}, error = '', isError = false }) {
        const { stats } = this.elements.generate;
        
        stats.date.textContent = date;
        stats.totalRecords.textContent = isError ? '0' : response.totalRecords;
        stats.status.innerHTML = this.getStatusHtml(isError, error);
        stats.time.textContent = new Date().toLocaleString();
    }

    updateUploadStats({ file, response = {}, error = '', isError = false }) {
        const { stats } = this.elements.upload;
        
        stats.date.textContent = new Date().toLocaleDateString();
        stats.totalRecords.textContent = isError ? '0' : response.totalRecords;
        stats.status.innerHTML = this.getStatusHtml(isError, error);
        stats.time.textContent = new Date().toLocaleString();

        this.elements.upload.result.style.display = 'block';
    }

    handleUploadError(error, file) {
        this.showMessage(`Failed to upload file: ${error}`, 'error');
        this.updateUploadStats({ 
            file, 
            error: error.toString(),
            isError: true 
        });
    }

    getStatusHtml(isError, errorMessage = '') {
        return isError 
            ? `<span class="badge badge-danger">Failed</span>
               <small class="text-danger ml-2">${this.escapeHtml(errorMessage)}</small>`
            : '<span class="badge badge-success">Success</span>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.importPage = new ImportPage();
}); 