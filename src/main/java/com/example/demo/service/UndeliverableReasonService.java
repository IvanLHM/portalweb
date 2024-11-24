package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.entity.UndeliverableReason;
import com.example.demo.mapper.UndeliverableReasonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UndeliverableReasonService {
    
    @Autowired
    private UndeliverableReasonMapper reasonMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);

    public List<UndeliverableReason> getAllReasons() {
        return reasonMapper.findAll();
    }

    public UndeliverableReason getReasonById(Long id) {
        return reasonMapper.findById(id);
    }
    
    @Transactional
    public void createReason(UndeliverableReason reason) {
        // 检查描述是否重复
        if (reasonMapper.countByDescription(reason.getDescription(), null) > 0) {
            throw new RuntimeException("The description '" + reason.getDescription() + "' already exists. Please use a different description.");
        }
        reason.setId(snowflake.nextId());
        reasonMapper.insert(reason);
    }
    
    @Transactional
    public void updateReason(UndeliverableReason reason) {
        // 先检查记录是否存在
        UndeliverableReason existingReason = reasonMapper.findById(reason.getId());
        if (existingReason == null) {
            throw new RuntimeException("Reason not found with id: " + reason.getId());
        }
        
        // 检查描述是否重复（排除自身）
        if (reasonMapper.countByDescription(reason.getDescription(), reason.getId()) > 0) {
            throw new RuntimeException("The description '" + reason.getDescription() + "' already exists. Please use a different description.");
        }
        
        int rows = reasonMapper.update(reason);
        if (rows == 0) {
            throw new RuntimeException("Update failed: No changes made");
        }
    }
    
    @Transactional
    public void deleteReason(Long id) {
        // 先检查记录是否存在
        UndeliverableReason existingReason = reasonMapper.findById(id);
        if (existingReason == null) {
            throw new RuntimeException("Reason not found with id: " + id);
        }
        
        // 检查是否有关联的账户
        if (hasRelatedAccounts(id)) {
            throw new RuntimeException("Cannot delete reason: It is being used by one or more accounts");
        }
        
        int rows = reasonMapper.delete(id);
        if (rows == 0) {
            throw new RuntimeException("Delete failed: Reason not found");
        }
    }

    private boolean hasRelatedAccounts(Long reasonId) {
        // TODO: 实现检查逻辑
        return false;
    }
} 