package com.sliit.paf.smartCampusHub.service;

import com.sliit.paf.smartCampusHub.dto.FacilityDTO;
import com.sliit.paf.smartCampusHub.model.Facility;
import com.sliit.paf.smartCampusHub.model.FacilityStatus;
import com.sliit.paf.smartCampusHub.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    // Create new facility (Admin only)
    @Transactional
    public Facility createFacility(FacilityDTO dto) {
        Facility facility = Facility.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .availabilitySchedule(dto.getAvailabilitySchedule())
                .imageUrl(dto.getImageUrl())
                .status(FacilityStatus.ACTIVE)
                .build();

        return facilityRepository.save(facility);
    }

    // Get all facilities
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    // Get facility by ID
    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
    }

    // Get facilities by type
    public List<Facility> getFacilitiesByType(String type) {
        return facilityRepository.findByType(type);
    }

    // Get facilities by location
    public List<Facility> getFacilitiesByLocation(String location) {
        return facilityRepository.findByLocationContaining(location);
    }

    // Get facilities by capacity
    public List<Facility> getFacilitiesByMinCapacity(Integer capacity) {
        return facilityRepository.findByCapacityGreaterThanEqual(capacity);
    }

    // Get active facilities only
    public List<Facility> getActiveFacilities() {
        return facilityRepository.findByStatus(FacilityStatus.ACTIVE);
    }

    // Search with filters
    public List<Facility> searchFacilities(String type, Integer minCapacity, String location, String status) {
        FacilityStatus facilityStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                facilityStatus = FacilityStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
        return facilityRepository.searchFacilities(type, minCapacity, location, facilityStatus);
    }

    // Update facility (Admin only)
    @Transactional
    public Facility updateFacility(Long id, FacilityDTO dto) {
        Facility facility = getFacilityById(id);

        facility.setName(dto.getName());
        facility.setType(dto.getType());
        facility.setCapacity(dto.getCapacity());
        facility.setLocation(dto.getLocation());
        facility.setDescription(dto.getDescription());
        facility.setAvailabilitySchedule(dto.getAvailabilitySchedule());
        facility.setImageUrl(dto.getImageUrl());

        return facilityRepository.save(facility);
    }

    // Update facility status (Admin only)
    @Transactional
    public Facility updateFacilityStatus(Long id, String status) {
        Facility facility = getFacilityById(id);
        facility.setStatus(FacilityStatus.valueOf(status.toUpperCase()));
        return facilityRepository.save(facility);
    }

    // Delete facility (Admin only)
    @Transactional
    public void deleteFacility(Long id) {
        Facility facility = getFacilityById(id);
        facilityRepository.delete(facility);
    }
}
