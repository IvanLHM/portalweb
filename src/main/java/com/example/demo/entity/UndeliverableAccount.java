package com.example.demo.entity;

import com.example.demo.annotation.LogField;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
public class UndeliverableAccount {
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @NotBlank(message = "Account cannot be empty")
    @Size(min = 3, max = 100, message = "Account length must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Account can only contain letters, numbers, underscores and hyphens")
    @LogField(description = "账户名称")
    private String account;

    @NotNull(message = "Reason must be selected")
    @LogField(description = "原因ID")
    private Long reasonId;

    private String reasonCode;
    
    private String description;
    
    private LocalDateTime lastUpdate;
} 