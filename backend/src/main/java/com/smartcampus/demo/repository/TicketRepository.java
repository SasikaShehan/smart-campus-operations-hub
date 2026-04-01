package com.smartcampus.demo.repository;

import com.smartcampus.demo.entity.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReporterId(String reporterId);

    List<Ticket> findByAssigneeId(String assigneeId);

    List<Ticket> findByStatus(Ticket.Status status);
}