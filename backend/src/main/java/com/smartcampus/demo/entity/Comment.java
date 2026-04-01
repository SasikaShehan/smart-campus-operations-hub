package com.smartcampus.demo.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Comment {
    private String userId; // reference
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}