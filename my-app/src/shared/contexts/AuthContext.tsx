'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, UserRole } from '@/shared/types';
import { logoutAction } from '@/app/actions/auth';

// Re-export cho backward compatibility
export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role?: 'client' | 'companion' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  /** Refetch /api/auth/me — gọi sau OAuth popup success / khi cần đồng bộ lại. */
  refreshUser: () => Promise<User | null>;
  /**
   * Force refresh token rotation — POST /api/auth/refresh.
   * Dùng khi caller nhận 401 từ một API call để cứu session trước khi đẩy user về login.
   * Trả user mới nếu thành công, null nếu refresh fail (cookies cũng đã được BE clear).
   */
  refreshSession: () => Promise<User | null>;
  /**
   * Gọi khi một client fetch nào đó trả 401. Thử rotate trước; nếu fail thì
   * coi như session đã chết — set user=null, caller có thể mở AuthRequiredModal cục bộ.
   */
  handleUnauthorized: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser !== undefined ? initialUser : null);
  const [isLoading, setIsLoading] = useState(initialUser === undefined);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    // Lưới an toàn: nếu /me trả null (middleware không refresh được vì lý do gì đó),
    // thử force POST /api/auth/refresh rồi refetch 1 lần trước khi kết luận logout.
    const readMe = async (): Promise<User | null> => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      return (await res.json()) as User | null;
    };

    try {
      let userObj = await readMe();
      if (!userObj) {
        const rotated = await fetch('/api/auth/refresh', { method: 'POST' });
        if (rotated.ok) {
          userObj = await readMe();
        }
      }
      setUser(userObj);
      return userObj;
    } catch (err) {
      console.error('Failed to fetch user', err);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** POST /api/auth/refresh → set cookie mới qua BFF → refetch /api/auth/me. */
  const refreshSession = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Failed to refresh session', err);
      setUser(null);
      return null;
    }
    return fetchUser();
  }, [fetchUser]);

  const handleUnauthorized = useCallback(() => refreshSession(), [refreshSession]);

  useEffect(() => {
    if (initialUser === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUser();
    }
  }, [fetchUser, initialUser]);

  // Revalidate khi tab quay lại foreground — session có thể đã thay đổi (rotate, logout
  // ở tab khác, network reconnect). Không poll khi tab hidden để tránh idle traffic.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [fetchUser]);

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

  const refreshUser = useCallback(() => fetchUser(), [fetchUser]);

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
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      refreshUser,
      refreshSession,
      handleUnauthorized,
    }}>
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
