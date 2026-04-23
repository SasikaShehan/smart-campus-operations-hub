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
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = super.loadUser(request);

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String role = determineRole(email);
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

        // Update role if it has changed in application.properties
        String currentConfigRole = determineRole(email);
        if (!user.getRole().equals(currentConfigRole)) {
            user.setRole(currentConfigRole);
            userRepository.save(user);
        }

        return oauthUser;
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
