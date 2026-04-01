package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> findAll(String type, Integer capacity, String location) {
        // Convert empty strings to null for the query
        type = (type != null && !type.isEmpty()) ? type : null;
        location = (location != null && !location.isEmpty()) ? location : null;
        capacity = (capacity != null && capacity <= 0) ? null : capacity;
        return resourceRepository.search(type, capacity, location);
    }

    public Resource findById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Resource save(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource update(String id, Resource resourceDetails) {
        Resource resource = findById(id);
        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        resource.setStatus(resourceDetails.getStatus());
        return resourceRepository.save(resource);
    }

    public void delete(String id) {
        Resource resource = findById(id);
        resourceRepository.delete(resource);
    }
}