import React, { useState } from 'react';
import { createBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking(formData);
      navigate('/bookings');
    } catch (err) {
      alert('Booking failed: ' + err.response?.data?.error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Request a Booking</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Resource ID</label>
          <input type="number" className="form-control" name="resourceId" value={formData.resourceId} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Start Time</label>
          <input type="datetime-local" className="form-control" name="startTime" value={formData.startTime} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">End Time</label>
          <input type="datetime-local" className="form-control" name="endTime" value={formData.endTime} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Purpose</label>
          <textarea className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Expected Attendees</label>
          <input type="number" className="form-control" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default BookingForm;