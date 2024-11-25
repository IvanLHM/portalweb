package com.example.demo.mapper;

import com.example.demo.entity.UndeliverableReason;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface UndeliverableReasonMapper {
    
    List<UndeliverableReason> findAll();
    
    UndeliverableReason findById(@Param("id") Long id);
    
    int countByDescription(@Param("description") String description, @Param("id") Long id);
    
    int insert(UndeliverableReason reason);
    
    int update(UndeliverableReason reason);
    
    int delete(@Param("id") Long id);
} 