package com.example.demo.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {
    /**
     * 操作类型
     */
    String operationType();

    /**
     * 模块
     */
    String module() default "ACCOUNT";

    /**
     * 操作描述
     */
    String description();
} 