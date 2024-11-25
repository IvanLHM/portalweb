package com.example.demo.entity;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OperationLog {
    private Long id;
    private String operationType;
    private String module;
    private String operationDesc;
    private String operationData;
    private String operator;
    private LocalDateTime createdAt;
} 