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
    <div className="container mt-4">
      <h2>Resources</h2>
      {user?.role === 'ADMIN' && (
        <button className="btn btn-primary mb-3" onClick={() => setShowForm(true)}>Add Resource</button>
      )}

      {/* Filters */}
      <div className="row mb-3">
        <div className="col">
          <input type="text" className="form-control" placeholder="Type" value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })} />
        </div>
        <div className="col">
          <input type="number" className="form-control" placeholder="Min Capacity" value={filters.capacity}
            onChange={e => setFilters({ ...filters, capacity: e.target.value })} />
        </div>
        <div className="col">
          <input type="text" className="form-control" placeholder="Location" value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })} />
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Location</th>
            <th>Status</th>
            {user?.role === 'ADMIN' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {resources.map(res => (
            <tr key={res.id}>
              <td>{res.name}</td>
              <td>{res.type}</td>
              <td>{res.capacity}</td>
              <td>{res.location}</td>
              <td>{res.status}</td>
              {user?.role === 'ADMIN' && (
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(res)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(res.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <ResourceForm resource={editingResource} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default ResourceList;