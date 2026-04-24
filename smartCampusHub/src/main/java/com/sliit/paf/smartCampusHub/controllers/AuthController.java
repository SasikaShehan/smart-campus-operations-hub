package com.sliit.paf.smartCampusHub.controllers;

import com.sliit.paf.smartCampusHub.dto.LoginDTO;
import com.sliit.paf.smartCampusHub.dto.RegisterDTO;
import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .provider("LOCAL")
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElse(null);

        if (user == null || user.getPassword() == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }

    @GetMapping("/google")
    public void loginWithGoogle(@RequestParam("role") String role, HttpServletResponse response) throws IOException {
        // Store the desired role in a cookie for the OAuth2 process to pick up
        Cookie roleCookie = new Cookie("desired_role", role);
        roleCookie.setPath("/");
        roleCookie.setMaxAge(300); // 5 minutes
        roleCookie.setHttpOnly(true);
        response.addCookie(roleCookie);
        
        // Redirect to the standard Spring Security OAuth2 authorization endpoint
        response.sendRedirect("/oauth2/authorization/google");
    }
}
