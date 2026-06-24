'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '@/shared/types';
import { logoutAction } from '@/app/actions/auth';

// Re-export cho backward compatibility
export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role?: 'client' | 'companion' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  /** Refetch /api/auth/me — gọi sau OAuth popup success */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser !== undefined ? initialUser : null);
  const [isLoading, setIsLoading] = useState(initialUser === undefined);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userObj = await res.json();
        setUser(userObj);
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
    if (initialUser === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUser();
    }
  }, [initialUser]);

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
      await logoutAction();
      setUser(null);
    } catch (err) {
      console.error('Failed to logout', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: fetchUser }}>
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
