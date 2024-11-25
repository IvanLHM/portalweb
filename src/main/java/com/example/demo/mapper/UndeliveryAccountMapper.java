package com.example.demo.mapper;

import com.example.demo.entity.UndeliveryAccount;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UndeliveryAccountMapper {
    List<UndeliveryAccount> findAll();
    
    // 添加批量插入方法的声明
    int batchInsert(List<UndeliveryAccount> records);
} 