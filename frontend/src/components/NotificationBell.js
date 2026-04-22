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
    <div className="notification-bell-container">
      <button
        className="bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="bell-icon">🔔</span>
        {notifications.length > 0 && (
          <span className="notification-count animate-fade-in">
            {notifications.length}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown animate-fade-in">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <span className="unread-badge">{notifications.length} New</span>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <span className="empty-icon">✨</span>
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notif-details">
                    <span className="notif-title">{notif.title}</span>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-date">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <button className="mark-read-btn" onClick={() => handleMarkRead(notif.id)} title="Mark as read">
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>

  );
};

export default NotificationBell;