package com.sliit.paf.smartCampusHub.repository;

import com.sliit.paf.smartCampusHub.model.Ticket;
import com.sliit.paf.smartCampusHub.model.TicketPriority;
import com.sliit.paf.smartCampusHub.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get tickets by reporter
    List<Ticket> findByReportedById(Long userId);

    // Get tickets by assigned technician
    List<Ticket> findByAssignedToId(Long technicianId);

    // Get tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    // Get tickets by priority
    List<Ticket> findByPriority(TicketPriority priority);

    // Get tickets by category
    List<Ticket> findByCategory(String category);

    // Get open tickets (not closed or rejected)
    @Query("SELECT t FROM Ticket t WHERE t.status != 'CLOSED' AND t.status != 'REJECTED' ORDER BY t.priority DESC, t.createdAt ASC")
    List<Ticket> findOpenTickets();

    // Get tickets for technician: open/in-progress ones + all their own assigned tickets
    @Query("SELECT t FROM Ticket t WHERE (t.status = 'OPEN' OR t.status = 'IN_PROGRESS') OR (t.assignedTo.id = :techId) ORDER BY t.createdAt DESC")
    List<Ticket> findTicketsForTechnician(@Param("techId") Long techId);

    // Get tickets assigned to technician with status
    List<Ticket> findByAssignedToIdAndStatus(Long technicianId, TicketStatus status);

    // Get tickets by date range
    @Query("SELECT t FROM Ticket t WHERE t.createdAt BETWEEN :start AND :end")
    List<Ticket> findTicketsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Get unresolved tickets count
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status != 'CLOSED' AND t.status != 'RESOLVED' AND t.status != 'REJECTED'")
    long countUnresolvedTickets();

    // Get tickets by resource
    List<Ticket> findByResourceName(String resourceName);
}
