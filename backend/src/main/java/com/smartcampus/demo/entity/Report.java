package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Document(collection = "reports")
@Data
public class Report {
    @Id
    private String id;

    private String name;
    private String type;  // RESOURCE_SUMMARY, MAINTENANCE, ASSET_VALUE, CATEGORY_BREAKDOWN
    private String generatedBy;
    private LocalDateTime generatedAt;
    private String parameters;  // JSON string of filters used
    private String filePath;    // Path to generated report file
    
    public enum ReportType {
        RESOURCE_SUMMARY,
        MAINTENANCE,
        ASSET_VALUE,
        CATEGORY_BREAKDOWN,
        ASSIGNMENT
    }
}