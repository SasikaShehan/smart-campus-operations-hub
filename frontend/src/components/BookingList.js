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
    <div className="container mt-4">
      <h2>{isAdmin ? 'All Bookings' : 'My Bookings'}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Start</th>
            <th>End</th>
            <th>Purpose</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{booking.resource?.name}</td>
              <td>{new Date(booking.startTime).toLocaleString()}</td>
              <td>{new Date(booking.endTime).toLocaleString()}</td>
              <td>{booking.purpose}</td>
              <td>
                <span className={`badge bg-${booking.status === 'APPROVED' ? 'success' : booking.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                  {booking.status}
                </span>
                {booking.rejectionReason && <small className="d-block text-danger">{booking.rejectionReason}</small>}
              </td>
              {isAdmin && booking.status === 'PENDING' && (
                <td>
                  <button className="btn btn-sm btn-success me-2" onClick={() => handleApprove(booking.id)}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleReject(booking.id)}>Reject</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;