package com.example.demo.service;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.example.demo.entity.UndeliverableAccount;
import com.example.demo.mapper.UndeliverableAccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UndeliverableAccountService {
    
    @Autowired
    private UndeliverableAccountMapper accountMapper;
    
    private final Snowflake snowflake = IdUtil.getSnowflake(1, 1);
    
    public List<UndeliverableAccount> getAllAccounts() {
        return accountMapper.findAll();
    }
    
    public UndeliverableAccount getAccountById(Long id) {
        return accountMapper.findById(id);
    }
    
    @Transactional
    public void createAccount(UndeliverableAccount account) {
        account.setId(snowflake.nextId());
        accountMapper.insert(account);
    }
    
    @Transactional
    public void updateAccount(UndeliverableAccount account) {
        // 先检查记录是否存在
        UndeliverableAccount existingAccount = accountMapper.findById(account.getId());
        if (existingAccount == null) {
            throw new RuntimeException("Account not found with id: " + account.getId());
        }
        
        int rows = accountMapper.update(account);
        if (rows == 0) {
            throw new RuntimeException("Update failed: No changes made");
        }
    }
    
    @Transactional
    public void deleteAccount(Long id) {
        // 先检查记录是否存在
        UndeliverableAccount existingAccount = accountMapper.findById(id);
        if (existingAccount == null) {
            throw new RuntimeException("Account not found with id: " + id);
        }
        
        int rows = accountMapper.delete(id);
        if (rows == 0) {
            throw new RuntimeException("Delete failed: Account not found");
        }
    }
} 