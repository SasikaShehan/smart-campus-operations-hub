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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Smart Campus</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/resources">Resources</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bookings">My Bookings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tickets">Tickets</Link>
            </li>
            {user && user.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin Dashboard</Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <NotificationBell />
            <span className="text-light me-3">Hello, {user?.name || 'User'}</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;