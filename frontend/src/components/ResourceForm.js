import React, { useState } from 'react';
import { createResource, updateResource } from '../services/api';

const ResourceForm = ({ resource, onClose }) => {
  const [formData, setFormData] = useState({
    // Basic fields
    name: resource?.name || '',
    type: resource?.type || '',
    capacity: resource?.capacity || '',
    location: resource?.location || '',
    availabilityWindows: resource?.availabilityWindows || '',
    status: resource?.status || 'ACTIVE',
    // Enhanced fields
    category: resource?.category || '',
    subCategory: resource?.subCategory || '',
    assetTag: resource?.assetTag || '',
    description: resource?.description || '',
    building: resource?.building || '',
    floor: resource?.floor || '',
    serialNumber: resource?.serialNumber || '',
    manufacturer: resource?.manufacturer || '',
    model: resource?.model || '',
    value: resource?.value || '',
    condition: resource?.condition || 'GOOD',
    assignedTo: resource?.assignedTo || '',
    purchaseDate: resource?.purchaseDate || '',
    warrantyExpiry: resource?.warrantyExpiry || '',
    maintenanceNotes: resource?.maintenanceNotes || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string numbers to actual numbers
      const dataToSubmit = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        value: formData.value ? parseFloat(formData.value) : null
      };
      
      if (resource) {
        await updateResource(resource.id, dataToSubmit);
      } else {
        await createResource(dataToSubmit);
      }
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{resource ? 'Edit Resource' : 'Add Resource'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Basic Information */}
              <h6 className="text-muted mb-3">Basic Information</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Asset Tag</label>
                  <input type="text" className="form-control" name="assetTag" value={formData.assetTag} onChange={handleChange} placeholder="Auto-generated if empty" />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Type *</label>
                  <input type="text" className="form-control" name="type" value={formData.type} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-control" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Classroom, Lab" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Sub Category</label>
                  <input type="text" className="form-control" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g., Computer Lab" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-control" name="capacity" value={formData.capacity} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Condition</label>
                  <select className="form-select" name="condition" value={formData.condition} onChange={handleChange}>
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
              </div>

              {/* Location Information */}
              <h6 className="text-muted mb-3 mt-3">Location Information</h6>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Building</label>
                  <input type="text" className="form-control" name="building" value={formData.building} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Floor</label>
                  <input type="text" className="form-control" name="floor" value={formData.floor} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>

              {/* Asset Information */}
              <h6 className="text-muted mb-3 mt-3">Asset Information</h6>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Serial Number</label>
                  <input type="text" className="form-control" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Manufacturer</label>
                  <input type="text" className="form-control" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Model</label>
                  <input type="text" className="form-control" name="model" value={formData.model} onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Value ($)</label>
                  <input type="number" className="form-control" name="value" value={formData.value} onChange={handleChange} step="0.01" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purchase Date</label>
                  <input type="date" className="form-control" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Warranty Expiry</label>
                  <input type="date" className="form-control" name="warrantyExpiry" value={formData.warrantyExpiry} onChange={handleChange} />
                </div>
              </div>

              {/* Assignment & Additional */}
              <h6 className="text-muted mb-3 mt-3">Assignment & Additional</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Assigned To</label>
                  <input type="text" className="form-control" name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="User ID or Department" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Availability Windows</label>
                  <input type="text" className="form-control" name="availabilityWindows" value={formData.availabilityWindows} onChange={handleChange} placeholder="e.g., 09:00-17:00" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2" />
              </div>

              <div className="mb-3">
                <label className="form-label">Maintenance Notes</label>
                <textarea className="form-control" name="maintenanceNotes" value={formData.maintenanceNotes} onChange={handleChange} rows="2" />
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