package com.example.demo.mapper;

import com.example.demo.dto.MarginReportDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PrintReportMapper {
    List<MarginReportDTO> findMarginCustomersNotInUserSnap();
    List<MarginReportDTO> findUndeliverableMarginCustomers();
} 