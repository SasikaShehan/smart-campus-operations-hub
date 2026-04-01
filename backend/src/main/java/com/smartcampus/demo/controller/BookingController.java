package com.smartcampus.demo.controller;

import com.smartcampus.demo.dto.BookingRequestDTO;
import com.smartcampus.demo.entity.Booking;
import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.service.BookingService;
import com.smartcampus.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        Booking booking = new Booking();
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        Booking created = bookingService.createBooking(booking, user.getId(), dto.getResourceId());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return bookingService.getBookingsByUser(user.getId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approveBooking(@PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal OAuth2User principal) {
        User admin = userService.getUserByEmail(principal.getAttribute("email"));
        Booking approved = bookingService.approveBooking(id, reason, admin);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectBooking(@PathVariable String id,
            @RequestParam String reason,
            @AuthenticationPrincipal OAuth2User principal) {
        User admin = userService.getUserByEmail(principal.getAttribute("email"));
        Booking rejected = bookingService.rejectBooking(id, reason, admin);
        return ResponseEntity.ok(rejected);
    }
}