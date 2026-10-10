import React, { createContext, useContext, useState } from 'react';

interface User {
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, username: string, email: string, roles: string[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') {
          return {
            username: parsed.username || '',
            email: parsed.email || '',
            roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse auth data:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  });

  const login = (token: string, username: string, email: string, roles: string[]) => {
    const userObj = { username, email, roles: Array.isArray(roles) ? roles : [] };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = Boolean(user && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN'));

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
