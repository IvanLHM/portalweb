package com.example.demo.controller;

import com.example.demo.dto.UnreachedReason;
import com.example.demo.service.UnreachedReasonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
    public Map<String, Object> getAllReasons(
            @RequestParam(value = "draw", defaultValue = "1") int draw,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "length", defaultValue = "10") int length) {
        
        // 计算页码
        int pageNum = (start / length) + 1;
        
        // 获取总记录数和分页数据
        long total = unreachedReasonService.count();
        var data = unreachedReasonService.findPage(length, pageNum);
        
        // 构造 DataTable 需要的响应格式
        Map<String, Object> response = new HashMap<>();
        response.put("draw", draw);
        response.put("recordsTotal", total);
        response.put("recordsFiltered", total);
        response.put("data", data);
        
        return response;
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