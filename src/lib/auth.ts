import api from './axios';
import { clearSessionExpiry } from './session';

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    clearSessionExpiry();
  }
}

