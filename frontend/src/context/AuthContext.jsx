import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.user || res.data); // handles structure variations
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data;
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials or connection issue',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password }); // wait, our endpoint is /auth/register or /api/auth/register? Axios instance baseURL is /api, so we use /auth/register
      // Let's verify and use '/auth/register' since baseUrl is /api
      const endpointRes = await api.post('/auth/register', { name, email, password });
      if (endpointRes.data.success) {
        const userData = endpointRes.data;
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: endpointRes.data.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await api.put('/auth/profile', updatedData);
      if (res.data.success) {
        const updatedUser = res.data;
        // Keep the token
        if (updatedUser.token) {
          localStorage.setItem('token', updatedUser.token);
          setToken(updatedUser.token);
        }
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Update failed' };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed. Try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
