package com.sliit.paf.smartCampusHub.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import com.sliit.paf.smartCampusHub.service.TimeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TimeController {
    private final TimeService timeService;

    @GetMapping("/api/time")
    public LocalDateTime getTime() {
        return timeService.getCurrentTime();
    }
}
