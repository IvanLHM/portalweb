package com.example.demo.controller;

import com.example.demo.dto.UnreachedAccount;
import com.example.demo.service.UnreachedAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/account-maintenance")  // 更新路径以反映维护功能
public class AccountMaintenanceController {
    
    @Autowired
    private UnreachedAccountService unreachedAccountService;
    
    @GetMapping
    public String accountPage(Model model) {
        model.addAttribute("currentPage", "accountMaintenance");  // 更新页面标识
        return "undeliverable-report/accountMaintenance";  // 更新视图名
    }
    
    @GetMapping("/list")
    @ResponseBody
    public ResponseEntity<List<UnreachedAccount>> getAllAccounts() {
        return ResponseEntity.ok(unreachedAccountService.findAll());
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