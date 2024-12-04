package com.example.demo.controller;

import com.example.demo.service.UnreachedImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@Controller
@RequestMapping("/margin-trade-limit")
public class ImportPageController {
    
    @Autowired
    private UnreachedImportService unreachedImportService;
    
    @GetMapping
    public String importPage(Model model) {
        model.addAttribute("currentPage", "importPage");
        return "undeliverable-report/importPage";
    }
    
    @PostMapping("/generate")
    @ResponseBody
    public ResponseEntity<?> generateMobileRecords(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        try {
            Map<String, Object> result = unreachedImportService.generateMobileNoData(date);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/import")
    @ResponseBody
    public ResponseEntity<?> importUnreachedAccounts(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file");
        }
        
        try {
            Map<String, Object> result = unreachedImportService.importUnreachedAccount(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 