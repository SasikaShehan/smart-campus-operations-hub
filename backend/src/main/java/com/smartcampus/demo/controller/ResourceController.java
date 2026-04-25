package com.smartcampus.demo.controller;

import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public List<Resource> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location) {
        return resourceService.findAll(type, capacity, location);
    }

    @GetMapping("/paginated")
    public Page<Resource> getResourcesPaginated(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return resourceService.findAllPaginated(type, category, status, search, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResource(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.save(resource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateResource(@PathVariable String id, @RequestBody Resource resource) {
        return resourceService.update(id, resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteResource(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Asset Tracking Endpoints ==========

    @GetMapping("/available")
    public List<Resource> getAvailableResources() {
        return resourceService.findAvailable();
    }

    @GetMapping("/category/{category}")
    public List<Resource> getResourcesByCategory(@PathVariable String category) {
        return resourceService.findByCategory(category);
    }

    @GetMapping("/status/{status}")
    public List<Resource> getResourcesByStatus(@PathVariable Resource.Status status) {
        return resourceService.findByStatus(status);
    }

    @GetMapping("/assigned-to/{assignedTo}")
    public List<Resource> getResourcesByAssignee(@PathVariable String assignedTo) {
        return resourceService.findByAssignedTo(assignedTo);
    }

    @GetMapping("/condition/{condition}")
    public List<Resource> getResourcesByCondition(@PathVariable Resource.Condition condition) {
        return resourceService.findByCondition(condition);
    }

    @GetMapping("/building/{building}")
    public List<Resource> getResourcesByBuilding(@PathVariable String building) {
        return resourceService.findByBuilding(building);
    }

    @GetMapping("/floor/{floor}")
    public List<Resource> getResourcesByFloor(@PathVariable String floor) {
        return resourceService.findByFloor(floor);
    }

    @GetMapping("/maintenance-due")
    public List<Resource> getMaintenanceDue() {
        return resourceService.findMaintenanceDue();
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource assignResource(@PathVariable String id, @RequestBody Map<String, String> request) {
        String assignedTo = request.get("assignedTo");
        return resourceService.assign(id, assignedTo);
    }

    @PutMapping("/{id}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource unassignResource(@PathVariable String id) {
        return resourceService.unassign(id);
    }

    @PutMapping("/{id}/condition")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateCondition(@PathVariable String id, @RequestBody Map<String, String> request) {
        Resource.Condition condition = Resource.Condition.valueOf(request.get("condition"));
        return resourceService.updateCondition(id, condition);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        Resource.Status status = Resource.Status.valueOf(request.get("status"));
        return resourceService.updateStatus(id, status);
    }

    // ========== Statistics Endpoint ==========

    @GetMapping("/stats")
    public Map<String, Object> getResourceStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", resourceService.findAll(null, null, null).size());
        stats.put("available", resourceService.findAvailable().size());
        stats.put("byStatus", Map.of(
            "ACTIVE", resourceService.findByStatus(Resource.Status.ACTIVE).size(),
            "OUT_OF_SERVICE", resourceService.findByStatus(Resource.Status.OUT_OF_SERVICE).size(),
            "UNDER_MAINTENANCE", resourceService.findByStatus(Resource.Status.UNDER_MAINTENANCE).size(),
            "RESERVED", resourceService.findByStatus(Resource.Status.RESERVED).size()
        ));
        stats.put("maintenanceDue", resourceService.findMaintenanceDue().size());
        return stats;
    }

    // ========== Search & Filter Endpoints ==========

    @GetMapping("/search")
    public Page<Resource> searchResources(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return resourceService.searchAll(search, pageable);
    }

    @GetMapping("/advanced-search")
    public Page<Resource> advancedSearch(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return resourceService.advancedSearch(search, type, status, pageable);
    }

    @GetMapping("/filter-options")
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("buildings", resourceService.getDistinctBuildings());
        options.put("floors", resourceService.getDistinctFloors());
        options.put("categories", resourceService.getDistinctCategories());
        return options;
    }

    // ========== Bulk Operations Endpoints ==========

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Resource> bulkCreate(@RequestBody List<Resource> resources) {
        return resourceService.bulkCreate(resources);
    }

    @PutMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Resource> bulkUpdate(@RequestBody List<Resource> resources) {
        return resourceService.bulkUpdate(resources);
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkDelete(@RequestBody List<String> ids) {
        resourceService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/bulk/status")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Resource> bulkUpdateStatus(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");
        Resource.Status status = Resource.Status.valueOf((String) request.get("status"));
        return resourceService.bulkUpdateStatus(ids, status);
    }

    @PutMapping("/bulk/condition")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Resource> bulkUpdateCondition(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");
        Resource.Condition condition = Resource.Condition.valueOf((String) request.get("condition"));
        return resourceService.bulkUpdateCondition(ids, condition);
    }
}