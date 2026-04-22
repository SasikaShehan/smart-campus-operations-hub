package com.smartcampus.demo.controller;

import com.smartcampus.demo.entity.Booking;
import com.smartcampus.demo.entity.Ticket;
import com.smartcampus.demo.service.BookingService;
import com.smartcampus.demo.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TicketService ticketService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Booking> allBookings = bookingService.getAllBookings();
        List<Ticket> allTickets = ticketService.getAllTickets();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", allBookings.size());
        stats.put("pendingBookings", allBookings.stream().filter(b -> b.getStatus() == Booking.Status.PENDING).count());
        stats.put("totalTickets", allTickets.size());
        stats.put("openTickets", allTickets.stream().filter(t -> t.getStatus() == Ticket.Status.OPEN).count());
        
        // Resource utilization simplified
        Map<String, Long> resourceUsage = new HashMap<>();
        allBookings.forEach(b -> {
            resourceUsage.put(b.getResourceId(), resourceUsage.getOrDefault(b.getResourceId(), 0L) + 1);
        });
        stats.put("resourceUtilization", resourceUsage);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/tickets")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }
}
