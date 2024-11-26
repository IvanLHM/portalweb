package com.example.demo.mapper;

import com.example.demo.entity.UndeliveryMobileNo;
import org.apache.ibatis.annotations.Mapper;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface UndeliverableMobileNoMapper {
    
    /**
     * 查找指定日期的失败短信记录
     */
    List<UndeliveryMobileNo> findFailedSmsRecords(LocalDate date);

    /**
     * 批量插入记录
     */
    int batchInsert(List<UndeliveryMobileNo> records);

    /**
     * 删除所有记录
     */
    int deleteAll();
}
