class PrintReportPage {
    constructor() {
        this.welcomeSection = document.getElementById('welcome-section');
        this.reportSection = document.getElementById('report-section');
        this.generateBtn = document.getElementById('generateBtn');
        this.backBtn = document.getElementById('backBtn');
        this.table1 = null;
        this.table2 = null;
        
        this.bindEvents();
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateReport());
        
        // 添加合并打印按钮事件
        document.getElementById('printBtn').addEventListener('click', () => this.printAllTables());
        // 添加合并导出按钮事件
        document.getElementById('exportBtn').addEventListener('click', () => this.exportAllTables());
        
        // 添加返回按钮事件
        this.backBtn.addEventListener('click', () => this.backToWelcome());
    }

    // 添加返回方法
    backToWelcome() {
        // 清空表格数据
        if (this.table1) {
            this.table1.clear().destroy();
            this.table1 = null;
        }
        if (this.table2) {
            this.table2.clear().destroy();
            this.table2 = null;
        }
        
        // 切换显示
        this.reportSection.style.display = 'none';
        this.welcomeSection.style.display = 'block';
    }

    async generateReport() {
        try {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';

            // 获取数据
            const [data1, data2] = await Promise.all([
                this.fetchTable1Data(),
                this.fetchTable2Data()
            ]);

            // 初始化表格
            this.initTables(data1, data2);

            // 显示报表部分
            this.welcomeSection.style.display = 'none';
            this.reportSection.style.display = 'block';

        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report: ' + error.message);
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<i class="fas fa-file-alt mr-2"></i>General Report';
        }
    }

    async fetchTable1Data() {
        const response = await fetch('/print-report/no-sms-report');
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchTable2Data() {
        const response = await fetch('/print-report/un-customer-report');
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    initTables(data1, data2) {
        const commonConfig = {
            searching: false,
            ordering: false,
            lengthChange: true,
            autoWidth: false,
            pageLength: 10,
            lengthMenu: [10, 25, 50]
        };

        // 初始化表格
        this.table1 = $('#table1').DataTable({
            ...commonConfig,
            data: data1,
            columns: [
                { data: 'secAccNo' },
                { data: 'secAccName' }
            ]
        });

        this.table2 = $('#table2').DataTable({
            ...commonConfig,
            data: data2,
            columns: [
                { data: 'secAccNo' },
                { data: 'userNo' },
                { data: 'secAccName' },
                { data: 'telNo' }
            ]
        });
    }

    // 合并打印功能
    printAllTables() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Margin Report</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.1.0/dist/css/adminlte.min.css">
                    <style>
                        body {
                            padding: 20px;
                            font-family: 'Source Sans Pro', sans-serif;
                        }
                        .card {
                            margin-bottom: 2rem;
                            box-shadow: 0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2);
                            border: 0;
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
                        .card-body {
                            padding: 0;
                        }
                        .table {
                            width: 100%;
                            margin-bottom: 0;
                            background-color: transparent;
                            border-collapse: collapse;
                        }
                        .table thead th {
                            border-bottom: 2px solid #dee2e6;
                            background-color: #f4f6f9;
                            font-weight: 500;
                            padding: 0.75rem;
                            text-align: left;
                            vertical-align: bottom;
                            border-top: 1px solid #dee2e6;
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
                            border: 1px solid #dee2e6;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .card {
                                break-inside: avoid;
                                border: none;
                                box-shadow: none;
                            }
                            .table thead th {
                                background-color: #f4f6f9 !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .table-bordered th,
                            .table-bordered td {
                                border-color: #dee2e6 !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="card-header">
                            <h3>Margin Customers Not in User Snap</h3>
                        </div>
                        <div class="card-body">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Securities Account</th>
                                        <th>Account Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.getTableData(this.table1)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3>Undeliverable Margin Customers</h3>
                        </div>
                        <div class="card-body">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Securities Account</th>
                                        <th>User No</th>
                                        <th>Account Name</th>
                                        <th>Phone Number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.getTableData(this.table2)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        
        // 等待样式加载完成后打印
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    // 辅助方法：获取表格数据的HTML
    getTableData(table) {
        return table.rows().data().map(row => {
            if (table === this.table1) {
                return `<tr>
                    <td>${row.secAccNo}</td>
                    <td>${row.secAccName}</td>
                </tr>`;
            } else {
                return `<tr>
                    <td>${row.secAccNo}</td>
                    <td>${row.userNo}</td>
                    <td>${row.secAccName}</td>
                    <td>${row.telNo}</td>
                </tr>`;
            }
        }).join('');
    }

    // 合并导出Excel功能
    exportAllTables() {
        const workbook = XLSX.utils.book_new();
        
        // 导出第一个表格
        const ws1 = XLSX.utils.table_to_sheet(document.getElementById('table1'));
        XLSX.utils.book_append_sheet(workbook, ws1, "No SMS Customers");
        
        // 导出第二个表格
        const ws2 = XLSX.utils.table_to_sheet(document.getElementById('table2'));
        XLSX.utils.book_append_sheet(workbook, ws2, "Undeliverable Customers");
        
        // 保存文件
        XLSX.writeFile(workbook, "margin_report.xlsx");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.printReport = new PrintReportPage();
}); 