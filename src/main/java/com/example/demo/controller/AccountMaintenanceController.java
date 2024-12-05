package com.example.demo.controller;

import com.example.demo.dto.UnreachedAccount;
import com.example.demo.service.UnreachedAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/account-maintenance")
public class AccountMaintenanceController {
    
    @Autowired
    private UnreachedAccountService unreachedAccountService;
    
    @GetMapping
    public String accountPage(Model model) {
        model.addAttribute("currentPage", "accountMaintenance");
        return "undeliverable-report/accountMaintenance";
    }
    
    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> getAllAccounts(
            @RequestParam(value = "draw", defaultValue = "1") int draw,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "length", defaultValue = "10") int length) {
        
        // 计算页码
        int pageNum = (start / length) + 1;
        
        // 获取总记录数和分页数据
        long total = unreachedAccountService.count();
        List<UnreachedAccount> data = unreachedAccountService.findPage(length, pageNum);
        
        // 构造 DataTable 需要的响应格式
        Map<String, Object> response = new HashMap<>();
        response.put("draw", draw);
        response.put("recordsTotal", total);
        response.put("recordsFiltered", total);
        response.put("data", data);
        
        return response;
    }
    
    @GetMapping("/{accountNo}")
    @ResponseBody
    public ResponseEntity<UnreachedAccount> getAccount(@PathVariable String accountNo) {
        return ResponseEntity.ok(unreachedAccountService.findByAccountNo(accountNo));
    }
    
    @PostMapping
    @ResponseBody
    public ResponseEntity<UnreachedAccount> createAccount(@RequestBody UnreachedAccount account) {
        return ResponseEntity.ok(unreachedAccountService.createAccount(account));
    }
    
    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<UnreachedAccount> updateAccount(
            @PathVariable Long id, 
            @RequestBody UnreachedAccount account) {
        account.setId(id);
        return ResponseEntity.ok(unreachedAccountService.updateAccount(account));
    }
    
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        unreachedAccountService.deleteAccount(id);
        return ResponseEntity.ok().build();
    }
} 