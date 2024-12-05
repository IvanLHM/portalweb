package com.example.demo.service;

import com.example.demo.dto.MarginReportDTO;
import com.example.demo.mapper.PrintReportMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PrintReportService {

    @Autowired
    private PrintReportMapper printReportMapper;

    public PageInfo<MarginReportDTO> getMarginCustomersNotInUserSnap(int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<MarginReportDTO> list = printReportMapper.findMarginCustomersNotInUserSnap();
        return new PageInfo<>(list);
    }

    public PageInfo<MarginReportDTO> getUndeliverableMarginCustomers(int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<MarginReportDTO> list = printReportMapper.findUndeliverableMarginCustomers();
        return new PageInfo<>(list);
    }

    public List<MarginReportDTO> getAllMarginCustomersNotInUserSnap() {
        return printReportMapper.findMarginCustomersNotInUserSnap();
    }

    public List<MarginReportDTO> getAllUndeliverableMarginCustomers() {
        return printReportMapper.findUndeliverableMarginCustomers();
    }

    public byte[] exportExcelReport() throws IOException {
        // 获取所有数据
        List<MarginReportDTO> table1Data = getAllMarginCustomersNotInUserSnap();
        List<MarginReportDTO> table2Data = getAllUndeliverableMarginCustomers();

        // 创建工作簿
        try (Workbook workbook = new XSSFWorkbook()) {
            // 创建样式
            CellStyle headerStyle = createHeaderStyle(workbook);

            // 创建第一个工作表
            createSheet(
                workbook,
                "No SMS Customers",
                new String[]{"Securities Account", "Account Name"},
                new int[]{20, 30},
                table1Data,
                headerStyle,
                (row, dto) -> {
                    row.createCell(0).setCellValue(dto.getSecAccNo());
                    row.createCell(1).setCellValue(dto.getSecAccName());
                }
            );

            // 创建第二个工作表
            createSheet(
                workbook,
                "Undeliverable Customers",
                new String[]{"Securities Account", "User No", "Account Name", "Phone Number"},
                new int[]{20, 15, 30, 15},
                table2Data,
                headerStyle,
                (row, dto) -> {
                    row.createCell(0).setCellValue(dto.getSecAccNo());
                    row.createCell(1).setCellValue(dto.getUserNo());
                    row.createCell(2).setCellValue(dto.getSecAccName());
                    row.createCell(3).setCellValue(dto.getTelNo());
                }
            );

            // 导出
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        return headerStyle;
    }

    private <T> void createSheet(
            Workbook workbook,
            String sheetName,
            String[] headers,
            int[] columnWidths,
            List<T> data,
            CellStyle headerStyle,
            SheetDataWriter<T> dataWriter
    ) {
        Sheet sheet = workbook.createSheet(sheetName);
        
        // 设置列宽
        for (int i = 0; i < columnWidths.length; i++) {
            sheet.setColumnWidth(i, columnWidths[i] * 256);
        }

        // 创建表头
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 填充数据
        int rowNum = 1;
        for (T item : data) {
            Row row = sheet.createRow(rowNum++);
            dataWriter.writeRow(row, item);
        }
    }

    @FunctionalInterface
    private interface SheetDataWriter<T> {
        void writeRow(Row row, T data);
    }
} 