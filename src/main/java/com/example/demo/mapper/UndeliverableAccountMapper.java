package com.example.demo.mapper;

import com.example.demo.entity.UndeliverableAccount;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UndeliverableAccountMapper {
    List<UndeliverableAccount> findAll();
    UndeliverableAccount findById(Long id);
    int insert(UndeliverableAccount account);
    int update(UndeliverableAccount account);
    int delete(Long id);
    int batchInsert(List<UndeliverableAccount> records);
    
    boolean existsByReasonId(Long reasonId);
} 