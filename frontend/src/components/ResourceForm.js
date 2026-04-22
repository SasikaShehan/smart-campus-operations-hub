import React, { useState } from 'react';
import { createResource, updateResource } from '../services/api';

const ResourceForm = ({ resource, onClose }) => {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    type: resource?.type || '',
    capacity: resource?.capacity || '',
    location: resource?.location || '',
    availabilityWindows: resource?.availabilityWindows || '',
    status: resource?.status || 'ACTIVE'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (resource) {
        await updateResource(resource.id, formData);
      } else {
        await createResource(formData);
      }
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{resource ? 'Edit Resource' : 'Add New Resource'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Resource Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Main Laboratory" />
            </div>
            
            <div className="form-group">
              <label>Resource Type</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="LAB">Laboratory</option>
                <option value="ROOM">Lecture Room</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="HALL">Main Hall</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required placeholder="Number of people" />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Block B, Level 2" />
            </div>

            <div className="form-group full-width">
              <label>Availability Windows</label>
              <input type="text" name="availabilityWindows" value={formData.availabilityWindows} onChange={handleChange} placeholder="e.g. 08:00 AM - 06:00 PM" />
            </div>

            <div className="form-group full-width">
              <label>Operational Status</label>
              <div className="status-toggle">
                <label className={`status-option ${formData.status === 'ACTIVE' ? 'active' : ''}`}>
                  <input type="radio" name="status" value="ACTIVE" checked={formData.status === 'ACTIVE'} onChange={handleChange} />
                  Active
                </label>
                <label className={`status-option ${formData.status === 'OUT_OF_SERVICE' ? 'active' : ''}`}>
                  <input type="radio" name="status" value="OUT_OF_SERVICE" checked={formData.status === 'OUT_OF_SERVICE'} onChange={handleChange} />
                  Out of Service
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Discard</button>
            <button type="submit" className="btn btn-primary">{resource ? 'Update Resource' : 'Create Resource'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ResourceForm;