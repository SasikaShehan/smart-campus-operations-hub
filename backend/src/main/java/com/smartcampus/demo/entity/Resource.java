package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "resources")
@Data
public class Resource {
    @Id
    private String id;

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private Status status = Status.ACTIVE;

    // Enhanced fields for Facilities & Assets Catalogue
    private String category;              // e.g., "Classroom", "Lab", "Office", "Equipment"
    private String subCategory;           // e.g., "Computer Lab", "Physics Lab", "Meeting Room"
    private String assetTag;              // Unique identifier: FAC-001, FAC-002
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private BigDecimal value;             // Asset value in currency
    private Condition condition;          // NEW, GOOD, FAIR, POOR
    private String assignedTo;             // User ID or Department ID
    private String description;
    private List<String> images;
    private String floor;
    private String building;
    private String serialNumber;
    private String manufacturer;
    private String model;
    private LocalDate lastMaintenanceDate;
    private String maintenanceNotes;

    public enum Status {
        ACTIVE, OUT_OF_SERVICE, UNDER_MAINTENANCE, RESERVED
    }

    public enum Condition {
        NEW, GOOD, FAIR, POOR
    }
}