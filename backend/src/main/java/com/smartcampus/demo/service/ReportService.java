package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Map<String, Object> getResourceSummary() {
        List<Resource> resources = resourceRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("total", resources.size());
        summary.put("byStatus", getCountByStatus(resources));
        summary.put("byCondition", getCountByCondition(resources));
        summary.put("byType", getCountByField(resources, Resource::getType));
        summary.put("byCategory", getCountByField(resources, Resource::getCategory));
        
        return summary;
    }

    public Map<String, Object> getMaintenanceReport() {
        List<Resource> resources = resourceRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        
        List<Resource> warrantyExpiring = resources.stream()
            .filter(r -> r.getWarrantyExpiry() != null && r.getWarrantyExpiry().isBefore(thirtyDaysFromNow))
            .filter(r -> r.getWarrantyExpiry().isAfter(today))
            .collect(Collectors.toList());
        
        List<Resource> warrantyExpired = resources.stream()
            .filter(r -> r.getWarrantyExpiry() != null && r.getWarrantyExpiry().isBefore(today))
            .collect(Collectors.toList());
        
        List<Resource> maintenanceDue = resources.stream()
            .filter(r -> r.getLastMaintenanceDate() != null)
            .filter(r -> r.getLastMaintenanceDate().isBefore(today.minusMonths(6)))
            .collect(Collectors.toList());
        
        Map<String, Object> report = new HashMap<>();
        report.put("warrantyExpiringSoon", warrantyExpiring.size());
        report.put("warrantyExpired", warrantyExpired.size());
        report.put("maintenanceOverdue", maintenanceDue.size());
        report.put("warrantyExpiringList", warrantyExpiring);
        report.put("warrantyExpiredList", warrantyExpired);
        report.put("maintenanceOverdueList", maintenanceDue);
        
        return report;
    }

    public Map<String, Object> getAssetValueReport() {
        List<Resource> resources = resourceRepository.findAll();
        
        BigDecimal totalValue = resources.stream()
            .filter(r -> r.getValue() != null)
            .map(Resource::getValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, BigDecimal> valueByCategory = new HashMap<>();
        Map<String, BigDecimal> valueByBuilding = new HashMap<>();
        
        for (Resource resource : resources) {
            if (resource.getValue() != null) {
                String category = resource.getCategory() != null ? resource.getCategory() : "Uncategorized";
                String building = resource.getBuilding() != null ? resource.getBuilding() : "Unknown";
                
                valueByCategory.merge(category, resource.getValue(), BigDecimal::add);
                valueByBuilding.merge(building, resource.getValue(), BigDecimal::add);
            }
        }
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalValue", totalValue);
        report.put("assetCount", resources.stream().filter(r -> r.getValue() != null).count());
        report.put("valueByCategory", valueByCategory);
        report.put("valueByBuilding", valueByBuilding);
        
        return report;
    }

    public Map<String, Object> getCategoryBreakdown() {
        List<Resource> resources = resourceRepository.findAll();
        
        Map<String, Long> byCategory = resources.stream()
            .filter(r -> r.getCategory() != null && !r.getCategory().isEmpty())
            .collect(Collectors.groupingBy(Resource::getCategory, Collectors.counting()));
        
        Map<String, Map<String, Long>> categoryDetails = new HashMap<>();
        for (String category : byCategory.keySet()) {
            List<Resource> categoryResources = resources.stream()
                .filter(r -> category.equals(r.getCategory()))
                .collect(Collectors.toList());
            
            Map<String, Long> statusCounts = categoryResources.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().toString(), Collectors.counting()));
            
            categoryDetails.put(category, statusCounts);
        }
        
        Map<String, Object> report = new HashMap<>();
        report.put("byCategory", byCategory);
        report.put("categoryDetails", categoryDetails);
        
        return report;
    }

    public Map<String, Object> getAssignmentReport() {
        List<Resource> resources = resourceRepository.findAll();
        
        long assigned = resources.stream()
            .filter(r -> r.getAssignedTo() != null && !r.getAssignedTo().isEmpty())
            .count();
        
        long unassigned = resources.size() - assigned;
        
        Map<String, Long> byAssignee = resources.stream()
            .filter(r -> r.getAssignedTo() != null)
            .collect(Collectors.groupingBy(Resource::getAssignedTo, Collectors.counting()));
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalAssigned", assigned);
        report.put("totalUnassigned", unassigned);
        report.put("byAssignee", byAssignee);
        report.put("assignmentRate", resources.size() > 0 ? (double) assigned / resources.size() * 100 : 0);
        
        return report;
    }

    private Map<String, Long> getCountByStatus(List<Resource> resources) {
        return resources.stream()
            .collect(Collectors.groupingBy(r -> r.getStatus().toString(), Collectors.counting()));
    }

    private Map<String, Long> getCountByCondition(List<Resource> resources) {
        return resources.stream()
            .filter(r -> r.getCondition() != null)
            .collect(Collectors.groupingBy(r -> r.getCondition().toString(), Collectors.counting()));
    }

    private Map<String, Long> getCountByField(List<Resource> resources, java.util.function.Function<Resource, String> fieldExtractor) {
        return resources.stream()
            .map(fieldExtractor)
            .filter(Objects::nonNull)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
    }
}