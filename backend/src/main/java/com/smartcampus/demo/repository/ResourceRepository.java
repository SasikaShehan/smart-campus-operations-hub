package com.smartcampus.demo.repository;

import com.smartcampus.demo.entity.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
        @Query("{ 'type': { $regex: ?0, $options: 'i' }, " +
                        "'capacity': { $gte: ?1 }, " +
                        "'location': { $regex: ?2, $options: 'i' } }")
        List<Resource> search(String type, Integer capacity, String location);
}