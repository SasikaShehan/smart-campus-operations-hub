package com.sliit.paf.smartCampusHub.service;

import com.sliit.paf.smartCampusHub.dto.BookingDTO;
import com.sliit.paf.smartCampusHub.model.Booking;
import com.sliit.paf.smartCampusHub.model.BookingStatus;
import com.sliit.paf.smartCampusHub.model.Facility;
import com.sliit.paf.smartCampusHub.model.FacilityStatus;
import com.sliit.paf.smartCampusHub.model.User;
import com.sliit.paf.smartCampusHub.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityService facilityService;  //  Inject FacilityService
    private final NotificationService notificationService;

    // Get booking by ID
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // Create a new booking
    @Transactional
    public Booking createBooking(BookingDTO dto, User user) {
        // Validate time
        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }
        
        if (dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book past dates");
        }

        //  Get facility by ID
        Facility facility = facilityService.getFacilityById(dto.getFacilityId());
        
        // Check if facility is active
        if (facility.getStatus() != FacilityStatus.ACTIVE) {
            throw new RuntimeException("Facility is not available for booking");
        }

        // Check for conflicts
        if (hasConflict(facility.getId(), dto.getStartTime(), dto.getEndTime())) {
            throw new RuntimeException("Facility already booked for this time slot");
        }

        // Create booking
        Booking booking = Booking.builder()
                .user(user)
                .facility(facility)  //  Use Facility object
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Notify manager
        notificationService.notifyManagers("New booking request from " + user.getName(),
                "Booking ID: " + savedBooking.getId() + " for " + facility.getName());

        return savedBooking;
    }

    // Check for booking conflicts
    public boolean hasConflict(Long facilityId, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository.existsConflict(facilityId, startTime, endTime);
    }

    // Get user's own bookings
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Get all pending bookings
    public List<Booking> getPendingBookings() {
        return bookingRepository.findPendingBookings();
    }

    // Approve booking
    @Transactional
    public Booking approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only approve pending bookings");
        }

        // Check conflict again before approving
        boolean conflict = bookingRepository.existsConflictExcludingSelf(
                booking.getFacility().getId(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        
        if (conflict) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason("Time slot no longer available");
            bookingRepository.save(booking);
            throw new RuntimeException("Time slot no longer available");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking approvedBooking = bookingRepository.save(booking);

        // Notify user
        notificationService.notifyUser(booking.getUser().getId(),
                "Booking Approved", "Your booking for " + booking.getFacility().getName() + " has been approved");

        return approvedBooking;
    }

    // Reject booking
    @Transactional
    public Booking rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only reject pending bookings");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking rejectedBooking = bookingRepository.save(booking);

        // Notify user
        notificationService.notifyUser(booking.getUser().getId(),
                "Booking Rejected", "Your booking for " + booking.getFacility().getName() + " was rejected. Reason: " + reason);

        return rejectedBooking;
    }

    // Cancel booking
    @Transactional
    public Booking cancelBooking(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().equals("ADMIN") || currentUser.getRole().equals("MANAGER");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
        } else {
            throw new RuntimeException("Cannot cancel booking with status: " + booking.getStatus());
        }

        Booking cancelledBooking = bookingRepository.save(booking);

        notificationService.notifyManagers("Booking cancelled", 
                "Booking ID: " + bookingId + " for " + booking.getFacility().getName() + " was cancelled by " + currentUser.getName());

        return cancelledBooking;
    }

    // Update pending booking
    @Transactional
    public Booking updateBooking(Long bookingId, BookingDTO dto, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        if (!isOwner) {
            throw new RuntimeException("You can only update your own bookings");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only update pending bookings");
        }
        
        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }
        
        if (dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book past dates");
        }
        
        //  Get new facility
        Facility facility = facilityService.getFacilityById(dto.getFacilityId());
        
        // Check for conflicts (excluding this booking)
        boolean conflict = bookingRepository.existsConflictExcludingSelf(
                facility.getId(),
                bookingId,
                dto.getStartTime(),
                dto.getEndTime()
        );
        
        if (conflict) {
            throw new RuntimeException("Facility already booked for this time slot");
        }
        
        // Update booking
        booking.setFacility(facility);
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        
        return bookingRepository.save(booking);
    }

    // Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get bookings by facility
    public List<Booking> getBookingsByFacility(Long facilityId) {
        return bookingRepository.findByFacilityId(facilityId);
    }

    // Get booking statistics
    public Map<String, Object> getBookingStats() {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> pending = bookingRepository.findPendingBookings();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", allBookings.size());
        stats.put("pendingApprovals", pending.size());
        stats.put("approved", allBookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count());
        stats.put("rejected", allBookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count());
        stats.put("cancelled", allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());

        return stats;
    }
}
