package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.dto.MarginTradeLimitDaily;
import com.example.demo.dto.UndeliverRecDaily;
import com.example.demo.mapper.MarginTradeLimitDailyMapper;
import com.example.demo.mapper.UndeliverRecDailyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Service
public class UnreachedImportService {
    
    @Autowired
    private MarginTradeLimitDailyMapper marginTradeLimitDailyMapper;
    
    @Autowired
    private UndeliverRecDailyMapper undeliverRecDailyMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);

    @Transactional
    public Map<String, Object> importUnreachedAccount(MultipartFile file) throws IOException {
        List<MarginTradeLimitDaily> records = new ArrayList<>();
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 0. 先清空目标表
            marginTradeLimitDailyMapper.deleteAll();
            
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    
                    // 按固定长度解析
                    String rawAccNo = line.substring(0, 16).trim();  // 前16位是账号
                    String secAccName = line.substring(16, line.length() - 1).trim();  // 中间是账户名
                    String marginFlag = line.substring(line.length() - 1).trim();  // 最后一位是标志
                    
                    MarginTradeLimitDaily record = new MarginTradeLimitDaily();
                    record.setId(snowflake.nextId());
                    
                    // 处理证券账号 (去掉-)
                    String secAccNo = rawAccNo.replace("-", "");
                    record.setSecAccNo(secAccNo);
                    record.setSecAccNo9Digit(secAccNo.substring(0, 9));
                    record.setSecAccName(secAccName);
                    record.setMarginFlag(marginFlag);
                    record.setCreatedBy("SYSTEM");
                    record.setLastModifiedBy("SYSTEM");
                    
                    records.add(record);
                }
            }
            
            // 批量插入记录
            if (!records.isEmpty()) {
                marginTradeLimitDailyMapper.batchInsert(records);
            }
            
            // 返回统计信息
            result.put("success", true);
            result.put("totalRecords", records.size());
            result.put("date", LocalDate.now().toString());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("totalRecords", 0);
            result.put("date", LocalDate.now().toString());
            throw new RuntimeException("Failed to import data: " + e.getMessage(), e);
        }
        
        return result;
    }

    @Transactional
    public Map<String, Object> generateMobileNoData(LocalDate date) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 0. 先清空目标表
            undeliverRecDailyMapper.deleteAll();
            
            // 1. 查询符合条件的记录
            List<UndeliverRecDaily> records = undeliverRecDailyMapper.findFailedSmsRecords(date);
            
            // 2. 为每条记录生成ID
            records.forEach(record -> record.setId(snowflake.nextId()));
            
            // 3. 如果有数据，则批量插入
            if (!records.isEmpty()) {
                undeliverRecDailyMapper.batchInsert(records);
            }
            
            result.put("success", true);
            result.put("totalRecords", records.size());
            result.put("date", date.toString());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("totalRecords", 0);
            result.put("date", date.toString());
        }
        return result;
    }
} 