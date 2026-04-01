package com.smartcampus.demo.controller;

import com.smartcampus.demo.dto.NotificationDTO;
import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.service.NotificationService;
import com.smartcampus.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

        @Autowired
        private NotificationService notificationService;

        @Autowired
        private UserService userService;

        @GetMapping
        public List<NotificationDTO> getNotifications(@AuthenticationPrincipal OAuth2User principal) {
                User user = userService.getUserByEmail(principal.getAttribute("email"));
                return notificationService.getAllNotifications(user.getId()).stream()
                                .map(NotificationDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        @GetMapping("/unread")
        public List<NotificationDTO> getUnreadNotifications(@AuthenticationPrincipal OAuth2User principal) {
                User user = userService.getUserByEmail(principal.getAttribute("email"));
                return notificationService.getUnreadNotifications(user.getId()).stream()
                                .map(NotificationDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        @PutMapping("/{id}/read")
        public ResponseEntity<Void> markAsRead(@PathVariable String id,
                        @AuthenticationPrincipal OAuth2User principal) {
                User user = userService.getUserByEmail(principal.getAttribute("email"));
                notificationService.markAsRead(id, user.getId());
                return ResponseEntity.ok().build();
        }
}