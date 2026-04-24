package com.sliit.paf.smartCampusHub.controllers;

import com.sliit.paf.smartCampusHub.dto.CommentDTO;
import com.sliit.paf.smartCampusHub.model.Comment;
import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    // Add comment to ticket
    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> addComment(@PathVariable Long ticketId, 
                                        @RequestBody @jakarta.validation.Valid CommentDTO dto,
                                        Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            Comment comment = commentService.addComment(ticketId, dto, user);
            return ResponseEntity.ok(Map.of(
                "message", "Comment added successfully",
                "comment", comment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get comments for a ticket
    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getTicketComments(@PathVariable Long ticketId) {
        List<Comment> comments = commentService.getTicketComments(ticketId);
        return ResponseEntity.ok(comments);
    }

    // Update comment
    @PutMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId,
                                           @RequestBody @jakarta.validation.Valid CommentDTO dto,
                                           Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            Comment comment = commentService.updateComment(commentId, dto, user);
            return ResponseEntity.ok(Map.of(
                "message", "Comment updated successfully",
                "comment", comment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete comment
    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication auth) {
        try {
            User user = getUserFromAuth(auth);
            commentService.deleteComment(commentId, user);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User getUserFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
