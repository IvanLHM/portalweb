package com.example.demo.mapper;

import com.example.demo.entity.UndeliveryMobileNo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface UndeliveryMobileNoMapper {
    void deleteAll();
    List<UndeliveryMobileNo> findFailedSmsRecords(@Param("date") LocalDate date);
    int batchInsert(@Param("records") List<UndeliveryMobileNo> records);
} 