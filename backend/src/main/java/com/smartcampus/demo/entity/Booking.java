package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
public class Booking {
    @Id
    private String id;

    private String resourceId; // reference to Resource.id
    private String userId; // reference to User.id

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private Status status = Status.PENDING;
    private String rejectionReason;

    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}