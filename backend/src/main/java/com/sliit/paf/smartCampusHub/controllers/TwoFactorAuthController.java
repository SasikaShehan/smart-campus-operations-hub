package com.sliit.paf.smartCampusHub.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.TwoFactorAuthService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/2fa")
@RequiredArgsConstructor
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    @PostMapping("/setup")
    public ResponseEntity<?> setup2FA(Authentication authentication) {
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate secret
        String secret = twoFactorAuthService.generateSecret(user.getId());
        
        // Generate QR code
        String qrCode = twoFactorAuthService.generateQrCode(user.getId(), secret);
        
        return ResponseEntity.ok(Map.of(
                "secret", secret,
                "qrCode", qrCode,
                "message", "Scan the QR code with your authenticator app"
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> request, 
                                       Authentication authentication) {
        String email = authentication.getName();
        String code = request.get("code");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isValid = twoFactorAuthService.verifyCode(user.getId(), code);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Two-factor authentication enabled successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid verification code"
            ));
        }
    }

    @PostMapping("/enable")
    public ResponseEntity<?> enable2FA(Authentication authentication) {
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean enabled = twoFactorAuthService.enableTwoFactor(user.getId());
        
        return ResponseEntity.ok(Map.of(
                "success", enabled,
                "message", "Two-factor authentication enabled"
        ));
    }

    @PostMapping("/disable")
    public ResponseEntity<?> disable2FA(@RequestBody Map<String, String> request,
                                         Authentication authentication) {
        String email = authentication.getName();
        String code = request.get("code");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify before disabling
        boolean isValid = twoFactorAuthService.verifyCode(user.getId(), code);
        
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid verification code"
            ));
        }
        
        boolean disabled = twoFactorAuthService.disableTwoFactor(user.getId());
        
        return ResponseEntity.ok(Map.of(
                "success", disabled,
                "message", "Two-factor authentication disabled"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> get2FAStatus(Authentication authentication) {
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(Map.of(
                "enabled", user.isTwoFactorEnabled(),
                "verified", user.isVerified()
        ));
    }
}