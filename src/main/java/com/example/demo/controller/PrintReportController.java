package com.example.demo.controller;

import com.example.demo.dto.MarginReportDTO;
import com.example.demo.service.PrintReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequestMapping("/print-report")
public class PrintReportController {

    @Autowired
    private PrintReportService printReportService;

    @GetMapping
    public String printReportPage() {
        return "Undeliverable-report/printReport";
    }

    @GetMapping("/no-sms-report")
    @ResponseBody
    public List<MarginReportDTO> getTable1Data() {
        return printReportService.getMarginCustomersNotInUserSnap();
    }

    @GetMapping("/un-customer-report")
    @ResponseBody
    public List<MarginReportDTO> getTable2Data() {
        return printReportService.getUndeliverableMarginCustomers();
    }
} 