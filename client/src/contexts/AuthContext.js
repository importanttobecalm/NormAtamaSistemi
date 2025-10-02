import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
// Using relative path since we have proxy configured in package.json
axios.defaults.baseURL = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/verify');
          setUser(response.data.user);
          setLoading(false);
        } catch (error) {
          console.error('Access token verification failed, trying to refresh:', error);
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            console.error('No refresh token found, logging out.');
            logout();
            setLoading(false);
            return;
          }

          try {
            const refreshResponse = await axios.post('/auth/refresh', { refreshToken });
            const { token: newToken } = refreshResponse.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // The component will re-render and the useEffect will run again with the new token.
            // We don't set loading to false here, because the verification process will restart.
          } catch (refreshError) {
            console.error('Refresh token verification failed, logging out:', refreshError);
            logout();
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (credentials, userType) => {
    try {
      const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/teacher/login';
      const response = await axios.post(endpoint, credentials);

      const { token: newToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş yapılırken hata oluştu';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'admin',
    isTeacher: user?.userType === 'teacher'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};