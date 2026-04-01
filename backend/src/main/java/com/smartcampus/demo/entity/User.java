package com.smartcampus.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Document(collection = "users")
@Data
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;
    private String pictureUrl;
    private Role role = Role.USER;

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}