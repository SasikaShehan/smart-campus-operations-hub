package com.smartcampus.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class TicketDTO {
    private String resourceId;
    private String category;
    private String description;
    private String priority;
    private String contactDetails;
    private List<MultipartFile> attachments;
}