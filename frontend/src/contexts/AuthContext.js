import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('access_token');
    const r = localStorage.getItem('refresh_token');
    const storedUsername = localStorage.getItem('username');
    
    if (t && r) {
      setToken(t);
      setRefreshToken(r);
      try {
        const decoded = jwtDecode(t);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            username: storedUsername || decoded.username || decoded.user_id,
            ...decoded
          });
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { access, refresh, username } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', username);
      
      const decoded = jwtDecode(access);
      setToken(access);
      setRefreshToken(refresh);
      setUser({ username, ...decoded });
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await apiLogout({ refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    navigate('/login');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};