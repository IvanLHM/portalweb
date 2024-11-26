class ImportPage extends BasePage {
    constructor() {
        super();
        this.initDatePicker();
        this.initFileUpload();
        this.initEvents();
    }

    initDatePicker() {
        $('#dateInput').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });
    }

    initFileUpload() {
        // 点击Browse按钮时触发文件选择
        $('#browseBtn').click(() => {
            $('#fileInput').click();
        });

        // 文件选择后更新显示
        $('#fileInput').change(e => {
            const fileName = e.target.files[0]?.name || 'Choose file';
            $(e.target).prev('.input-group').find('input').val(fileName);
        });
    }

    initEvents() {
        // Generate Data按钮事件
        $('#generateBtn').click(() => {
            const date = $('#dateInput').val();
            this.generateData(date);
        });

        // 文件上传表单提交事件
        $('#uploadForm').submit((e) => {
            e.preventDefault();
            this.uploadFile();
        });
    }

    generateData(date) {
        const $btn = $('#generateBtn');
        const $result = $('#generateResult');
        
        $btn.prop('disabled', true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i> Generating...');
        
        $result.hide();

        $.ajax({
            url: '/undelivery-import/generate-mobile-no',
            type: 'POST',
            data: { date: date },
            success: (response) => {
                this.showMessage('Data generated successfully');
                
                // 更新统计表格
                $('#generateDate').text(date);
                $('#generateTotalRecords').text(response.totalRecords);
                $('#generateStatus').html('<span class="badge badge-success">Success</span>');
                $('#generateTime').text(new Date().toLocaleString());
                
                $result.show();
            },
            error: (xhr) => {
                this.showMessage('Failed to generate data: ' + xhr.responseText, 'danger');
                
                // 更新统计表格（错误状态）
                $('#generateDate').text(date);
                $('#generateTotalRecords').text('0');
                $('#generateStatus').html(`
                    <span class="badge badge-danger">Failed</span>
                    <small class="text-danger ml-2">${xhr.responseText}</small>
                `);
                $('#generateTime').text(new Date().toLocaleString());
                
                $result.show();
            },
            complete: () => {
                $btn.prop('disabled', false)
                    .html('<i class="fas fa-file-alt mr-1"></i> General Report');
            }
        });
    }

    uploadFile() {
        const fileInput = $('#fileInput')[0];
        if (!fileInput.files || !fileInput.files[0]) {
            this.showMessage('Please select a file', 'warning');
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith('.txt')) {
            this.showMessage('Please select a txt file', 'warning');
            return;
        }

        const $btn = $('#uploadBtn');
        const $result = $('#uploadResult');
        
        $btn.prop('disabled', true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i> Uploading...');
        
        $result.hide();

        const formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: '/undelivery-import/import-account',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                this.showMessage('File uploaded successfully');
                $('#uploadForm')[0].reset();
                $('.input-group input').val('Choose file');
                
                // 更新统计表格
                $('#resultFileName').text(file.name);
                $('#resultTotalLines').text(response.totalLines);
                $('#resultStatus').html('<span class="badge badge-success">Success</span>');
                $('#resultTime').text(new Date().toLocaleString());
                
                $result.show();
            },
            error: (xhr) => {
                this.showMessage('Failed to upload file: ' + xhr.responseText, 'error');
                
                // 更新统计表格（错误状态）
                $('#resultFileName').text(file.name);
                $('#resultTotalLines').text('0');
                $('#resultStatus').html(`
                    <span class="badge badge-danger">Failed</span>
                    <small class="text-danger ml-2">${xhr.responseText}</small>
                `);
                $('#resultTime').text(new Date().toLocaleString());
                
                $result.show();
            },
            complete: () => {
                $btn.prop('disabled', false)
                    .html('<i class="fas fa-upload mr-1"></i> Upload');
            }
        });
    }
}

// 初始化页面
$(document).ready(() => {
    window.importPage = new ImportPage();
}); 