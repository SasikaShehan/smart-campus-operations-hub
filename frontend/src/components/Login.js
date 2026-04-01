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
    <div className="container text-center mt-5">
      <h2>Smart Campus Operations Hub</h2>
      <p>Please login to continue</p>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap
      />
    </div>
  );
};

export default Login;