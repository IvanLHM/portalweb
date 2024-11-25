package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

@Data
public class UndeliverableAccount {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String accountNumber;
    private String accountName;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long reasonId;
    private String reasonCode;
    private String description;
    private String account;
    private java.time.LocalDateTime lastUpdate;
    private java.time.LocalDateTime createdAt;
} 