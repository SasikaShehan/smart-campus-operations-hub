package com.smartcampus.demo.repository;

import com.smartcampus.demo.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    @Query("{ 'type': { $regex: ?0, $options: 'i' }, " +
            "'capacity': { $gte: ?1 }, " +
            "'location': { $regex: ?2, $options: 'i' } }")
    List<Resource> search(String type, Integer capacity, String location);

    // ========== Asset Tracking Queries ==========
    List<Resource> findByCategory(String category);
    List<Resource> findByStatus(Resource.Status status);
    List<Resource> findByAssetTag(String assetTag);
    List<Resource> findByAssignedTo(String assignedTo);
    List<Resource> findByCondition(Resource.Condition condition);
    List<Resource> findByBuilding(String building);
    List<Resource> findByFloor(String floor);

    @Query("{ 'status': 'ACTIVE' }")
    List<Resource> findByStatusActive();

    @Query("{ 'warrantyExpiry': { $lte: ?0 } }")
    List<Resource> findByWarrantyExpiryBefore(LocalDate date);

    // ========== Advanced Search & Pagination ==========
    @Query("{ $or: [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'assetTag': { $regex: ?0, $options: 'i' } }, " +
            "{ 'category': { $regex: ?0, $options: 'i' } }, " +
            "{ 'building': { $regex: ?0, $options: 'i' } }, " +
            "{ 'description': { $regex: ?0, $options: 'i' } } " +
            "] }")
    Page<Resource> searchAll(String search, Pageable pageable);

    @Query("{ $and: [ " +
            "{ $or: [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'assetTag': { $regex: ?0, $options: 'i' } }, " +
            "{ 'category': { $regex: ?0, $options: 'i' } } " +
            "] }, " +
            "{ $or: [ " +
            "{ 'type': { $regex: ?1, $options: 'i' } }, " +
            "{ 'category': { $regex: ?1, $options: 'i' } } " +
            "] }, " +
            "{ $or: [ " +
            "{ 'status': ?2 }, " +
            "{ $expr: { $eq: [?2, null] } } " +
            "] } " +
            "] }")
    Page<Resource> advancedSearch(String search, String type, String status, Pageable pageable);

    // Paginated search (legacy)
    Page<Resource> findAll(String type, String category, String status, String search, Pageable pageable);

    // ========== Bulk Operations ==========
    List<Resource> findByIdIn(List<String> ids);
}