import React, { useState, useEffect } from 'react';
import { getAllBookings, getAllTickets, getAdminAnalytics } from '../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, ticketsRes, statsRes] = await Promise.all([
        getAllBookings(),
        getAllTickets(),
        getAdminAnalytics()
      ]);
      setBookings(bookingsRes.data);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };


  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const pendingTickets = tickets.filter(t => t.status === 'OPEN');

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-header mb-4">
        <h1>Admin Command Center</h1>
        <p className="text-muted">Real-time overview of campus operations</p>
      </div>

      <div className="stats-grid mb-5">
        <div className="card stats-card primary">
          <div className="stats-icon">📅</div>
          <div className="stats-info">
            <span className="stats-label">Pending Bookings</span>
            <h2 className="stats-value">{pendingBookings.length}</h2>
          </div>
          <div className="stats-trend positive">Requires Action</div>
        </div>

        <div className="card stats-card warning">
          <div className="stats-icon">🚨</div>
          <div className="stats-info">
            <span className="stats-label">Open Incidents</span>
            <h2 className="stats-value">{pendingTickets.length}</h2>
          </div>
          <div className="stats-trend warning">High Priority</div>
        </div>

        <div className="card stats-card success">
          <div className="stats-icon">🏢</div>
          <div className="stats-info">
            <span className="stats-label">Total Resources</span>
            <h2 className="stats-value">{new Set(bookings.map(b => b.resource?.id)).size || 0}</h2>
          </div>
          <div className="stats-trend positive">Active Catalog</div>
        </div>

        <div className="card stats-card secondary">
          <div className="stats-icon">👥</div>
          <div className="stats-info">
            <span className="stats-label">Active Users</span>
            <h2 className="stats-value">24</h2>
          </div>
          <div className="stats-trend">Today</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-column">
          <div className="card section-card">
            <div className="section-header">
              <h3>Recent Booking Requests</h3>
              <button className="btn btn-sm btn-outline">View All</button>
            </div>
            <div className="activity-list">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="activity-item">
                  <div className={`status-indicator ${b.status === 'APPROVED' ? 'bg-success' : 'bg-warning'}`}></div>
                  <div className="activity-details">
                    <span className="activity-title">{b.resource?.name}</span>
                    <span className="activity-meta">{b.purpose} • {new Date(b.startTime).toLocaleDateString()}</span>
                  </div>
                  <span className={`badge ${b.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="card section-card">
            <div className="section-header">
              <h3>System Incident Feed</h3>
              <button className="btn btn-sm btn-outline">Review Tickets</button>
            </div>
            <div className="activity-list">
              {tickets.slice(0, 5).map(t => (
                <div key={t.id} className="activity-item">
                  <div className={`status-indicator bg-danger`}></div>
                  <div className="activity-details">
                    <span className="activity-title">{t.category}</span>
                    <span className="activity-meta">{t.resource?.name} • Priority: {t.priority}</span>
                  </div>
                  <span className="badge badge-primary">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AdminDashboard;