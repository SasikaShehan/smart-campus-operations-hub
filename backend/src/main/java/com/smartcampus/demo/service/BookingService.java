package com.smartcampus.demo.service;

import com.smartcampus.demo.entity.Booking;
import com.smartcampus.demo.entity.Resource;
import com.smartcampus.demo.entity.User;
import com.smartcampus.demo.exception.ConflictException;
import com.smartcampus.demo.repository.BookingRepository;
import com.smartcampus.demo.repository.ResourceRepository;
import com.smartcampus.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Booking createBooking(Booking booking, String userId, String resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        booking.setResourceId(resource.getId());
        booking.setUserId(user.getId());
        booking.setStatus(Booking.Status.PENDING);

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflicting(resourceId,
                booking.getStartTime(), booking.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Resource is already booked for the requested time slot.");
        }

        Booking saved = bookingRepository.save(booking);
        return saved;
    }

    @Transactional
    public Booking approveBooking(String bookingId, String reason, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != Booking.Status.PENDING) {
            throw new IllegalStateException("Booking is not in pending state");
        }
        booking.setStatus(Booking.Status.APPROVED);
        booking.setRejectionReason(null);
        Booking approved = bookingRepository.save(booking);

        User user = userRepository.findById(booking.getUserId()).orElse(null);
        if (user != null) {
            notificationService.createNotification(user.getId(),
                    "Booking Approved",
                    "Your booking for resource " + booking.getResourceId() + " on " + booking.getStartTime()
                            + " has been approved.",
                    "BOOKING");
        }
        return approved;
    }

    @Transactional
    public Booking rejectBooking(String bookingId, String reason, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != Booking.Status.PENDING) {
            throw new IllegalStateException("Booking is not in pending state");
        }
        booking.setStatus(Booking.Status.REJECTED);
        booking.setRejectionReason(reason);
        Booking rejected = bookingRepository.save(booking);

        User user = userRepository.findById(booking.getUserId()).orElse(null);
        if (user != null) {
            notificationService.createNotification(user.getId(),
                    "Booking Rejected",
                    "Your booking for resource " + booking.getResourceId() + " was rejected. Reason: " + reason,
                    "BOOKING");
        }
        return rejected;
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}