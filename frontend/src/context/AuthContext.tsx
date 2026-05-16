// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/types';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Add this import

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  oidcLogin: () => void;
  logout: () => Promise<void>;
  getWebSocketToken: () => Promise<string | null>; // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  // Add this function
  const getWebSocketToken = async (): Promise<string | null> => {
    try {
      const response = await api.get('/auth/token');
      return response.data.token;
    } catch (error) {
      console.error('Failed to get WebSocket token:', error);
      return null;
    }
  };

  const checkAuth = useCallback(async () => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const { user: userData } = await authService.login(email, password);
    setUser(userData);
    navigate('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: userData } = await authService.register(name, email, password);
    setUser(userData);
    navigate('/dashboard');
  };

  const oidcLogin = () => {
    authService.oidcLogin();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, oidcLogin, logout, getWebSocketToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 