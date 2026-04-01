package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

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

    public enum Status {
        ACTIVE, OUT_OF_SERVICE
    }
}