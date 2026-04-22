import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken, removeUser } from '../services/auth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          <span className="brand-dot"></span>
          SmartCampus
        </Link>
        
        <div className="navbar-links">
          <Link className="nav-link" to="/resources">Resources</Link>
          <Link className="nav-link" to="/bookings">Bookings</Link>
          <Link className="nav-link" to="/tickets">Tickets</Link>
          {user && user.role === 'ADMIN' && (
            <Link className="nav-link admin-link" to="/admin">Admin</Link>
          )}
        </div>

        <div className="navbar-actions">
          <NotificationBell />
          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;