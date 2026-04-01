package com.smartcampus.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    private String resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}