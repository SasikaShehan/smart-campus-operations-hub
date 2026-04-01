import React, { useState, useEffect } from 'react';
import { getUnreadNotifications, markNotificationRead } from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await getUnreadNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="dropdown me-3">
      <button
        className="btn btn-secondary position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="bi bi-bell"></i>
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>
      {showDropdown && (
        <ul className="dropdown-menu show position-absolute end-0 mt-2" style={{ width: '300px' }}>
          {notifications.length === 0 ? (
            <li className="dropdown-item">No new notifications</li>
          ) : (
            notifications.map(notif => (
              <li key={notif.id} className="dropdown-item">
                <div>
                  <strong>{notif.title}</strong>
                  <p className="small">{notif.message}</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleMarkRead(notif.id)}>
                    Mark read
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default NotificationBell;