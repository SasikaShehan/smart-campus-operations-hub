import React, { useState, useEffect } from 'react';
import { getResources, deleteResource } from '../services/api';
import ResourceForm from './ResourceForm';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const res = await getResources(filters);
      setResources(res.data);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await deleteResource(id);
      fetchResources();
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingResource(null);
    fetchResources();
  };

  return (
    <div className="container animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Resources</h1>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Resource</button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label>Filter by Type</label>
            <input type="text" placeholder="e.g. LAB, ROOM" value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label>Minimum Capacity</label>
            <input type="number" placeholder="0" value={filters.capacity}
              onChange={e => setFilters({ ...filters, capacity: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label>Location</label>
            <input type="text" placeholder="e.g. Building A" value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="resource-grid">
        {resources.map(res => (
          <div key={res.id} className="card resource-card">
            <div className="resource-header">
              <h3>{res.name}</h3>
              <span className={`badge ${res.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                {res.status}
              </span>
            </div>
            <div className="resource-body">
              <div className="resource-info">
                <span className="info-label">Type:</span> <span>{res.type}</span>
              </div>
              <div className="resource-info">
                <span className="info-label">Capacity:</span> <span>{res.capacity} students</span>
              </div>
              <div className="resource-info">
                <span className="info-label">Location:</span> <span>{res.location}</span>
              </div>
            </div>
            <div className="resource-footer">
              <button className="btn btn-outline w-100 mb-2">Book Now</button>
              {user?.role === 'ADMIN' && (
                <div className="admin-actions d-flex gap-2">
                  <button className="btn btn-sm btn-outline flex-grow-1" onClick={() => handleEdit(res)}>Edit</button>
                  <button className="btn btn-sm btn-outline text-danger flex-grow-1" onClick={() => handleDelete(res.id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


      {showForm && (
        <ResourceForm resource={editingResource} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default ResourceList;