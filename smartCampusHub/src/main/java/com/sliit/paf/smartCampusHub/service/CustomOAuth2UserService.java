package com.sliit.paf.smartCampusHub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService{

    private final UserRepository userRepository;
    private final jakarta.servlet.http.HttpServletRequest request;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${student.email}")
    private String studentEmail;

    @Value("${lecturer.email}")
    private String lecturerEmail;

    @Value("${technician.email}")
    private String technicianEmail;

    @Value("${manager.email}")
    private String managerEmail;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = super.loadUser(userRequest);

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");

        // Check for desired role in cookie
        String desiredRole = getRoleFromCookie();

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String role = (desiredRole != null) ? desiredRole : determineRole(email);
                    return userRepository.save(
                        User.builder()
                                .name(name)
                                .email(email)
                                .role(role)
                                .provider("GOOGLE")
                                .providerId(providerId)
                                .build()
                    );
                });

        // Update role if it was explicitly requested via cookie or if it changed in config
        String roleToApply = (desiredRole != null) ? desiredRole : determineRole(email);
        if (!user.getRole().equals(roleToApply)) {
            user.setRole(roleToApply);
            userRepository.save(user);
        }

        return oauthUser;
    }

    private String getRoleFromCookie() {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("desired_role".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String determineRole(String email) {
        if (email.equals(adminEmail)) {
            return "ADMIN";
        } else if (email.equals(studentEmail)) {
            return "STUDENT";
        } else if (email.equals(lecturerEmail)) {
            return "LECTURER";
        } else if (email.equals(technicianEmail)) {
            return "TECHNICIAN";
        } else if (email.equals(managerEmail)) {
            return "MANAGER";
        } else {
            return "STUDENT";
        }
    }
}
