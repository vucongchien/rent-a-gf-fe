'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'client' | 'companion' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  companionApplicationStatus: 'idle' | 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role?: 'client' | 'companion' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { data } = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, []);

  const login = async (role: 'client' | 'companion' | 'admin' = 'client') => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/mock-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      await fetchUser();
    } catch (err) {
      console.error('Failed to login', err);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Failed to logout', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
