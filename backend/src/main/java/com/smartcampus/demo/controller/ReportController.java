package com.smartcampus.demo.controller;

import com.smartcampus.demo.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getResourceSummary() {
        return ResponseEntity.ok(reportService.getResourceSummary());
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceReport() {
        return ResponseEntity.ok(reportService.getMaintenanceReport());
    }

    @GetMapping("/asset-value")
    public ResponseEntity<Map<String, Object>> getAssetValueReport() {
        return ResponseEntity.ok(reportService.getAssetValueReport());
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<Map<String, Object>> getCategoryBreakdown() {
        return ResponseEntity.ok(reportService.getCategoryBreakdown());
    }

    @GetMapping("/assignment")
    public ResponseEntity<Map<String, Object>> getAssignmentReport() {
        return ResponseEntity.ok(reportService.getAssignmentReport());
    }
}