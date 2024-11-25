package com.example.demo.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLogAnnotation {
    /**
     * 操作类型
     */
    String operationType();
    
    /**
     * 模块
     */
    String module();
    
    /**
     * 操作描述
     */
    String description();
} 