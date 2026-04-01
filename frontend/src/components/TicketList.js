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
    <div className="container mt-4">
      <h2>Tickets</h2>
      <div className="mb-3">
        <button className={`btn ${filter === 'my' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setFilter('my')}>My Tickets</button>
        {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
          <button className={`btn ${filter === 'assigned' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setFilter('assigned')}>Assigned to Me</button>
        )}
        {user?.role === 'ADMIN' && (
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('all')}>All Tickets</button>
        )}
      </div>
      <Link to="/tickets/new" className="btn btn-success mb-3">Create New Ticket</Link>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Resource</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.resource?.name}</td>
              <td>{ticket.category}</td>
              <td>{ticket.priority}</td>
              <td>
                <span className={`badge bg-${ticket.status === 'RESOLVED' ? 'success' : ticket.status === 'CLOSED' ? 'secondary' : 'warning'}`}>
                  {ticket.status}
                </span>
              </td>
              <td>
                <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-info">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;