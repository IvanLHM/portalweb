/**
 * 导入页面类
 */
class ImportPage extends BasePage {
    // 定义静态选择器配置
    static selectors = {
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
            fileLabel: '.custom-file-label',
            browseBtn: '#browseBtn',
            uploadBtn: '#uploadBtn',
            result: '#uploadResult',
            progress: {
                bar: '.progress-bar',
                container: '.progress'
            },
            stats: {
                fileName: '#resultFileName',
                totalLines: '#resultTotalLines',
                status: '#resultStatus',
                time: '#resultTime'
            }
        }
    };

    constructor() {
        super();
        this.container = document.querySelector('.content-wrapper');
        this.initElements();
        this.initDatePicker();
        this.initFileUpload();
        
        this.debouncedGenerate = this.debounce(this.generateData.bind(this), 300);
        
        this.bindEvents();
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
        initElementsRecursive(ImportPage.selectors, this.elements);
    }

    initDatePicker() {
        // 获取昨天的日期
        const yesterday = moment().subtract(1, 'days');
        // 获取30天前的日期
        const minDate = moment().subtract(30, 'days');
        
        $(this.elements.generate.dateInput).daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            locale: { format: 'YYYY-MM-DD' },
            startDate: yesterday,  // 默认选择昨天
            minDate: minDate,      // 最小日期：30天前
            maxDate: yesterday,    // 最大日期：昨天
        });
    }

    initFileUpload() {
        $('#fileInput').fileupload({
            url: '/undelivery-import/import-account',
            dataType: 'json',
            autoUpload: false,
            acceptFileTypes: /(\.|\/)(txt)$/i,
            maxFileSize: 5000000, // 5 MB
            
            // 添加文件时的处理
            add: (e, data) => {
                if (!this.validateFile(data.files[0])) return;
                
                // 更新文件名显示
                const fileName = data.files[0].name;
                $(e.target).siblings('.custom-file-label').text(fileName);
                
                // 显示文件信息
                $('.files').html(
                    `<p class="text-muted">Selected: ${fileName} (${this.formatFileSize(data.files[0].size)})</p>`
                );
                
                // 绑定上传按钮事件
                $('.start').off('click').on('click', () => {
                    data.submit();
                });
            },
            
            // 进度处理
            progress: (e, data) => {
                const progress = parseInt((data.loaded / data.total) * 100, 10);
                $('.progress-bar')
                    .css('width', progress + '%')
                    .attr('aria-valuenow', progress)
                    .text(progress + '%');
                
                $('.progress').show();
            },
            
            // 上传成功
            done: (e, data) => {
                this.showMessage('File uploaded successfully');
                this.updateUploadStats({ 
                    file: data.files[0], 
                    response: data.result 
                });
                $('.progress').hide();
                $('.files').empty();
                // 重置文件输入框显示
                $('.custom-file-label').text('Choose file...');
            },
            
            // 上传失败
            fail: (e, data) => {
                const error = data.jqXHR.responseText || 'Upload failed';
                this.handleUploadError(error, data.files[0]);
                $('.progress').hide();
            }
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    bindEvents() {
        // 生成报告相关事件
        this.elements.generate.button?.addEventListener('click', () => {
            this.debouncedGenerate(this.elements.generate.dateInput.value);
        });

        // 文件上传相关事件
        this.elements.upload.fileInput?.addEventListener('change', (e) => {
            const fileName = e.target.files?.[0]?.name ?? 'Choose file';
            const fileLabel = e.target.nextElementSibling;
            if (fileLabel) {
                fileLabel.textContent = fileName;
            }
        });

        // 修改 tab 切换事件
        $('a[data-toggle="pill"]').on('shown.bs.tab', (e) => {
            const targetId = $(e.target).attr('href');
            if (targetId === '#custom-tabs-one-general') {  // 切换到 Generate Statistics
                this.resetGenerateStats();
                // 设置日期为昨天
                if (this.elements.generate.dateInput) {
                    const yesterday = moment().subtract(1, 'days');
                    $(this.elements.generate.dateInput).data('daterangepicker').setStartDate(yesterday);
                }
            } else if (targetId === '#custom-tabs-one-upload') {  // 切换到 Upload
                this.resetUploadStats();
            }
        });
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

            const response = await fetch('/undelivery-import/generate-mobile-no', {
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

    async uploadFile() {
        const fileInput = this.elements.upload.fileInput;
        const file = fileInput?.files[0];
        if (!this.validateFile(file)) return;

        const formData = new FormData();
        formData.append('file', file);  // 确保参数名为 'file'

        try {
            await this.processUpload(formData, file);
        } catch (error) {
            console.error('Upload failed:', error);
            this.handleUploadError(error, file);
        }
    }

    validateFile(file) {
        if (!file) {
            this.showMessage('Please select a file', 'warning');
            return false;
        }
        if (!file.name.toLowerCase().endsWith('.txt')) {
            this.showMessage('Please select a txt file', 'warning');
            return false;
        }
        return true;
    }

    async processUpload(formData, file) {
        const button = this.elements.upload.uploadBtn;
        
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Uploading...';

            const response = await fetch('/undelivery-import/import-account', {
                method: 'POST',
                body: formData  // 直接使用 FormData 对象
            });

            if (!response.ok) throw await response.text();
            
            const data = await response.json();
            this.showMessage('File uploaded successfully');
            this.resetUploadForm();
            this.updateUploadStats({ file, response: data });

        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-upload mr-1"></i> Upload';
        }
    }

    resetUploadForm() {
        // 重置表单
        this.elements.upload.form.reset();
        
        // 更新文件标签文本
        const fileLabel = this.elements.upload.fileLabel;
        if (fileLabel) {
            fileLabel.textContent = 'Choose file';
        }
        
        // 隐藏进度条
        $(this.elements.upload.progress.container).hide();
        $(this.elements.upload.progress.bar)
            .css('width', '0%')
            .attr('aria-valuenow', 0)
            .text('0%');
    }

    updateUploadStats({ file, response = {}, error = '', isError = false }) {
        const { stats } = this.elements.upload;
        
        stats.fileName.textContent = file.name;
        stats.totalLines.textContent = isError ? '0' : response.totalLines;
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

    // 修改重置生成统计的方法
    resetGenerateStats() {
        const { stats } = this.elements.generate;
        if (stats) {
            stats.date.textContent = '-';
            stats.totalRecords.textContent = '-';
            stats.status.innerHTML = '-';
            stats.time.textContent = '-';
        }
        // 隐藏结果区域
        if (this.elements.generate.result) {
            this.elements.generate.result.style.display = 'none';
        }
        // 重置日期选择器为昨天
        if (this.elements.generate.dateInput) {
            const yesterday = moment().subtract(1, 'days');
            $(this.elements.generate.dateInput).data('daterangepicker').setStartDate(yesterday);
        }
    }

    // 添加重置上传统计的方法
    resetUploadStats() {
        const { stats } = this.elements.upload;
        stats.fileName.textContent = '-';
        stats.totalLines.textContent = '-';
        stats.status.innerHTML = '-';
        stats.time.textContent = '-';
        this.elements.upload.result.style.display = 'none';
        
        // 重置文件选择
        this.resetUploadForm();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.importPage = new ImportPage();
}); 