'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User, ApiErrorClass } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'taskflow_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate auth state from localStorage after the component mounts
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { user: storedUser, token: storedToken } = JSON.parse(stored);
        if (storedToken && storedToken.startsWith('mock-token-')) {
          setUser(storedUser);
          setToken(storedToken);
          apiClient.setToken(storedToken);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Set API token if we have one
  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await apiClient.login(email, password);
      setUser(result.user);
      setToken(result.token);
      apiClient.setToken(result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const result = await apiClient.register(name, email, password);
      setUser(result.user);
      setToken(result.token);
      apiClient.setToken(result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
