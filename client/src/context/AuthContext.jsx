import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (emailOrPhone, password) => {
    const userData = await api.login(emailOrPhone, password);
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    return userData;
  };

  const googleLogin = async (token) => {
    const userData = await api.googleLogin(token);
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, phone = '', address = {}) => {
    const userData = await api.register(name, email, password, phone, address);
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
