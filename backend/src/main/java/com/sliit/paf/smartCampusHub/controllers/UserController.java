package com.sliit.paf.smartCampusHub.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final Set<String> VALID_ROLES =
            Set.of("ADMIN", "MANAGER", "STUDENT", "LECTURER", "TECHNICIAN");

    private final UserRepository userRepository;

    /** GET /api/user/profile — current logged-in user's profile */
    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(toMap(user));
    }

    /** GET /api/user/all — list all users (ADMIN only) */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * PATCH /api/user/{id}/role — change a user's role (ADMIN only)
     * Body: { "role": "TECHNICIAN" }
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable Long id,
                                        @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || !VALID_ROLES.contains(newRole.toUpperCase())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Must be one of: " + VALID_ROLES));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "message", "Role updated successfully",
            "user", toMap(user)
        ));
    }

    private Map<String, Object> toMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",    user.getId());
        m.put("name",  user.getName());
        m.put("email", user.getEmail());
        m.put("role",  user.getRole());
        return m;
    }
}
