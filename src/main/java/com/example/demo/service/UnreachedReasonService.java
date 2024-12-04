package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.dto.UnreachedReason;
import com.example.demo.mapper.UnreachedReasonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UnreachedReasonService {
    
    @Autowired
    private UnreachedReasonMapper unreachedReasonMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public List<UnreachedReason> getAllReasons() {
        return unreachedReasonMapper.getReasonList();
    }
    
    public UnreachedReason createReason(UnreachedReason reason) {
        reason.setId(snowflake.nextId());
        reason.setCreatedBy("SYSTEM");
        reason.setLastModifiedBy("SYSTEM");
        unreachedReasonMapper.insert(reason);
        return reason;
    }
    
    public UnreachedReason updateReason(UnreachedReason reason) {
        reason.setLastModifiedBy("SYSTEM");
        unreachedReasonMapper.update(reason);
        return reason;
    }
    
    public void deleteReason(Long id) {
        unreachedReasonMapper.deleteById(id);
    }
} 