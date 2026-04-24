package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Document(collection = "categories")
@Data
public class Category {
    @Id
    private String id;

    private String name;                // e.g., "Classrooms", "Labs", "Offices"
    private String description;
    private String parentId;            // For hierarchical categories
    private String icon;                // Icon name for UI
    private String color;               // Color code for UI
    private Integer resourceCount;      // Number of resources in this category
    private CategoryType type;          // FACILITY or ASSET
    private Boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum CategoryType {
        FACILITY, ASSET
    }
}