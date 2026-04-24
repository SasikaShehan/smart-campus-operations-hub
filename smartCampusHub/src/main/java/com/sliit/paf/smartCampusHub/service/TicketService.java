package com.sliit.paf.smartCampusHub.service;

import com.sliit.paf.smartCampusHub.dto.TicketDTO;
import com.sliit.paf.smartCampusHub.model.*;
import com.sliit.paf.smartCampusHub.repository.TicketRepository;
import com.sliit.paf.smartCampusHub.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;
    private final com.sliit.paf.smartCampusHub.repository.CommentRepository commentRepository;

    private static final int MAX_ATTACHMENTS = 3;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    // Add comment to ticket
    @Transactional
    public Comment addComment(Long ticketId, String content, User user) {
        Ticket ticket = getTicketById(ticketId);
        
        Comment comment = Comment.builder()
                .content(content)
                .author(user)
                .ticket(ticket)
                .build();
        
        return commentRepository.save(comment);
    }

    // Create a new ticket
    @Transactional
    public Ticket createTicket(TicketDTO dto, User user) {
        // Validate attachments
        if (dto.getAttachments() != null && dto.getAttachments().size() > MAX_ATTACHMENTS) {
            throw new RuntimeException("Maximum " + MAX_ATTACHMENTS + " attachments allowed");
        }

        // Create ticket
        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(TicketPriority.valueOf(dto.getPriority().toUpperCase()))
                .status(TicketStatus.OPEN)
                .location(dto.getLocation())
                .resourceName(dto.getResourceName())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .reportedBy(user)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // Upload attachments to Cloudinary
        if (dto.getAttachments() != null) {
            for (MultipartFile file : dto.getAttachments()) {
                if (!file.isEmpty()) {
                    validateAndUploadAttachment(file, savedTicket);
                }
            }
        }

        // Notify managers/technicians
        notificationService.notifyManagers("New ticket created", 
                "Ticket #" + savedTicket.getId() + ": " + savedTicket.getTitle());

        return savedTicket;
    }

    // Validate and upload attachment to Cloudinary
    private void validateAndUploadAttachment(MultipartFile file, Ticket ticket) {
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 5MB limit");
        }

        // Validate file type
        String[] allowedTypes = {"image/jpeg", "image/png", "image/jpg", "image/gif"};
        boolean isValidType = false;
        for (String type : allowedTypes) {
            if (file.getContentType().equals(type)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new RuntimeException("Only image files are allowed (JPEG, PNG, GIF)");
        }

        try {
            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file);
            
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            
            // Create attachment record
            Attachment attachment = Attachment.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl(url)
                    .publicId(publicId)  // ✅ Store public ID for deletion
                    .ticket(ticket)
                    .build();
            
            ticket.getAttachments().add(attachment);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    // Delete attachment from ticket (Admin only)
    @Transactional
    public void deleteAttachment(Long ticketId, Long attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        
        Attachment attachment = ticket.getAttachments().stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        
        try {
            // Delete from Cloudinary
            if (attachment.getPublicId() != null) {
                cloudinaryService.deleteImage(attachment.getPublicId());
            }
            
            // Remove from database
            ticket.getAttachments().remove(attachment);
            ticketRepository.save(ticket);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image: " + e.getMessage());
        }
    }

    // Get ticket by ID
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    // Get all tickets (Admin)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Get user's own tickets
    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepository.findByReportedById(userId);
    }

    // Get technician's assigned tickets
    public List<Ticket> getTechnicianTickets(Long technicianId) {
        return ticketRepository.findByAssignedToId(technicianId);
    }

    // Get open tickets
    public List<Ticket> getOpenTickets() {
        return ticketRepository.findOpenTickets();
    }

    // Get tickets for technician dashboard
    public List<Ticket> getTicketsForTechnician(Long techId) {
        return ticketRepository.findTicketsForTechnician(techId);
    }

    // Assign technician to ticket
    @Transactional
    public Ticket assignTechnician(Long ticketId, Long technicianId, UserRepository userRepository) {
        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        ticket.setAssignedTo(technician);
        
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        notificationService.notifyUser(technician.getId(),
                "Ticket assigned", "You have been assigned to ticket #" + ticketId);
        
        return updatedTicket;
    }

    // Update ticket status
    @Transactional
    public Ticket updateStatus(Long ticketId, String status, String notes) {
        Ticket ticket = getTicketById(ticketId);
        TicketStatus newStatus = TicketStatus.valueOf(status.toUpperCase());
        
        ticket.setStatus(newStatus);
        
        
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        
        if (notes != null) {
            ticket.setResolutionNotes(notes);
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        notificationService.notifyUser(ticket.getReportedBy().getId(),
                "Ticket status updated", "Ticket #" + ticketId + " status: " + status);
        
        return updatedTicket;
    }

    // Technician rejects ticket — stores reason and sets REJECTED status
    @Transactional
    public Ticket technicianRejectTicket(Long ticketId, String reason) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason("rejected by technician: " + reason);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyManagers("Ticket rejected by technician",
                "Ticket #" + ticketId + " was rejected by technician. Reason: " + reason);
        notificationService.notifyUser(ticket.getReportedBy().getId(),
                "Ticket rejected by technician", "Your ticket was rejected. Reason: " + reason);
        return saved;
    }

    // Reject ticket (Admin only)
    @Transactional
    public Ticket rejectTicket(Long ticketId, String reason) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason("admin rejected: " + reason);
        Ticket rejectedTicket = ticketRepository.save(ticket);
        
        notificationService.notifyUser(ticket.getReportedBy().getId(),
                "Ticket rejected by admin", "Your ticket was rejected. Reason: " + reason);
        
        return rejectedTicket;
    }

    // Add resolution notes (Technician)
    @Transactional
    public Ticket addResolutionNotes(Long ticketId, String notes) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setResolutionNotes(notes);
        
        if (ticket.getStatus() == TicketStatus.IN_PROGRESS) {
            ticket.setStatus(TicketStatus.RESOLVED);
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        return ticketRepository.save(ticket);
    }

    // Get tickets by status
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(TicketStatus.valueOf(status.toUpperCase()));
    }

    // Get tickets by priority
    public List<Ticket> getTicketsByPriority(String priority) {
        return ticketRepository.findByPriority(TicketPriority.valueOf(priority.toUpperCase()));
    }

    // Get tickets by category
    public List<Ticket> getTicketsByCategory(String category) {
        return ticketRepository.findByCategory(category);
    }

    // Get ticket statistics
    public Map<String, Object> getTicketStats() {
        List<Ticket> allTickets = ticketRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickets", allTickets.size());
        stats.put("open", allTickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count());
        stats.put("inProgress", allTickets.stream().filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS).count());
        stats.put("resolved", allTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count());
        stats.put("closed", allTickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count());
        stats.put("rejected", allTickets.stream().filter(t -> t.getStatus() == TicketStatus.REJECTED).count());
        
        return stats;
    }
}
