package com.example.demo.entity;

import com.example.demo.annotation.LogField;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
public class UndeliverableReason {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @NotBlank(message = "Description cannot be empty")
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    @LogField(description = "描述")
    private String description;
    
    private LocalDateTime createdAt;
} 