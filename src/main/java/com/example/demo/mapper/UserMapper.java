package com.example.demo.mapper;

import com.example.demo.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users")
    List<User> findAll();
    
    @Insert("INSERT INTO users (username, email) VALUES (#{username}, #{email})")
    void insert(User user);
    
    @Delete("DELETE FROM users WHERE id = #{id}")
    void deleteById(Long id);
} 