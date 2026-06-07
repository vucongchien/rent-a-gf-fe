'use client';

import React from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from './Button';

export const LoginButton: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[13.5px] font-medium text-neutral-900 hidden sm:inline-block font-sans">
          {user.displayName}
        </span>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost"
      onClick={() => login('client')}
    >
      Sign in
    </Button>
  );
};
