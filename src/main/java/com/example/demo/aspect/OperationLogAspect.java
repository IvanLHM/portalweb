package com.example.demo.aspect;

import cn.hutool.json.JSONUtil;
import com.example.demo.dto.OperationLog;
import com.example.demo.service.OperationLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class OperationLogAspect {
    
    @Autowired
    private OperationLogService operationLogService;
    
    @Pointcut("@annotation(com.example.demo.annotation.LogOperation)")
    public void logPointcut() {}
    
    @AfterReturning(value = "logPointcut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        try {
            // 获取方法签名
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            
            // 获取注解信息
            com.example.demo.annotation.LogOperation logAnnotation = 
                method.getAnnotation(com.example.demo.annotation.LogOperation.class);
            
            // 构建日志对象
            OperationLog log = new OperationLog();
            log.setOperationType(logAnnotation.type());
            log.setModule(logAnnotation.module());
            log.setOperationDesc(logAnnotation.desc());
            log.setOperationData(result != null ? JSONUtil.toJsonStr(result) : null);
            log.setOperator("SYSTEM");  // 可以从SecurityContext中获取当前用户
            
            // 保存日志
            operationLogService.saveLog(log);
            
        } catch (Exception e) {
            // 记录日志失败不应影响业务操作
            System.err.println("Failed to save operation log: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 