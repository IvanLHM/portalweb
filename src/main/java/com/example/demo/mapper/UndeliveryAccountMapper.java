package com.example.demo.mapper;

import com.example.demo.entity.UndeliveryAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UndeliveryAccountMapper {
    int batchInsert(@Param("records") List<UndeliveryAccount> records);
} 