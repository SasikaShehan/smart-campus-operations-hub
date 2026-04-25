import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== RESOURCES ==========
export const getResources = (filters = {}) => api.get('/resources', { params: filters });
export const getResource = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);
export const getResourceStats = () => api.get('/resources/stats');
export const getAvailableResources = () => api.get('/resources/available');
export const getResourcesByCategory = (category) => api.get(`/resources/category/${category}`);
export const getMaintenanceDue = () => api.get('/resources/maintenance-due');

// ========== SEARCH & PAGINATION ==========
export const searchResources = (search, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => 
    api.get('/resources/search', { 
        params: { search, page, size, sortBy, sortDir } 
    });

export const advancedSearch = (search, type, status, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => 
    api.get('/resources/advanced-search', { 
        params: { search, type, status, page, size, sortBy, sortDir } 
    });

export const getFilterOptions = () => api.get('/resources/filter-options');

// ========== BULK OPERATIONS ==========
export const bulkCreateResources = (resources) => api.post('/resources/bulk', resources);
export const bulkUpdateResources = (resources) => api.put('/resources/bulk', resources);
export const bulkDeleteResources = (ids) => api.delete('/resources/bulk', { data: ids });
export const bulkUpdateStatus = (ids, status) => api.put('/resources/bulk/status', { ids, status });
export const bulkUpdateCondition = (ids, condition) => api.put('/resources/bulk/condition', { ids, condition });

// ========== BOOKINGS ==========
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = () => api.get('/bookings');
export const approveBooking = (id, reason) => api.put(`/bookings/${id}/approve`, null, { params: { reason } });
export const rejectBooking = (id, reason) => api.put(`/bookings/${id}/reject`, null, { params: { reason } });

// ========== TICKETS ==========
export const createTicket = (formData) =>
  api.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyTickets = () => api.get('/tickets/my');
export const getAssignedTickets = () => api.get('/tickets/assigned');
export const getAllTickets = () => api.get('/tickets');
export const getTicket = (id) => api.get(`/tickets/${id}`);                    // <-- NEW
export const updateTicketStatus = (id, status, resolutionNotes) =>
  api.put(`/tickets/${id}/status`, null, { params: { status, resolutionNotes } });
export const assignTicket = (id, assigneeId) => api.put(`/tickets/${id}/assign`, null, { params: { assigneeId } });
export const addComment = (id, content) => api.post(`/tickets/${id}/comments`, null, { params: { content } });
export const getTicketComments = (id) => api.get(`/tickets/${id}/comments`);

// ========== NOTIFICATIONS ==========
export const getNotifications = () => api.get('/notifications');
export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// ========== USERS (Admin) ==========
export const getAllUsers = () => api.get('/admin/users');                     // <-- NEW

// ========== AUTH ==========
export const getCurrentUser = () => api.get('/auth/me');

export default api;