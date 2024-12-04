package com.example.demo.mapper;

import com.example.demo.dto.UnreachedAccount;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UnreachedAccountMapper {
    List<UnreachedAccount> findAll();
    UnreachedAccount findByAccountNo(String accountNo);
    void insert(UnreachedAccount account);
    void update(UnreachedAccount account);
    void deleteById(Long id);
    void batchInsert(List<UnreachedAccount> records);
} 