import React, { useState, useEffect } from 'react';
import { getAllBookings, getAllTickets } from '../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bookingsRes = await getAllBookings();
      const ticketsRes = await getAllTickets();
      setBookings(bookingsRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const pendingTickets = tickets.filter(t => t.status === 'OPEN');

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card text-white bg-primary mb-3">
            <div className="card-header">Pending Bookings</div>
            <div className="card-body">
              <h5 className="card-title">{pendingBookings.length}</h5>
              <p className="card-text">Bookings awaiting approval</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-white bg-warning mb-3">
            <div className="card-header">Open Tickets</div>
            <div className="card-body">
              <h5 className="card-title">{pendingTickets.length}</h5>
              <p className="card-text">Tickets awaiting assignment</p>
            </div>
          </div>
        </div>
      </div>
      <h3>Recent Bookings</h3>
      <ul>
        {bookings.slice(0,5).map(b => <li key={b.id}>{b.resource?.name} - {b.status}</li>)}
      </ul>
      <h3>Recent Tickets</h3>
      <ul>
        {tickets.slice(0,5).map(t => <li key={t.id}>{t.category} - {t.status}</li>)}
      </ul>
    </div>
  );
};

export default AdminDashboard;