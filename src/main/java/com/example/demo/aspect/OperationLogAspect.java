package com.example.demo.aspect;

import com.example.demo.annotation.OperationLog;
import com.example.demo.entity.UndeliverableAccount;
import com.example.demo.entity.UndeliverableReason;
import com.example.demo.service.OperationLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogService operationLogService;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint point, OperationLog operationLog) throws Throwable {
        // 获取方法参数
        Object[] args = point.getArgs();
        Object entity = null;
        String module = "ACCOUNT";  // 默认模块
        
        // 查找需要记录的实体对象
        for (Object arg : args) {
            if (arg instanceof UndeliverableAccount) {
                entity = arg;
                module = "ACCOUNT";
                break;
            } else if (arg instanceof UndeliverableReason) {
                entity = arg;
                module = "REASON";
                break;
            }
        }

        // 执行原方法
        Object result = point.proceed();

        if (entity != null) {
            // 记录操作日志
            operationLogService.log(
                operationLog.operationType(),
                module,
                String.format("%s - %s", 
                    operationLog.description(),
                    getEntityDescription(entity)
                ),
                entity
            );
        }

        return result;
    }

    /**
     * 获取实体的描述信息
     */
    private String getEntityDescription(Object entity) {
        if (entity instanceof UndeliverableAccount) {
            return "Account: " + ((UndeliverableAccount) entity).getAccount();
        } else if (entity instanceof UndeliverableReason) {
            UndeliverableReason reason = (UndeliverableReason) entity;
            return String.format("Reason: REASON_%04d - %s", 
                reason.getId(), 
                reason.getDescription());
        }
        return "";
    }
} 