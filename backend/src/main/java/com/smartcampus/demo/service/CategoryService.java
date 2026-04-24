package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.Category;
import com.smartcampus.demo.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public List<Category> findRootCategories() {
        return categoryRepository.findByParentIdIsNull();
    }

    public List<Category> findByParentId(String parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    public List<Category> findByType(Category.CategoryType type) {
        return categoryRepository.findByType(type);
    }

    public Optional<Category> findById(String id) {
        return categoryRepository.findById(id);
    }

    public Category save(Category category) {
        if (category.getId() == null) {
            category.setCreatedAt(LocalDateTime.now());
        }
        category.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    public void delete(String id) {
        categoryRepository.deleteById(id);
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public boolean existsByName(String name) {
        return categoryRepository.findByName(name).isPresent();
    }

    public long count() {
        return categoryRepository.count();
    }
}