package com.example.demo.controller;

import com.example.demo.service.UndeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Locale;

@Controller
@RequestMapping("/undelivery-import")
public class UndeliveryController {
    
    @Autowired
    private UndeliveryService undeliveryService;
    
    @GetMapping
    public String importPage(Model model) {
        model.addAttribute("currentPage", "importPage");
        return "undeliverable-report/importPage";
    }
    
    @PostMapping("/generate-mobile-no")
    @ResponseBody
    public ResponseEntity<?> generateMobileNoData(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        try {
            undeliveryService.generateMobileNoData(date);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/import-account")
    @ResponseBody
    public ResponseEntity<?> importAccountData(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file");
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(".txt")) {
            return ResponseEntity.badRequest().body("Only txt files are allowed");
        }
        
        try {
            undeliveryService.importAccountData(file);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 