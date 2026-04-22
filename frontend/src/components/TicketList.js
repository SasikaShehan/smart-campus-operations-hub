import React, { useState, useEffect } from 'react';
import { getMyTickets, getAssignedTickets, getAllTickets } from '../services/api';
import { Link } from 'react-router-dom';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('my');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      let res;
      if (filter === 'my') res = await getMyTickets();
      else if (filter === 'assigned' && (user?.role === 'TECHNICIAN' || user?.role === 'ADMIN')) res = await getAssignedTickets();
      else if (filter === 'all' && user?.role === 'ADMIN') res = await getAllTickets();
      else return;
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Incidents & Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">+ Create New Ticket</Link>
      </div>

      <div className="filter-tabs mb-4">
        <button className={`tab-btn ${filter === 'my' ? 'active' : ''}`} onClick={() => setFilter('my')}>My Tickets</button>
        {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
          <button className={`tab-btn ${filter === 'assigned' ? 'active' : ''}`} onClick={() => setFilter('assigned')}>Assigned to Me</button>
        )}
        {user?.role === 'ADMIN' && (
          <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All System Tickets</button>
        )}
      </div>

      <div className="ticket-grid">
        {tickets.map(ticket => (
          <div key={ticket.id} className="card ticket-card">
            <div className="ticket-header">
              <span className="ticket-id">#{ticket.id?.substring(0, 8)}</span>
              <span className={`badge ${
                ticket.status === 'RESOLVED' ? 'badge-success' : 
                ticket.status === 'OPEN' ? 'badge-primary' : 
                ticket.status === 'IN_PROGRESS' ? 'badge-warning' : 
                'badge-secondary'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="ticket-body">
              <h3 className="ticket-resource">{ticket.resource?.name || 'General Resource'}</h3>
              <p className="ticket-category">{ticket.category}</p>
              
              <div className="ticket-meta">
                <div className="meta-item">
                  <span className="info-label">Priority</span>
                  <span className={`priority-text priority-${ticket.priority?.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="info-label">Created</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <Link to={`/tickets/${ticket.id}`} className="btn btn-outline w-100">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default TicketList;