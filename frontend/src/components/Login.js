import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { setToken, setUser } from '../services/auth';
import { getCurrentUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse) => {
    // credentialResponse contains id_token (credential)
    const idToken = credentialResponse.credential;
    setToken(idToken); // Store token

    // Fetch user details from backend
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      navigate('/'); // Redirect to home after login
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const onError = () => {
    console.error('Login failed');
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="login-brand">
          <div className="brand-icon">🎓</div>
          <h1>SmartCampus</h1>
          <p>Operations & Facility Management</p>
        </div>
        
        <div className="login-content">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to manage your campus bookings and reports</p>
          
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
          
          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Easy Facility Bookings</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚨</span>
              <span>Fast Incident Reporting</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span>Real-time Notifications</span>
            </div>
          </div>
        </div>
        
        <div className="login-footer">
          <p>© 2026 Faculty of Computing - SLIIT</p>
        </div>
      </div>
    </div>
  );
};


export default Login;