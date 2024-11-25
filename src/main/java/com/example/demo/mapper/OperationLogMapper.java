package com.example.demo.mapper;

import com.example.demo.entity.OperationLog;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OperationLogMapper {
    
    @Insert("INSERT INTO operation_logs (id, operation_type, module, operation_desc, " +
            "operation_data, operator, created_at) VALUES " +
            "(#{id}, #{operationType}, #{module}, #{operationDesc}, " +
            "#{operationData}::jsonb, #{operator}, #{createdAt})")
    void insert(OperationLog log);
    
    @Select("SELECT * FROM operation_logs " +
            "WHERE module = #{module} " +
            "AND operation_data->>'id' = #{id} " +
            "ORDER BY created_at DESC")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "operationType", column = "operation_type"),
        @Result(property = "module", column = "module"),
        @Result(property = "operationDesc", column = "operation_desc"),
        @Result(property = "operationData", column = "operation_data"),
        @Result(property = "operator", column = "operator"),
        @Result(property = "createdAt", column = "created_at")
    })
    List<OperationLog> findByModuleAndId(@Param("module") String module, @Param("id") String id);
} 