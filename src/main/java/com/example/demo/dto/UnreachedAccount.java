package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

@Data
public class UnreachedAccount {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String accountNo;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long reasonId;
    private String reasonDescription;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;
    private String createdBy;
    private String lastModifiedBy;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastModifiedTime;
} 