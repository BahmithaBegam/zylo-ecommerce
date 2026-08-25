import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ShippingAddress } from '../types/index.js';
import api from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name?: string, phone?: string, email?: string) => Promise<void>;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('novacart_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('novacart_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('novacart_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Authentication check failed:', err);
      localStorage.removeItem('novacart_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const receivedToken = response.data.token;
      localStorage.setItem('novacart_token', receivedToken);
      setToken(receivedToken);
      setUser(response.data.user);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, confirmPassword?: string) => {
    const response = await api.post('/auth/register', { name, email, password, phone, confirmPassword });
    if (response.data.success) {
      const receivedToken = response.data.token;
      localStorage.setItem('novacart_token', receivedToken);
      setToken(receivedToken);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('novacart_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name?: string, phone?: string, email?: string) => {
    const response = await api.put('/auth/profile', { name, phone, email });
    if (response.data.success) {
      setUser(response.data.user);
    }
  };

  const addAddress = async (address: Omit<ShippingAddress, 'id'>) => {
    const response = await api.post('/auth/address', address);
    if (response.data.success && user) {
      setUser({ ...user, addresses: response.data.addresses });
    }
  };

  const deleteAddress = async (id: string) => {
    const response = await api.delete(`/auth/address/${id}`);
    if (response.data.success && user) {
      setUser({ ...user, addresses: response.data.addresses });
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user ? (user.role === 'admin' || user.role === 'staff') : false;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
