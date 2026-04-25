package com.sliit.paf.smartCampusHub.security;

import java.io.IOException;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Endpoints that don't require 2FA verification
    private static final String[] NO_2FA_ENDPOINTS = {
        "/api/2fa/setup",
        "/api/2fa/verify",
        "/api/2fa/enable",
        "/api/2fa/disable",
        "/api/2fa/status"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String email = jwtService.extractUsername(jwt);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            var user = userRepository.findByEmail(email).orElse(null);

            if (user != null && jwtService.isTokenValid(jwt, user)) {
                // Check if 2FA is enabled and verified
                if (user.isTwoFactorEnabled() && user.isVerified()) {
                    // For 2FA enabled users, require 2FA verification header
                    String twoFactorCode = request.getHeader("X-2FA-Code");
                    if (twoFactorCode == null || twoFactorCode.isEmpty()) {
                        response.setStatus(401);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Two-factor authentication required\"}");
                        return;
                    }
                }
                
                //  Pass the user object to assign the correct role
                var authToken = jwtService.getAuthentication(jwt, user);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
