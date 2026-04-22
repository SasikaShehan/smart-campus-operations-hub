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
    <div className="container animate-fade-in">
      <div className="form-container-card card">
        <div className="section-header">
          <h1>Request Facility Booking</h1>
          <p className="text-muted">Fill in the details to reserve a campus resource</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Select Resource</label>
              <input type="text" name="resourceId" value={formData.resourceId} onChange={handleChange} required placeholder="Resource ID or Name" />
            </div>
            
            <div className="form-group">
              <label>Expected Attendees</label>
              <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} placeholder="e.g. 50" />
            </div>
            
            <div className="form-group">
              <label>Start Date & Time</label>
              <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>End Date & Time</label>
              <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
            </div>

            <div className="form-group full-width">
              <label>Booking Purpose</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleChange} required rows="4" placeholder="Briefly describe the purpose of this booking..." />
            </div>
          </div>

          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary w-100">Confirm Booking Request</button>
            <button type="button" className="btn btn-outline w-100 mt-2" onClick={() => navigate('/resources')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default BookingForm;