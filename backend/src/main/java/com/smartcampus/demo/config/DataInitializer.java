package com.smartcampus.demo.config;

import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.repository.ResourceRepository;
import com.smartcampus.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ResourceRepository resourceRepository, UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setEmail("admin@smartcampus.com");
                admin.setName("System Administrator");
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);

                User technician = new User();
                technician.setEmail("tech@smartcampus.com");
                technician.setName("Lead Technician");
                technician.setRole(User.Role.TECHNICIAN);
                userRepository.save(technician);
            }

            if (resourceRepository.count() == 0) {
                Resource lab1 = new Resource();
                lab1.setName("Computing Lab 01");
                lab1.setType("LAB");
                lab1.setCapacity(50);
                lab1.setLocation("Block A, Level 3");
                lab1.setStatus(Resource.Status.ACTIVE);
                lab1.setAvailabilityWindows("08:00-20:00");

                Resource hall = new Resource();
                hall.setName("Main Auditorium");
                hall.setType("HALL");
                hall.setCapacity(500);
                hall.setLocation("Main Building");
                hall.setStatus(Resource.Status.ACTIVE);
                hall.setAvailabilityWindows("09:00-22:00");

                Resource room = new Resource();
                room.setName("Conference Room B");
                room.setType("ROOM");
                room.setCapacity(12);
                room.setLocation("Block B, Level 1");
                room.setStatus(Resource.Status.ACTIVE);
                room.setAvailabilityWindows("08:00-18:00");

                resourceRepository.saveAll(List.of(lab1, hall, room));
            }
        };
    }
}
