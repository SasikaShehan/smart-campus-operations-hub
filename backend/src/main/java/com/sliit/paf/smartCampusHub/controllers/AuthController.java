package com.sliit.paf.smartCampusHub.controllers;

import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.FirebaseTokenVerifier;
import com.sliit.paf.smartCampusHub.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${student.email:}")
    private String studentEmail;

    @Value("${lecturer.email:}")
    private String lecturerEmail;

    @Value("${technician.email:}")
    private String technicianEmail;

    @Value("${manager.email:}")
    private String managerEmail;

    /**
     * POST /api/auth/firebase
     * Body: { "idToken": "<firebase_id_token>" }
     * Verifies the Firebase ID token via Google's public JWK keys (no service account needed).
     * Returns a signed JWT for subsequent API requests.
     */
    @PostMapping("/firebase")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");

        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
        }

        try {
            // Verify Firebase ID token using Google's public JWK endpoint
            Map<String, Object> claims = firebaseTokenVerifier.verifyIdToken(idToken);

            String email = (String) claims.get("email");
            String name  = (String) claims.get("name");
            String uid   = (String) claims.get("sub");

            if (email == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email not found in token"));
            }

            // Find or create user in DB
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        String role = determineRole(email);
                        return userRepository.save(
                            User.builder()
                                    .name(name != null ? name : email)
                                    .email(email)
                                    .role(role)
                                    .provider("GOOGLE")
                                    .providerId(uid)
                                    .build()
                        );
                    });

            // Sync role if config changed
            String configRole = determineRole(email);
            if (!user.getRole().equals(configRole)) {
                user.setRole(configRole);
                userRepository.save(user);
            }

            // Generate our own JWT
            String jwt = jwtService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "role",  user.getRole(),
                "email", user.getEmail(),
                "name",  user.getName()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token verification failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/auth/register
     * Body: { "name": "...", "email": "...", "password": "..." }
     * Creates a LOCAL user account with a BCrypt-hashed password.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name     = body.get("name");
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        String role = determineRole(email);
        User user = userRepository.save(
            User.builder()
                .name(name != null && !name.isBlank() ? name : email.split("@")[0])
                .email(email)
                .role(role)
                .provider("LOCAL")
                .passwordHash(passwordEncoder.encode(password))
                .build()
        );

        String jwt = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of(
            "token", jwt,
            "role",  user.getRole(),
            "email", user.getEmail(),
            "name",  user.getName()
        ));
    }

    /**
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     * Verifies BCrypt password and returns a signed JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginWithPassword(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        User user = userRepository.findByEmail(email)
            .orElse(null);

        if (user == null || user.getPasswordHash() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        // Sync role if config changed
        String configRole = determineRole(email);
        if (!user.getRole().equals(configRole)) {
            user.setRole(configRole);
            userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of(
            "token", jwt,
            "role",  user.getRole(),
            "email", user.getEmail(),
            "name",  user.getName()
        ));
    }

    private String determineRole(String email) {
        if (email.equals(adminEmail))      return "ADMIN";
        if (email.equals(studentEmail))    return "STUDENT";
        if (email.equals(lecturerEmail))   return "LECTURER";
        if (email.equals(technicianEmail)) return "TECHNICIAN";
        if (email.equals(managerEmail))    return "MANAGER";
        return "STUDENT";
    }
}
