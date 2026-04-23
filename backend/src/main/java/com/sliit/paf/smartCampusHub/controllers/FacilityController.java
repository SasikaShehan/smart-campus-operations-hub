package com.sliit.paf.smartCampusHub.controllers;

import com.sliit.paf.smartCampusHub.dto.FacilityDTO;
import com.sliit.paf.smartCampusHub.model.Facility;
import com.sliit.paf.smartCampusHub.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    // Get all facilities (Anyone authenticated)
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getAllFacilities() {
        List<Facility> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(facilities);
    }

    // Get facility by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getFacilityById(@PathVariable Long id) {
        try {
            Facility facility = facilityService.getFacilityById(id);
            return ResponseEntity.ok(facility);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Search facilities with filters
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> searchFacilities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        
        List<Facility> facilities = facilityService.searchFacilities(type, minCapacity, location, status);
        return ResponseEntity.ok(facilities);
    }

    // Get facilities by type
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getFacilitiesByType(@PathVariable String type) {
        List<Facility> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(facilities);
    }

    // Get active facilities only
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getActiveFacilities() {
        List<Facility> facilities = facilityService.getActiveFacilities();
        return ResponseEntity.ok(facilities);
    }

    // Create new facility (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFacility(@RequestBody FacilityDTO dto) {
        try {
            Facility facility = facilityService.createFacility(dto);
            return ResponseEntity.ok(Map.of(
                "message", "Facility created successfully",
                "facility", facility
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update facility (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFacility(@PathVariable Long id, @RequestBody FacilityDTO dto) {
        try {
            Facility facility = facilityService.updateFacility(id, dto);
            return ResponseEntity.ok(Map.of(
                "message", "Facility updated successfully",
                "facility", facility
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update facility status (Admin only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFacilityStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Facility facility = facilityService.updateFacilityStatus(id, status);
            return ResponseEntity.ok(Map.of(
                "message", "Facility status updated",
                "facility", facility
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete facility (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFacility(@PathVariable Long id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.ok(Map.of("message", "Facility deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
