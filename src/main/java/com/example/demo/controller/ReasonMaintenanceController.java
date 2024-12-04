package com.example.demo.controller;

import com.example.demo.dto.UnreachedReason;
import com.example.demo.service.UnreachedReasonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/reasons-maintenance")
public class ReasonMaintenanceController {
    
    @Autowired
    private UnreachedReasonService unreachedReasonService;
    
    @GetMapping
    public String reasonPage(Model model) {
        model.addAttribute("currentPage", "reasonMaintenance");
        return "undeliverable-report/reasonMaintenance";
    }
    
    @GetMapping("/list")
    @ResponseBody
    public ResponseEntity<List<UnreachedReason>> getAllReasons() {
        return ResponseEntity.ok(unreachedReasonService.getAllReasons());
    }
    
    @PostMapping
    @ResponseBody
    public ResponseEntity<UnreachedReason> createReason(@RequestBody UnreachedReason reason) {
        return ResponseEntity.ok(unreachedReasonService.createReason(reason));
    }
    
    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<UnreachedReason> updateReason(
            @PathVariable Long id, 
            @RequestBody UnreachedReason reason) {
        reason.setId(id);
        return ResponseEntity.ok(unreachedReasonService.updateReason(reason));
    }
    
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteReason(@PathVariable Long id) {
        unreachedReasonService.deleteReason(id);
        return ResponseEntity.ok().build();
    }
} 