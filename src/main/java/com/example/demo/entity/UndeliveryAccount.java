package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UndeliveryAccount {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    private String accountNumber;
    private String accountName;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdate;
} 