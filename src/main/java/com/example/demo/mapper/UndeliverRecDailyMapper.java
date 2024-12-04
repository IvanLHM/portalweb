package com.example.demo.mapper;

import com.example.demo.dto.UndeliverRecDaily;
import org.apache.ibatis.annotations.Mapper;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UndeliverRecDailyMapper {
    List<UndeliverRecDaily> findAll();
    List<UndeliverRecDaily> findByDate(LocalDate date);
    List<UndeliverRecDaily> findFailedSmsRecords(LocalDate date);
    void batchInsert(List<UndeliverRecDaily> records);
    void deleteAll();
    void deleteByDate(LocalDate date);
    /**
     * 生成每日未投递记录数据
     * @param date 日期
     * @return 插入的记录数
     */
    int generateDailyData(@Param("date") LocalDate date);
} 