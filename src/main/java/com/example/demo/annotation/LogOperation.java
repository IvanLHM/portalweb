package com.example.demo.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogOperation {
    /**
     * 操作类型
     */
    String type() default "";
    
    /**
     * 所属模块
     */
    String module() default "";
    
    /**
     * 操作描述
     */
    String desc() default "";
} 