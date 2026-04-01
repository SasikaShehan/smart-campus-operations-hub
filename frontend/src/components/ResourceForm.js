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
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{resource ? 'Edit Resource' : 'Add Resource'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <input type="text" className="form-control" name="type" value={formData.type} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-control" name="capacity" value={formData.capacity} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Availability Windows</label>
                <input type="text" className="form-control" name="availabilityWindows" value={formData.availabilityWindows} onChange={handleChange} placeholder="e.g., 09:00-17:00" />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceForm;