package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
public class Notification {
    @Id
    private String id;

    private String userId; // reference
    private String title;
    private String message;
    private boolean read = false;
    private String type;
    private LocalDateTime createdAt = LocalDateTime.now();
}