package com.example.demo.controller;

import com.example.demo.entity.UndeliverableAccount;
import com.example.demo.entity.UndeliverableReason;
import com.example.demo.service.UndeliverableAccountService;
import com.example.demo.service.OperationLogService;
import com.example.demo.service.UndeliverableReasonService;
import com.example.demo.annotation.OperationLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;
import org.springframework.context.support.DefaultMessageSourceResolvable;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/undeliverable-report")
public class UndeliverableReportController {
    
    @Autowired
    private UndeliverableAccountService accountService;
    
    @Autowired
    private UndeliverableReasonService reasonService;

    @Autowired
    private OperationLogService operationLogService;
    
    @GetMapping("/account-maintenance")
    public String accountMaintenance(Model model) {
        model.addAttribute("currentPage", "accountMaintenance");
        return "undeliverable-report/accountMaintenance";
    }

    @GetMapping("/reason-maintenance")
    public String reasonMaintenance(Model model) {
        model.addAttribute("currentPage", "reasonMaintenance");
        return "undeliverable-report/reasonMaintenance";
    }
    
    @GetMapping("/api/accounts")
    @ResponseBody
    public List<UndeliverableAccount> getAllAccounts() {
        return accountService.getAllAccounts();
    }
    
    @GetMapping("/api/reasons")
    @ResponseBody
    public List<UndeliverableReason> getAllReasons() {
        return reasonService.getAllReasons();
    }
    
    @PostMapping("/api/accounts")
    @ResponseBody
    @OperationLog(
        operationType = "CREATE",
        description = "Create new account"
    )
    public ResponseEntity<?> createAccount(@Valid @RequestBody UndeliverableAccount account, 
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            accountService.createAccount(account);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/api/accounts/{id}")
    @ResponseBody
    @OperationLog(
        operationType = "UPDATE",
        description = "Update account"
    )
    public ResponseEntity<?> updateAccount(@PathVariable String id, 
                                         @Valid @RequestBody UndeliverableAccount account, 
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            account.setId(Long.parseLong(id));
            accountService.updateAccount(account);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/api/accounts/{id}")
    @ResponseBody
    @OperationLog(
        operationType = "DELETE",
        description = "Delete account"
    )
    public ResponseEntity<?> deleteAccount(@PathVariable String id) {
        try {
            accountService.deleteAccount(Long.parseLong(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/api/accounts/{id}/logs")
    @ResponseBody
    public ResponseEntity<List<com.example.demo.entity.OperationLog>> getAccountLogs(@PathVariable String id) {
        try {
            List<com.example.demo.entity.OperationLog> logs = operationLogService.getLogsByAccountId(id);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/api/reasons")
    @ResponseBody
    @OperationLog(
        operationType = "CREATE",
        description = "Create new reason"
    )
    public ResponseEntity<?> createReason(@Valid @RequestBody UndeliverableReason reason, 
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            reasonService.createReason(reason);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/api/reasons/{id}")
    @ResponseBody
    @OperationLog(
        operationType = "UPDATE",
        description = "Update reason"
    )
    public ResponseEntity<?> updateReason(@PathVariable String id, 
                                         @Valid @RequestBody UndeliverableReason reason, 
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            reason.setId(Long.parseLong(id));
            reasonService.updateReason(reason);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/api/reasons/{id}")
    @ResponseBody
    @OperationLog(
        operationType = "DELETE",
        description = "Delete reason"
    )
    public ResponseEntity<?> deleteReason(@PathVariable String id) {
        try {
            reasonService.deleteReason(Long.parseLong(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/api/reasons/{id}/logs")
    @ResponseBody
    public ResponseEntity<List<com.example.demo.entity.OperationLog>> getReasonLogs(@PathVariable String id) {
        try {
            List<com.example.demo.entity.OperationLog> logs = operationLogService.getLogsByReasonId(id);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 