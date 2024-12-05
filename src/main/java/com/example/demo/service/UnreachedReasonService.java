package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.dto.UnreachedReason;
import com.example.demo.mapper.UnreachedReasonMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnreachedReasonService {
    
    @Autowired
    private UnreachedReasonMapper unreachedReasonMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public PageInfo<UnreachedReason> getAllReasons(int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<UnreachedReason> reasons = unreachedReasonMapper.selectAll();
        return new PageInfo<>(reasons);
    }
    
    @Transactional
    public UnreachedReason createReason(UnreachedReason reason) {
        reason.setId(snowflake.nextId());
        reason.setCreatedBy("SYSTEM");
        reason.setLastModifiedBy("SYSTEM");
        unreachedReasonMapper.insert(reason);
        return reason;
    }
    
    @Transactional
    public UnreachedReason updateReason(UnreachedReason reason) {
        reason.setLastModifiedBy("SYSTEM");
        unreachedReasonMapper.update(reason);
        return reason;
    }
    
    @Transactional
    public void deleteReason(Long id) {
        unreachedReasonMapper.delete(id);
    }
    
    public UnreachedReason getReasonById(Long id) {
        return unreachedReasonMapper.selectById(id);
    }
} 