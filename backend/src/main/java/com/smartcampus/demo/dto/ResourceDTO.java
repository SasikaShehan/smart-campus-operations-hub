package com.smartcampus.demo.dto;

import com.smartcampus.demo.entity.Resource;
import lombok.Data;

@Data
public class ResourceDTO {
    private String id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private Resource.Status status;

    public static ResourceDTO fromEntity(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setStatus(resource.getStatus());
        return dto;
    }
}