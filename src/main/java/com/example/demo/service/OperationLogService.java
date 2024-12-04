package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.dto.OperationLog;
import com.example.demo.mapper.OperationLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OperationLogService {
    
    @Autowired
    private OperationLogMapper operationLogMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public void saveLog(OperationLog log) {
        log.setId(snowflake.nextId());
        operationLogMapper.insert(log);
    }
    
    public List<OperationLog> findAll() {
        return operationLogMapper.findAll();
    }
    
    public List<OperationLog> findByModule(String module) {
        return operationLogMapper.findByModule(module);
    }
    
    public List<OperationLog> findByOperator(String operator) {
        return operationLogMapper.findByOperator(operator);
    }
} 