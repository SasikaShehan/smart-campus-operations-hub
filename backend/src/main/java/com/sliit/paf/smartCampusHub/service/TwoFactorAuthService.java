package com.sliit.paf.smartCampusHub.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HmacAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrCodeGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;
import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public String generateSecret(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate secret using TOTP
        String secret = generateTotpSecret();
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(false);
        user.setVerified(false);
        userRepository.save(user);
        
        return secret;
    }

    public String generateQrCode(Long userId, String secret) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        QrData data = new QrData(user.getEmail(), "Smart Campus Hub", secret, "SmartCampusHub");
        
        try {
            ZxingPngQrCodeGenerator generator = new ZxingPngQrCodeGenerator();
            byte[] qrCodeImage = generator.generate(data);
            return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(qrCodeImage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public boolean verifyCode(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getTwoFactorSecret() == null) {
            return false;
        }

        TimeProvider timeProvider = new SystemTimeProvider();
        CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(HmacAlgorithm.SHA1),
                timeProvider
        );

        boolean isValid = verifier.isValidCode(user.getTwoFactorSecret(), code);
        
        if (isValid && !user.isTwoFactorEnabled()) {
            user.setTwoFactorEnabled(true);
            user.setVerified(true);
            userRepository.save(user);
        }
        
        return isValid;
    }

    public boolean enableTwoFactor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setTwoFactorEnabled(true);
        user.setVerified(true);
        userRepository.save(user);
        
        return true;
    }

    public boolean disableTwoFactor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setVerified(false);
        userRepository.save(user);
        
        return true;
    }

    public boolean isTwoFactorEnabled(String email) {
        return userRepository.findByEmail(email)
                .map(User::isTwoFactorEnabled)
                .orElse(false);
    }

    private String generateTotpSecret() {
        // Generate a random secret for TOTP
        byte[] buffer = new byte[20];
        new java.security.SecureRandom().nextBytes(buffer);
        return java.util.Base64.getEncoder().encodeToString(buffer)
                .replace("=", "")
                .replace("+", "-")
                .replace("/", "_");
    }
}