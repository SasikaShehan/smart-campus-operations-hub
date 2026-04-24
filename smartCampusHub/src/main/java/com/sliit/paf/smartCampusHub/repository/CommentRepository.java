package com.sliit.paf.smartCampusHub.repository;

import com.sliit.paf.smartCampusHub.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    List<Comment> findByAuthorId(Long authorId);
}
