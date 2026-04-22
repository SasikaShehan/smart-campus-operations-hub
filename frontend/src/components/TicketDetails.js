import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket, getTicketComments, addComment, updateTicketStatus, assignTicket } from '../services/api';
import { getAllUsers } from '../services/api'; // We'll need to add this API endpoint

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchTicket();
    fetchComments();
    if (user?.role === 'ADMIN') fetchUsers();
  }, []);

  const fetchTicket = async () => {
    // You need an endpoint GET /tickets/{id}
    // For now, we'll assume we have a getTicket(id) function.
    // Let's define it in api.js (not shown here)
    const res = await getTicket(id);
    setTicket(res.data);
  };

  const fetchComments = async () => {
    const res = await getTicketComments(id);
    setComments(res.data);
  };

  const fetchUsers = async () => {
    const res = await getAllUsers();
    setUsers(res.data);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    await addComment(id, newComment);
    setNewComment('');
    fetchComments();
  };

  const handleStatusChange = async (status, resolutionNotes) => {
    await updateTicketStatus(id, status, resolutionNotes);
    fetchTicket();
  };

  const handleAssign = async (assigneeId) => {
    await assignTicket(id, assigneeId);
    fetchTicket();
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <div className="ticket-detail-grid">
        <div className="ticket-main-column">
          <div className="card ticket-info-card">
            <div className="section-header">
              <span className="ticket-id">#{ticket.id}</span>
              <div className="d-flex gap-2">
                <span className={`badge ${ticket.status === 'RESOLVED' ? 'badge-success' : 'badge-primary'}`}>{ticket.status}</span>
                <span className={`badge priority-${ticket.priority?.toLowerCase()}`}>{ticket.priority} Priority</span>
              </div>
            </div>
            
            <h1 className="mt-2">{ticket.category}</h1>
            <p className="ticket-resource-name">Resource: <strong>{ticket.resource?.name}</strong></p>
            
            <div className="ticket-description-box">
              <h3>Incident Description</h3>
              <p>{ticket.description}</p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="ticket-attachments">
                <h3>Evidence Attachments</h3>
                <div className="attachment-grid">
                  {ticket.attachments.map((att, idx) => (
                    <div key={idx} className="attachment-preview">
                      <img src={`http://localhost:8080/api/files/${att.fileName}`} alt="attachment" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="comment-section mt-4">
            <h3>Discussion & Updates</h3>
            <div className="comment-feed card">
              {comments.length > 0 ? comments.map((c, idx) => (
                <div key={idx} className="comment-item">
                  <div className="comment-avatar">{c.user?.name?.charAt(0) || 'U'}</div>
                  <div className="comment-content-wrapper">
                    <div className="comment-header">
                      <span className="comment-user">{c.user?.name || 'Unknown User'}</span>
                      <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                </div>
              )) : <p className="text-muted text-center p-4">No comments yet. Start the conversation.</p>}
              
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea 
                  placeholder="Add a comment or resolution note..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary">Post Comment</button>
              </form>
            </div>
          </div>
        </div>

        <div className="ticket-side-column">
          <div className="card admin-controls-card">
            <h3>Manage Incident</h3>
            <div className="meta-list">
              <div className="meta-row">
                <span>Reporter</span>
                <strong>{ticket.reporter?.name}</strong>
              </div>
              <div className="meta-row">
                <span>Assignee</span>
                <strong>{ticket.assignee?.name || 'Unassigned'}</strong>
              </div>
            </div>

            {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
              <div className="control-groups mt-4">
                <div className="form-group">
                  <label>Update Status</label>
                  <select onChange={(e) => handleStatusChange(e.target.value, '')}>
                    <option>Select New Status</option>
                    <option value="IN_PROGRESS">Set In Progress</option>
                    <option value="RESOLVED">Mark Resolved</option>
                    <option value="CLOSED">Close Ticket</option>
                  </select>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="form-group mt-3">
                    <label>Assign Technician</label>
                    <select onChange={(e) => handleAssign(e.target.value)}>
                      <option>Choose Assignee</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default TicketDetails;