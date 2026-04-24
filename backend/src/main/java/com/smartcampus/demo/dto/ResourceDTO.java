package com.smartcampus.demo.dto;

import com.smartcampus.demo.entity.Resource;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ResourceDTO {
    private String id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private Resource.Status status;

    // Enhanced fields for Facilities & Assets Catalogue
    private String category;
    private String subCategory;
    private String assetTag;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private BigDecimal value;
    private Resource.Condition condition;
    private String assignedTo;
    private String description;
    private List<String> images;
    private String floor;
    private String building;
    private String serialNumber;
    private String manufacturer;
    private String model;
    private LocalDate lastMaintenanceDate;
    private String maintenanceNotes;

    public static ResourceDTO fromEntity(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setStatus(resource.getStatus());
        
        // Enhanced fields
        dto.setCategory(resource.getCategory());
        dto.setSubCategory(resource.getSubCategory());
        dto.setAssetTag(resource.getAssetTag());
        dto.setPurchaseDate(resource.getPurchaseDate());
        dto.setWarrantyExpiry(resource.getWarrantyExpiry());
        dto.setValue(resource.getValue());
        dto.setCondition(resource.getCondition());
        dto.setAssignedTo(resource.getAssignedTo());
        dto.setDescription(resource.getDescription());
        dto.setImages(resource.getImages());
        dto.setFloor(resource.getFloor());
        dto.setBuilding(resource.getBuilding());
        dto.setSerialNumber(resource.getSerialNumber());
        dto.setManufacturer(resource.getManufacturer());
        dto.setModel(resource.getModel());
        dto.setLastMaintenanceDate(resource.getLastMaintenanceDate());
        dto.setMaintenanceNotes(resource.getMaintenanceNotes());
        
        return dto;
    }
}