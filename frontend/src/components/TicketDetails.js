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
    <div className="container mt-4">
      <h2>Ticket #{ticket.id}</h2>
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Resource:</strong> {ticket.resource?.name}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <p><strong>Reporter:</strong> {ticket.reporter?.name}</p>
          <p><strong>Assignee:</strong> {ticket.assignee?.name || 'Unassigned'}</p>
        </div>
      </div>

      {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
        <div className="mb-3">
          <select className="form-select mb-2" onChange={(e) => handleStatusChange(e.target.value, '')}>
            <option>Change Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          {user?.role === 'ADMIN' && (
            <select className="form-select" onChange={(e) => handleAssign(e.target.value)}>
              <option>Assign to</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
        </div>
      )}

      <h4>Comments</h4>
      <div className="mb-3">
        {comments.map(c => (
          <div key={c.id} className="border rounded p-2 mb-2">
            <strong>{c.user?.name}</strong> <small className="text-muted">{new Date(c.createdAt).toLocaleString()}</small>
            <p>{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit}>
        <textarea className="form-control mb-2" rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
        <button type="submit" className="btn btn-primary">Add Comment</button>
      </form>
    </div>
  );
};

export default TicketDetails;