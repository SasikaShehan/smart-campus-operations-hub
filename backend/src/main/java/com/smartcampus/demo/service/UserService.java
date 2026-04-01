package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.exception.ResourceNotFoundException;
import com.smartcampus.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findOrCreateUser(String email, String name, String pictureUrl) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setPictureUrl(pictureUrl);
        newUser.setRole(User.Role.USER);
        return userRepository.save(newUser);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUserByEmail(String email) {
        return findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User updateUserRole(String userId, User.Role newRole) {
        User user = findById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deleteUser(String userId) {
        User user = findById(userId);
        userRepository.delete(user);
    }
}