import api from './axios';

export async function logout() {
  try {
    await api.post('/auth/logout');
    // Redirect to login page after successful logout
    window.location.href = '/login'; 
  } catch (error) {
    console.error('Logout failed:', error);
    // Handle error, e.g., show a notification to the user
  }
}

