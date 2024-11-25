package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.entity.UndeliveryMobileNo;
import com.example.demo.entity.UndeliverableAccount;
import com.example.demo.mapper.UndeliveryMobileNoMapper;
import com.example.demo.mapper.UndeliverableAccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UndeliveryService {
    
    @Autowired
    private UndeliveryMobileNoMapper mobileNoMapper;
    
    @Autowired
    private UndeliverableAccountMapper undeliverableAccountMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);

    @Transactional
    public void generateMobileNoData(LocalDate date) {
        // 先清空整个表
        mobileNoMapper.deleteAll();

        // 查询失败的短信记录
        List<UndeliveryMobileNo> records = mobileNoMapper.findFailedSmsRecords(date);
        System.out.println("Found " + records.size() + " records");

        // 设置ID并插入记录
        if (!records.isEmpty()) {
            records.forEach(record -> record.setId(snowflake.nextId()));
            int insertedCount = mobileNoMapper.batchInsert(records);
            System.out.println("Inserted " + insertedCount + " records");
        }
    }

    @Transactional
    public void importAccountData(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".txt")) {
            throw new IllegalArgumentException("Only txt files are allowed");
        }

        List<UndeliverableAccount> records = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\s+", 2);
                if (parts.length == 2) {
                    UndeliverableAccount record = new UndeliverableAccount();
                    record.setId(snowflake.nextId());
                    record.setAccountNumber(parts[0].trim());
                    record.setAccountName(parts[1].trim());
                    records.add(record);
                }
            }
        }

        if (!records.isEmpty()) {
            undeliverableAccountMapper.batchInsert(records);
        }
    }
} 