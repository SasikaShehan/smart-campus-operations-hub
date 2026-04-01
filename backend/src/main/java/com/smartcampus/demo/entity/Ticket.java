package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
public class Ticket {
    @Id
    private String id;

    private String resourceId;
    private String reporterId;
    private String assigneeId;

    private String category;
    private String description;
    private String priority;
    private String contactDetails;
    private Status status = Status.OPEN;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    private List<Attachment> attachments = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}