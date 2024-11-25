package com.example.demo.annotation;

import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogField {
    /**
     * 字段描述
     */
    String description() default "";

    /**
     * 是否记录变化
     */
    boolean logChange() default true;
} 