package com.example.demo.mapper;

import com.example.demo.dto.OperationLog;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface OperationLogMapper {
    void insert(OperationLog log);
    List<OperationLog> findAll();
    List<OperationLog> findByModule(String module);
    List<OperationLog> findByOperator(String operator);
} 