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
    <div className="container animate-fade-in">
      <div className="form-container-card card">
        <div className="section-header">
          <h1>Report an Incident</h1>
          <p className="text-muted">Submit a ticket for equipment or facility maintenance</p>
        </div>

        {error && (
          <div className="alert-box danger mb-4">
            <strong>Submission Failed:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Affected Resource</label>
              <input
                type="text"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                required
                placeholder="Enter Resource ID"
              />
            </div>
            
            <div className="form-group">
              <label>Incident Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g. Electrical, Plumbing"
              />
            </div>
            
            <div className="form-group">
              <label>Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low - Not Urgent</option>
                <option value="MEDIUM">Medium - Normal</option>
                <option value="HIGH">High - Urgent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Contact Details</label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleChange}
                required
                placeholder="Your email or phone"
              />
            </div>

            <div className="form-group full-width">
              <label>Detailed Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div className="form-group full-width">
              <label>Evidence Attachments (Max 3 Images)</label>
              <div className="file-upload-zone">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  id="ticket-files"
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <span>{files.length > 0 ? `${files.length} files selected` : 'Click to upload images or drag & drop'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Processing Submission...' : 'Submit Incident Report'}
            </button>
            <button type="button" className="btn btn-outline w-100 mt-2" onClick={() => navigate('/tickets')}>Back to Tickets</button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default TicketForm;