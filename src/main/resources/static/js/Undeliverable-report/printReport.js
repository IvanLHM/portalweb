class PrintReportPage extends BasePage {
    // 私有配置
    static #config = {
        tableConfig: {
            searching: false,
            ordering: false,
            lengthChange: true,
            autoWidth: false,
            pageLength: 10,
            lengthMenu: [[10, 25, 50], [10, 25, 50]],
            processing: true,
            serverSide: true,
            dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-12 col-md-5"l><"col-sm-12 col-md-7"p>>',
            className: 'table table-hover table-bordered',
            columnDefs: [{
                targets: '_all',
                className: 'align-middle'
            }],
            drawCallback: function() {
                $(this).find('.dataTables_processing').hide();
            },
            language: {
                emptyTable: "No data available",
                processing: "Loading...",
                zeroRecords: "No matching records found"
            }
        }
    };

    // 私有选择器
    static #selectors = {
        sections: {
            welcome: '#welcome-section',
            report: '#report-section'
        },
        buttons: {
            generate: '#generateBtn',
            back: '#backBtn',
            print: '#printBtn',
            export: '#exportBtn'
        },
        tables: {
            table1: '#table1',
            table2: '#table2'
        }
    };

    constructor() {
        super();
        this.container = document.querySelector('.content-wrapper');
        this.elements = this.initElements();
        this.tables = {
            table1: null,
            table2: null
        };
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
        let current = PrintReportPage.#selectors;

        for (const part of parts) {
            if (!current || typeof current !== 'object') {
                return null;
            }
            current = current[part];
        }

        return current;
    }

    bindEvents() {
        this.elements.buttons?.generate?.addEventListener('click', () => this.generateReport());
        this.elements.buttons?.print?.addEventListener('click', () => this.printAllTables());
        this.elements.buttons?.export?.addEventListener('click', () => this.exportAllTables());
        this.elements.buttons?.back?.addEventListener('click', () => this.backToWelcome());
    }

    async generateReport() {
        try {
            const button = this.elements.buttons.generate;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';

            this.initTables();
            this.toggleView(true);

        } catch (error) {
            console.error('Failed to generate report:', error);
            this.showMessage('Failed to generate report: ' + error.message, 'error');
        } finally {
            const button = this.elements.buttons.generate;
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-file-alt mr-2"></i>Generate Report';
        }
    }

    toggleView(showReport) {
        if (showReport) {
            this.elements.sections.welcome.style.display = 'none';
            this.elements.sections.report.style.display = 'block';
        } else {
            this.elements.sections.welcome.style.removeProperty('display');
            this.elements.sections.report.style.display = 'none';
        }
    }

    initTables() {
        const commonAjaxConfig = {
            type: 'GET',
            data: function(d) {
                return {
                    pageNum: Math.floor(d.start / d.length) + 1,
                    pageSize: d.length
                };
            },
            dataSrc: function(json) {
                return json.data || [];
            },
            beforeSend: function() {
                $('.dataTables_processing').show();
            },
            complete: function() {
                $('.dataTables_processing').hide();
            }
        };

        const table1Config = {
            ...PrintReportPage.#config.tableConfig,
            ajax: {
                ...commonAjaxConfig,
                url: '/print-report/no-sms-report'
            },
            columns: [
                { data: 'secAccNo' },
                { data: 'secAccName' }
            ]
        };

        const table2Config = {
            ...PrintReportPage.#config.tableConfig,
            ajax: {
                ...commonAjaxConfig,
                url: '/print-report/un-customer-report'
            },
            columns: [
                { data: 'secAccNo' },
                { data: 'userNo' },
                { data: 'secAccName' },
                { data: 'telNo' }
            ]
        };

        this.tables.table1 = $(this.elements.tables.table1).DataTable(table1Config);
        this.tables.table2 = $(this.elements.tables.table2).DataTable(table2Config);
    }

    backToWelcome() {
        Object.values(this.tables).forEach(table => {
            if (table) {
                table.clear().destroy();
            }
        });
        this.tables = { table1: null, table2: null };
        this.toggleView(false);
    }

    async printAllTables() {
        try {
            // 显示加载提示
            this.showMessage('Preparing data for printing...', 'info');

            // 获取所有数据
            const [table1Data, table2Data] = await Promise.all([
                fetch('/print-report/no-sms-report?pageSize=999999').then(res => res.json()),
                fetch('/print-report/un-customer-report?pageSize=999999').then(res => res.json())
            ]);

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Margin Report</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.1.0/dist/css/adminlte.min.css">
                        ${this.getPrintStyles()}
                    </head>
                    <body>
                        ${this.getPrintTableTemplate('Margin Customers Not in User Snap', table1Data.data, ['Securities Account', 'Account Name'])}
                        ${this.getPrintTableTemplate('Undeliverable Margin Customers', table2Data.data, ['Securities Account', 'User No', 'Account Name', 'Phone Number'])}
                    </body>
                </html>
            `);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                this.showMessage('Print prepared successfully', 'success');
            }, 500);

        } catch (error) {
            console.error('Print error:', error);
            this.showMessage('Failed to prepare print data', 'error');
        }
    }

    getPrintTableTemplate(title, data, headers) {
        const getRowHtml = (item) => {
            if (headers.length === 2) {
                return `<tr>
                    <td>${item.secAccNo || ''}</td>
                    <td>${item.secAccName || ''}</td>
                </tr>`;
            } else {
                return `<tr>
                    <td>${item.secAccNo || ''}</td>
                    <td>${item.userNo || ''}</td>
                    <td>${item.secAccName || ''}</td>
                    <td>${item.telNo || ''}</td>
                </tr>`;
            }
        };

        return `
            <div class="card">
                <div class="card-header">
                    <h3>${title}</h3>
                </div>
                <div class="card-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(getRowHtml).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getPrintStyles() {
        return `
            <style>
                @media print {
                    body { 
                        padding: 20px; 
                        font-family: 'Source Sans Pro', sans-serif;
                    }
                    .card { 
                        margin-bottom: 2rem; 
                        break-inside: avoid;
                        border: none;
                        box-shadow: none;
                    }
                    .card-header { 
                        background-color: transparent; 
                        border-bottom: 1px solid rgba(0,0,0,.125); 
                        padding: 0.75rem 1.25rem;
                    }
                    .card-header h3 { 
                        font-size: 1.1rem; 
                        font-weight: 400; 
                        margin: 0; 
                        color: #1f2d3d;
                    }
                    .table { 
                        width: 100%; 
                        margin-bottom: 0; 
                        background-color: transparent; 
                        border-collapse: collapse;
                    }
                    .table thead th { 
                        border-bottom: 2px solid #dee2e6; 
                        background-color: #f4f6f9 !important;
                        font-weight: 500; 
                        padding: 0.75rem; 
                        text-align: left; 
                        vertical-align: bottom; 
                        border-top: 1px solid #dee2e6;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .table tbody td { 
                        padding: 0.75rem; 
                        vertical-align: middle; 
                        border-top: 1px solid #dee2e6;
                    }
                    .table-bordered { 
                        border: 1px solid #dee2e6;
                    }
                    .table-bordered th, 
                    .table-bordered td { 
                        border: 1px solid #dee2e6 !important;
                    }
                }
            </style>
        `;
    }

    async exportAllTables() {
        try {
            this.showMessage('Preparing data for export...', 'info');
            
            // 调用后端导出API
            const response = await fetch('/print-report/export', {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            });
            
            if (!response.ok) {
                throw new Error('Export failed');
            }

            // 获取文件名
            const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'margin_report.xlsx';
            
            // 下载文件
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showMessage('Export completed successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Failed to export data', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.printReport = new PrintReportPage();
}); 