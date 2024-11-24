package com.example.demo.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FieldChange {
    private String fieldName;
    private String description;
    private Object oldValue;
    private Object newValue;
} 