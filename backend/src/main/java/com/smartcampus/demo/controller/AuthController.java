package com.smartcampus.demo.controller;

import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Map.of("authenticated", false);
        }
        User user = userService.findByEmail(principal.getAttribute("email")).orElse(null);
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("email", principal.getAttribute("email"));
        response.put("name", principal.getAttribute("name"));
        response.put("picture", principal.getAttribute("picture"));
        response.put("role", user != null ? user.getRole() : null);
        response.put("id", user != null ? user.getId() : null);
        return response;
    }
}