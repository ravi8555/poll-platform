// frontend/src/services/authService.ts
import api from './api';
import type { User } from '../types/types';

export const authService = {
  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await api.post('/auth/login', { email, password });
    // Store token from response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User }> {
    const response = await api.post('/auth/register', { name, email, password });
    // Store token from response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  oidcLogin(): void {
    window.location.href = `${api.defaults.baseURL}/auth/oidc/login`;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    // localStorage.removeItem('token');
  },
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
};