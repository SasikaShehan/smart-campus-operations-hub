package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.*;
import com.smartcampus.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {
    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private final String uploadDir = "uploads/";

    @Transactional
    public Ticket createTicket(Ticket ticket, String resourceId, String reporterId,
            List<MultipartFile> files) throws IOException {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setResourceId(resource.getId());
        ticket.setReporterId(reporter.getId());
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setAttachments(new ArrayList<>());
        ticket.setComments(new ArrayList<>());

        Ticket saved = ticketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);

                    Attachment attachment = new Attachment();
                    attachment.setFileName(file.getOriginalFilename());
                    attachment.setFilePath(filePath.toString());
                    attachment.setFileType(file.getContentType());
                    attachment.setFileSize(file.getSize());
                    saved.getAttachments().add(attachment);
                }
            }
            ticketRepository.save(saved);
        }

        return saved;
    }

    @Transactional
    public Ticket updateTicketStatus(String ticketId, Ticket.Status newStatus, User updater, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(java.time.LocalDateTime.now());

        if (resolutionNotes != null && !resolutionNotes.isEmpty()) {
            Comment comment = new Comment();
            comment.setUserId(updater.getId());
            comment.setContent("Status changed to " + newStatus + ": " + resolutionNotes);
            ticket.getComments().add(comment);
        }
        Ticket updated = ticketRepository.save(ticket);

        User reporter = userRepository.findById(ticket.getReporterId()).orElse(null);
        if (reporter != null) {
            notificationService.createNotification(reporter.getId(),
                    "Ticket Status Update",
                    "Your ticket #" + ticket.getId() + " status changed from " + oldStatus + " to " + newStatus,
                    "TICKET");
        }

        if (ticket.getAssigneeId() != null && !ticket.getAssigneeId().equals(ticket.getReporterId())) {
            User assignee = userRepository.findById(ticket.getAssigneeId()).orElse(null);
            if (assignee != null) {
                notificationService.createNotification(assignee.getId(),
                        "Ticket Status Update",
                        "Ticket #" + ticket.getId() + " status changed to " + newStatus,
                        "TICKET");
            }
        }
        return updated;
    }

    @Transactional
    public Ticket assignTicket(String ticketId, String assigneeId, User assigner) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssigneeId(assigneeId);
        Ticket updated = ticketRepository.save(ticket);

        User assignee = userRepository.findById(assigneeId).orElse(null);
        if (assignee != null) {
            notificationService.createNotification(assignee.getId(),
                    "Ticket Assigned",
                    "You have been assigned to ticket #" + ticket.getId() + ".",
                    "TICKET");
        }
        return updated;
    }

    public List<Ticket> getTicketsByReporter(String reporterId) {
        return ticketRepository.findByReporterId(reporterId);
    }

    public List<Ticket> getTicketsByAssignee(String assigneeId) {
        return ticketRepository.findByAssigneeId(assigneeId);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Transactional
    public Comment addComment(String ticketId, User user, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Comment comment = new Comment();
        comment.setUserId(user.getId());
        comment.setContent(content);
        ticket.getComments().add(comment);
        ticketRepository.save(ticket);

        if (!user.getId().equals(ticket.getReporterId())) {
            User reporter = userRepository.findById(ticket.getReporterId()).orElse(null);
            if (reporter != null) {
                notificationService.createNotification(reporter.getId(),
                        "New Comment on Ticket #" + ticket.getId(),
                        user.getName() + " commented: " + content,
                        "TICKET");
            }
        }
        if (ticket.getAssigneeId() != null && !user.getId().equals(ticket.getAssigneeId())) {
            User assignee = userRepository.findById(ticket.getAssigneeId()).orElse(null);
            if (assignee != null) {
                notificationService.createNotification(assignee.getId(),
                        "New Comment on Ticket #" + ticket.getId(),
                        user.getName() + " commented: " + content,
                        "TICKET");
            }
        }
        return comment;
    }

    public List<Comment> getCommentsForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return ticket.getComments();
    }
}