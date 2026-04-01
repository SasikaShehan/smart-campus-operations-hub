package com.smartcampus.demo.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Attachment {
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt = LocalDateTime.now();
}