import React, { useState, useEffect } from 'react';
import { getMyBookings, getAllBookings, approveBooking, rejectBooking } from '../services/api';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBookings();
    if (user?.role === 'ADMIN') setIsAdmin(true);
  }, []);

  const fetchBookings = async () => {
    try {
      let res;
      if (isAdmin) {
        res = await getAllBookings();
      } else {
        res = await getMyBookings();
      }
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const handleApprove = async (id, reason) => {
    await approveBooking(id, reason);
    fetchBookings();
  };

  const handleReject = async (id, reason) => {
    const reasonText = prompt('Enter rejection reason:');
    if (reasonText) await rejectBooking(id, reasonText);
    fetchBookings();
  };

  return (
    <div className="container animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isAdmin ? 'All Bookings' : 'My Bookings'}</h1>
      </div>

      <div className="booking-grid">
        {bookings.map(booking => (
          <div key={booking.id} className="card booking-card">
            <div className="booking-header">
              <div className="resource-name">
                <span className="info-label">Resource</span>
                <h3>{booking.resource?.name}</h3>
              </div>
              <span className={`badge ${
                booking.status === 'APPROVED' ? 'badge-success' : 
                booking.status === 'REJECTED' ? 'badge-danger' : 
                'badge-warning'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="booking-body">
              <div className="booking-time">
                <div className="time-block">
                  <span className="info-label">Start Time</span>
                  <span>{new Date(booking.startTime).toLocaleString()}</span>
                </div>
                <div className="time-block">
                  <span className="info-label">End Time</span>
                  <span>{new Date(booking.endTime).toLocaleString()}</span>
                </div>
              </div>
              <div className="booking-purpose">
                <span className="info-label">Purpose</span>
                <p>{booking.purpose}</p>
              </div>
              {booking.rejectionReason && (
                <div className="rejection-box">
                  <span className="info-label text-danger">Rejection Reason</span>
                  <p className="text-danger">{booking.rejectionReason}</p>
                </div>
              )}
            </div>

            {isAdmin && booking.status === 'PENDING' && (
              <div className="booking-footer d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" onClick={() => handleApprove(booking.id)}>Approve</button>
                <button className="btn btn-outline text-danger flex-grow-1" onClick={() => handleReject(booking.id)}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

  );
};

export default BookingList;