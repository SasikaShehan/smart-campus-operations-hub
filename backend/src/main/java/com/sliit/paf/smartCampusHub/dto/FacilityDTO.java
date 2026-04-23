package com.sliit.paf.smartCampusHub.dto;

import lombok.Data;

@Data
public class FacilityDTO {
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilitySchedule;
    private String imageUrl;
}
