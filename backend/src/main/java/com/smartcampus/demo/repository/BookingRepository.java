package com.smartcampus.demo.repository;

import com.smartcampus.demo.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
        List<Booking> findByUserId(String userId);

        @Query("{ 'resourceId': ?0, 'status': { $nin: ['CANCELLED', 'REJECTED'] }, " +
                        "'$or': [ " +
                        "  { 'startTime': { $lt: ?2, $gt: ?1 } }, " +
                        "  { 'endTime': { $gt: ?1, $lt: ?2 } }, " +
                        "  { 'startTime': { $lte: ?1 }, 'endTime': { $gte: ?2 } } " +
                        "] }")
        List<Booking> findConflicting(String resourceId, LocalDateTime start, LocalDateTime end);
}