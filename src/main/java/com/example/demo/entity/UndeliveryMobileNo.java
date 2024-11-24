package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UndeliveryMobileNo {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;
    private String acNo;
    private String reason;
    private String mobileNumber;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdate;
} 