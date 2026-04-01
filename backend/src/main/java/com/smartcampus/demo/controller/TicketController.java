package com.smartcampus.demo.controller;

import com.smartcampus.demo.dto.TicketDTO;
import com.smartcampus.demo.entity.Comment;
import com.smartcampus.demo.entity.Ticket;
import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.service.TicketService;
import com.smartcampus.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @ModelAttribute TicketDTO dto,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        Ticket ticket = new Ticket();
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setContactDetails(dto.getContactDetails());

        // dto.getResourceId() is expected to be a valid resource ID (String)
        Ticket created = ticketService.createTicket(ticket, dto.getResourceId(), user.getId(), dto.getAttachments());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/my")
    public List<Ticket> getMyTickets(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ticketService.getTicketsByReporter(user.getId());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public List<Ticket> getAssignedTickets(@AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ticketService.getTicketsByAssignee(user.getId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
            @RequestParam Ticket.Status status,
            @RequestParam(required = false) String resolutionNotes,
            @AuthenticationPrincipal OAuth2User principal) {
        User updater = userService.getUserByEmail(principal.getAttribute("email"));
        Ticket updated = ticketService.updateTicketStatus(id, status, updater, resolutionNotes);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable String id,
            @RequestParam String assigneeId,
            @AuthenticationPrincipal OAuth2User principal) {
        User assigner = userService.getUserByEmail(principal.getAttribute("email"));
        Ticket updated = ticketService.assignTicket(id, assigneeId, assigner);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String id,
            @RequestParam String content,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        Comment comment = ticketService.addComment(id, user, content);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable String id) {
        return ticketService.getCommentsForTicket(id);
    }
}