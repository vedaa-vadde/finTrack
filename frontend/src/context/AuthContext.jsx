import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userInfo && token) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify({ email: data.email, _id: data._id }));
    localStorage.setItem('token', data.token);
    setUser({ email: data.email, _id: data._id });
  };

  const signup = async (email, password) => {
    const { data } = await api.post('/auth/signup', { email, password });
    localStorage.setItem('user', JSON.stringify({ email: data.email, _id: data._id }));
    localStorage.setItem('token', data.token);
    setUser({ email: data.email, _id: data._id });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
