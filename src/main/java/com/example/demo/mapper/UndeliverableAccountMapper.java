package com.example.demo.mapper;

import com.example.demo.entity.UndeliverableAccount;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface UndeliverableAccountMapper {
    
    List<UndeliverableAccount> findAll();
    
    UndeliverableAccount findById(@Param("id") Long id);
    
    int insert(UndeliverableAccount account);
    
    int update(UndeliverableAccount account);
    
    int delete(@Param("id") Long id);
} 