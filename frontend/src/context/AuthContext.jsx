import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      setBusinesses(response.data.businesses);
      
      // Set default business
      const savedBusinessId = localStorage.getItem('currentBusinessId');
      const defaultBusiness = response.data.businesses.find(b => b.id === savedBusinessId) 
        || response.data.businesses[0];
      setCurrentBusiness(defaultBusiness);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    setBusinesses(response.data.businesses);
    setCurrentBusiness(response.data.businesses[0]);
    localStorage.setItem('currentBusinessId', response.data.businesses[0]?.id);
  };

  const register = async (data) => {
    const response = await authService.register(data);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    setBusinesses([response.data.business]);
    setCurrentBusiness(response.data.business);
    localStorage.setItem('currentBusinessId', response.data.business.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentBusinessId');
    setUser(null);
    setBusinesses([]);
    setCurrentBusiness(null);
  };

  const switchBusiness = (business) => {
    setCurrentBusiness(business);
    localStorage.setItem('currentBusinessId', business.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        businesses,
        currentBusiness,
        loading,
        login,
        register,
        logout,
        switchBusiness,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
