package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> findAll(String type, Integer capacity, String location) {
        type = (type != null && !type.isEmpty()) ? type : null;
        location = (location != null && !location.isEmpty()) ? location : null;
        capacity = (capacity != null && capacity <= 0) ? null : capacity;
        return resourceRepository.search(type, capacity, location);
    }

    public Page<Resource> findAllPaginated(String type, String category, String status, 
            String search, Pageable pageable) {
        return resourceRepository.findAll(type, category, status, search, pageable);
    }

    // ========== Advanced Search Methods ==========

    public Page<Resource> searchAll(String search, Pageable pageable) {
        return resourceRepository.searchAll(search, pageable);
    }

    public Page<Resource> advancedSearch(String search, String type, String status, Pageable pageable) {
        return resourceRepository.advancedSearch(search, type, status, pageable);
    }

    public List<String> getDistinctBuildings() {
        return resourceRepository.findAll().stream()
            .map(Resource::getBuilding)
            .filter(b -> b != null && !b.isEmpty())
            .distinct()
            .sorted()
            .toList();
    }

    public List<String> getDistinctFloors() {
        return resourceRepository.findAll().stream()
            .map(Resource::getFloor)
            .filter(f -> f != null && !f.isEmpty())
            .distinct()
            .sorted()
            .toList();
    }

    public List<String> getDistinctCategories() {
        return resourceRepository.findAll().stream()
            .map(Resource::getCategory)
            .filter(c -> c != null && !c.isEmpty())
            .distinct()
            .sorted()
            .toList();
    }

    public Resource findById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Resource save(Resource resource) {
        // Generate asset tag if not provided
        if (resource.getAssetTag() == null || resource.getAssetTag().isEmpty()) {
            resource.setAssetTag(generateAssetTag());
        }
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
        
        // Enhanced fields
        resource.setCategory(resourceDetails.getCategory());
        resource.setSubCategory(resourceDetails.getSubCategory());
        resource.setAssetTag(resourceDetails.getAssetTag());
        resource.setPurchaseDate(resourceDetails.getPurchaseDate());
        resource.setWarrantyExpiry(resourceDetails.getWarrantyExpiry());
        resource.setValue(resourceDetails.getValue());
        resource.setCondition(resourceDetails.getCondition());
        resource.setAssignedTo(resourceDetails.getAssignedTo());
        resource.setDescription(resourceDetails.getDescription());
        resource.setImages(resourceDetails.getImages());
        resource.setFloor(resourceDetails.getFloor());
        resource.setBuilding(resourceDetails.getBuilding());
        resource.setSerialNumber(resourceDetails.getSerialNumber());
        resource.setManufacturer(resourceDetails.getManufacturer());
        resource.setModel(resourceDetails.getModel());
        resource.setLastMaintenanceDate(resourceDetails.getLastMaintenanceDate());
        resource.setMaintenanceNotes(resourceDetails.getMaintenanceNotes());
        
        return resourceRepository.save(resource);
    }

    public void delete(String id) {
        Resource resource = findById(id);
        resourceRepository.delete(resource);
    }

    // ========== Asset Tracking Methods ==========

    public List<Resource> findByCategory(String category) {
        return resourceRepository.findByCategory(category);
    }

    public List<Resource> findByStatus(Resource.Status status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> findAvailable() {
        return resourceRepository.findByStatus(Resource.Status.ACTIVE);
    }

    public List<Resource> findByAssetTag(String assetTag) {
        return resourceRepository.findByAssetTag(assetTag);
    }

    public List<Resource> findByAssignedTo(String assignedTo) {
        return resourceRepository.findByAssignedTo(assignedTo);
    }

    public Resource assign(String id, String assignedTo) {
        Resource resource = findById(id);
        resource.setAssignedTo(assignedTo);
        return resourceRepository.save(resource);
    }

    public Resource unassign(String id) {
        Resource resource = findById(id);
        resource.setAssignedTo(null);
        return resourceRepository.save(resource);
    }

    public Resource updateCondition(String id, Resource.Condition condition) {
        Resource resource = findById(id);
        resource.setCondition(condition);
        return resourceRepository.save(resource);
    }

    public Resource updateStatus(String id, Resource.Status status) {
        Resource resource = findById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    public List<Resource> findByCondition(Resource.Condition condition) {
        return resourceRepository.findByCondition(condition);
    }

    public List<Resource> findMaintenanceDue() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return resourceRepository.findByWarrantyExpiryBefore(thirtyDaysFromNow);
    }

    public List<Resource> findByBuilding(String building) {
        return resourceRepository.findByBuilding(building);
    }

    public List<Resource> findByFloor(String floor) {
        return resourceRepository.findByFloor(floor);
    }

    private String generateAssetTag() {
        long count = resourceRepository.count() + 1;
        return String.format("FAC-%04d", count);
    }
}