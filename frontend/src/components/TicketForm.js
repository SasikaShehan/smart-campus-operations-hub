import React, { useState } from 'react';
import { createTicket } from '../services/api';
import { useNavigate } from 'react-router-dom';

const TicketForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    resourceId: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    contactDetails: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('resourceId', formData.resourceId);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('priority', formData.priority);
    data.append('contactDetails', formData.contactDetails);
    files.forEach(file => data.append('attachments', file));

    try {
      const response = await createTicket(data);
      console.log('Ticket created:', response.data);
      navigate('/tickets');
    } catch (err) {
      console.error('Ticket creation error:', err);
      let errorMessage = 'Unknown error';
      if (err.response) {
        // The request was made and the server responded with a status code outside 2xx
        errorMessage = err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        // The request was made but no response received
        errorMessage = 'Network Error – backend not reachable. Check if backend is running and CORS is configured.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Report an Incident</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          Failed to create ticket: {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Resource ID</label>
          <input
            type="text"
            className="form-control"
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            required
          />
          <small className="text-muted">Enter the ID of the resource (e.g., 67f1a2b3c4d5e6f7a8b9c0d1)</small>
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Details</label>
          <input
            type="text"
            className="form-control"
            name="contactDetails"
            value={formData.contactDetails}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Attachments (max 3 images)</label>
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;