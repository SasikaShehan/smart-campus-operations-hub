package com.sliit.paf.smartCampusHub.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import com.sliit.paf.smartCampusHub.service.JwtService;

import java.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler{

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // FIXED: Use orElseThrow instead of .get()
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        String token = jwtService.generateToken(user);
        
        // Get role from user
        String role = user.getRole();

        response.sendRedirect("http://localhost:8080/oauth-success?token=" + token + "&role=" + role);
    }

}
