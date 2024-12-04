package com.example.demo.mapper;

import com.example.demo.dto.MarginTradeLimitDaily;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface MarginTradeLimitDailyMapper {
    void batchInsert(List<MarginTradeLimitDaily> records);
    List<MarginTradeLimitDaily> findAll();
    MarginTradeLimitDaily getAccountWithReason(String account);
    void deleteAll();
} 