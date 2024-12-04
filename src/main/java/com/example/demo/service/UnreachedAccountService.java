package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.dto.UnreachedAccount;
import com.example.demo.mapper.UnreachedAccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UnreachedAccountService {
    
    @Autowired
    private UnreachedAccountMapper unreachedAccountMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public List<UnreachedAccount> findAll() {
        return unreachedAccountMapper.findAll();
    }
    
    public UnreachedAccount findByAccountNo(String accountNo) {
        return unreachedAccountMapper.findByAccountNo(accountNo);
    }
    
    public UnreachedAccount createAccount(UnreachedAccount account) {
        if (account.getAccountNo() == null || account.getAccountNo().trim().isEmpty()) {
            throw new IllegalArgumentException("Account number cannot be empty");
        }
        if (account.getReasonId() == null) {
            throw new IllegalArgumentException("Reason must be selected");
        }

        account.setId(snowflake.nextId());
        account.setCreatedBy("SYSTEM");
        account.setLastModifiedBy("SYSTEM");
        unreachedAccountMapper.insert(account);
        return account;
    }
    
    public UnreachedAccount updateAccount(UnreachedAccount account) {
        account.setLastModifiedBy("SYSTEM");
        unreachedAccountMapper.update(account);
        return account;
    }
    
    public void deleteAccount(Long id) {
        unreachedAccountMapper.deleteById(id);
    }
} 