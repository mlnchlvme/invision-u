import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { applicationsApi } from '../api/applications';
import { setLogoutCallback } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  useEffect(() => {
    const token    = localStorage.getItem('access_token');
    const role     = localStorage.getItem('role');
    const userId   = localStorage.getItem('user_id');
    const fullName = localStorage.getItem('full_name');
    const appId    = localStorage.getItem('app_id');
    if (token && role) setUser({ token, role, userId, fullName, appId });
    setLoading(false);
  }, []);

  const persist = (data, name) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user_id', data.user_id);
    if (name) localStorage.setItem('full_name', name);
    setUser({
      token:    data.access_token,
      role:     data.role,
      userId:   data.user_id,
      fullName: name || '',
      appId:    localStorage.getItem('app_id') || null,
    });
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    persist(data);
    return data;
  };

  const register = async (email, password, full_name) => {
    const data = await authApi.register({ email, password, full_name, role: 'applicant' });
    persist(data, full_name);
    try {
      const app = await applicationsApi.create({ program: 'foundation', country: 'KZ', city: '' });
      localStorage.setItem('app_id', app.id);
      setUser(u => ({ ...u, appId: app.id }));
    } catch {}
    return data;
  };

  const setFullName = (name) => {
    localStorage.setItem('full_name', name);
    setUser(u => ({ ...u, fullName: name }));
  };

  const setAppId = (id) => {
    localStorage.setItem('app_id', id);
    setUser(u => ({ ...u, appId: id }));
  };

  const createApplicationIfMissing = async () => {
    if (user?.appId) return user.appId;
    try {
      const app = await applicationsApi.create({ program: 'foundation', country: 'KZ', city: '' });
      setAppId(app.id);
      return app.id;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      setFullName, setAppId,
      createApplicationIfMissing,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}