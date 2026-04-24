import React, { useState, useEffect } from 'react';
import { getResources, deleteResource, getResourceStats } from '../services/api';
import ResourceForm from './ResourceForm';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({ type: '', capacity: '', location: '', category: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const res = await getResources(filters);
      setResources(res.data);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getResourceStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
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

  // Filter resources by search term
  const filteredResources = resources.filter(res => 
    res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.building?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badge helper
  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': 'bg-success',
      'OUT_OF_SERVICE': 'bg-danger',
      'UNDER_MAINTENANCE': 'bg-warning',
      'RESERVED': 'bg-info'
    };
    return badges[status] || 'bg-secondary';
  };

  // Condition badge helper
  const getConditionBadge = (condition) => {
    const badges = {
      'NEW': 'bg-primary',
      'GOOD': 'bg-success',
      'FAIR': 'bg-warning',
      'POOR': 'bg-danger'
    };
    return badges[condition] || 'bg-secondary';
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Facilities & Assets Catalogue</h2>
        <div>
          <button className={`btn btn-sm me-2 ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setViewMode('table')}>Table</button>
          <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setViewMode('grid')}>Grid</button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Total</h5>
                <h3>{stats.total}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-success">
              <div className="card-body">
                <h5 className="card-title text-success">Available</h5>
                <h3>{stats.available}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-warning">
              <div className="card-body">
                <h5 className="card-title text-warning">Maintenance</h5>
                <h3>{stats.byStatus?.UNDER_MAINTENANCE || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-danger">
              <div className="card-body">
                <h5 className="card-title text-danger">Out of Service</h5>
                <h3>{stats.byStatus?.OUT_OF_SERVICE || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-info">
              <div className="card-body">
                <h5 className="card-title text-info">Reserved</h5>
                <h3>{stats.byStatus?.RESERVED || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-muted">Due Maintenance</h5>
                <h3>{stats.maintenanceDue}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search by name, asset tag, category, building..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>
        {user?.role === 'ADMIN' && (
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={() => setShowForm(true)}>Add Resource</button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col">
          <input type="text" className="form-control" placeholder="Type" value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })} />
        </div>
        <div className="col">
          <input type="text" className="form-control" placeholder="Category" value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })} />
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

      {/* Table View */}
      {viewMode === 'table' ? (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Name</th>
              <th>Category</th>
              <th>Building</th>
              <th>Floor</th>
              <th>Status</th>
              <th>Condition</th>
              {user?.role === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(res => (
              <tr key={res.id}>
                <td><span className="badge bg-dark">{res.assetTag || 'N/A'}</span></td>
                <td><strong>{res.name}</strong></td>
                <td>{res.category || res.type}</td>
                <td>{res.building || '-'}</td>
                <td>{res.floor || '-'}</td>
                <td><span className={`badge ${getStatusBadge(res.status)}`}>{res.status}</span></td>
                <td><span className={`badge ${getConditionBadge(res.condition)}`}>{res.condition || 'N/A'}</span></td>
                {user?.role === 'ADMIN' && (
                  <td>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(res)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(res.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* Grid View */
        <div className="row">
          {filteredResources.map(res => (
            <div key={res.id} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="badge bg-dark">{res.assetTag || 'N/A'}</span>
                  <span className={`badge ${getStatusBadge(res.status)}`}>{res.status}</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{res.name}</h5>
                  <p className="card-text text-muted">{res.category || res.type}</p>
                  <hr />
                  <div className="row text-sm">
                    <div className="col-6">
                      <strong>Building:</strong> {res.building || '-'}
                    </div>
                    <div className="col-6">
                      <strong>Floor:</strong> {res.floor || '-'}
                    </div>
                    <div className="col-6">
                      <strong>Capacity:</strong> {res.capacity || '-'}
                    </div>
                    <div className="col-6">
                      <strong>Condition:</strong> <span className={`badge ${getConditionBadge(res.condition)}`}>{res.condition || 'N/A'}</span>
                    </div>
                    {res.assignedTo && (
                      <div className="col-12 mt-2">
                        <strong>Assigned To:</strong> {res.assignedTo}
                      </div>
                    )}
                  </div>
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="card-footer">
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(res)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(res.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ResourceForm resource={editingResource} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default ResourceList;