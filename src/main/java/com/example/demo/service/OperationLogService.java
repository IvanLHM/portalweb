package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import cn.hutool.json.JSONUtil;
import com.example.demo.entity.OperationLog;
import com.example.demo.mapper.OperationLogMapper;
import com.example.demo.mapper.UndeliverableAccountMapper;
import com.example.demo.entity.UndeliverableAccount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OperationLogService {
    
    @Autowired
    private OperationLogMapper logMapper;
    
    @Autowired
    private UndeliverableAccountMapper accountMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public void log(String operationType, String module, String desc, Object data) {
        OperationLog log = OperationLog.builder()
                .id(snowflake.nextId())
                .operationType(operationType)
                .module(module)
                .operationDesc(desc)
                .operationData(data != null ? JSONUtil.toJsonStr(data) : null)
                .operator("system")
                .createdAt(LocalDateTime.now())
                .build();
        
        try {
            logMapper.insert(log);
        } catch (Exception e) {
            System.err.println("Failed to insert operation log: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<OperationLog> getLogsByAccountId(String accountId) {
        try {
            return logMapper.findByModuleAndId("ACCOUNT", accountId);
        } catch (Exception e) {
            System.err.println("Failed to get logs for account " + accountId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    public UndeliverableAccount getAccountById(Long id) {
        return accountMapper.findById(id);
    }
    
    public List<OperationLog> getLogsByReasonId(String reasonId) {
        try {
            return logMapper.findByModuleAndId("REASON", reasonId);
        } catch (Exception e) {
            System.err.println("Failed to get logs for reason " + reasonId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
} 