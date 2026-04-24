package com.smartcampus.demo.repository;

import com.smartcampus.demo.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByParentIdIsNull();                    // Root categories
    List<Category> findByParentId(String parentId);           // Child categories
    List<Category> findByType(Category.CategoryType type);   // By type (FACILITY/ASSET)
    Optional<Category> findByName(String name);               // Find by name
    List<Category> findByIsActiveTrue();                      // Active categories
}