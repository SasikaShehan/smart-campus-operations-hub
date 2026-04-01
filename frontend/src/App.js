import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import ResourceList from './components/ResourceList';
import BookingList from './components/BookingList';
import BookingForm from './components/BookingForm';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/TicketDetails';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><ResourceList /></PrivateRoute>} />
          <Route path="/resources" element={<PrivateRoute><ResourceList /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><BookingList /></PrivateRoute>} />
          <Route path="/bookings/new" element={<PrivateRoute><BookingForm /></PrivateRoute>} />
          <Route path="/tickets" element={<PrivateRoute><TicketList /></PrivateRoute>} />
          <Route path="/tickets/new" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute><TicketDetails /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;