package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class UserController {
    
    @Autowired
    private UserMapper userMapper;
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("currentPage", "home");
        return "index";
    }
    
    @GetMapping("/api/users")
    @ResponseBody
    public List<User> getAllUsers() {
        return userMapper.findAll();
    }
    
    @PostMapping("/api/users")
    @ResponseBody
    public void addUser(@RequestBody User user) {
        userMapper.insert(user);
    }
    
    @DeleteMapping("/api/users/{id}")
    @ResponseBody
    public void deleteUser(@PathVariable Long id) {
        userMapper.deleteById(id);
    }
} 