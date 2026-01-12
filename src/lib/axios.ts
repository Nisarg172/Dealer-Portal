import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Important for sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here for error handling, logging, etc.
// For example, a response interceptor to handle common errors:
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error('API Error:', error.response?.data || error.message);
    // You can add more sophisticated error handling here, 
    // e.g., redirect to login on 401, show a generic error message, etc.
    return Promise.reject(error);
  }
);

export default apiClient;