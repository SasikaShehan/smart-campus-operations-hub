package com.smartcampus.demo.dto;

import com.smartcampus.demo.entity.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String id;
    private String title;
    private String message;
    private boolean read;
    private String type;
    private LocalDateTime createdAt;

    public static NotificationDTO fromEntity(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setType(notification.getType());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}