package com.example.demo.mapper;

import com.example.demo.dto.UnreachedReason;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UnreachedReasonMapper {
    List<UnreachedReason> getReasonList();
    void insert(UnreachedReason reason);
    void update(UnreachedReason reason);
    void deleteById(Long id);
} 