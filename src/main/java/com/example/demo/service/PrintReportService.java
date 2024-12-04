package com.example.demo.service;

import com.example.demo.dto.MarginReportDTO;
import com.example.demo.mapper.PrintReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrintReportService {

    @Autowired
    private PrintReportMapper printReportMapper;

    public List<MarginReportDTO> getMarginCustomersNotInUserSnap() {
        return printReportMapper.findMarginCustomersNotInUserSnap();
    }

    public List<MarginReportDTO> getUndeliverableMarginCustomers() {
        return printReportMapper.findUndeliverableMarginCustomers();
    }
} 