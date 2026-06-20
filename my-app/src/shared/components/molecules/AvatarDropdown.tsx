import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '../atoms/Button';
import { Avatar } from '../atoms/Avatar';
import { LogOutIcon } from '../atoms/Icons';

export const AvatarDropdown: React.FC = () => {
  const { user, logout, login, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading) {
    return <div className="w-9 h-9 rounded-full bg-neutral-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button
        onClick={() => login('client')}
        className="h-9 px-3.5 rounded-md bg-neutral-900 text-white font-sans font-semibold text-[13.5px] border-none shadow-none hover:bg-neutral-900/90 active:scale-95"
      >
        Sign in
      </Button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <Button
        variant="unstyled"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="relative flex items-center justify-center p-0 border-none bg-transparent cursor-pointer active:scale-95 rounded-full transition-transform focus-visible:outline-none"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          size={36}
          className="border-2 border-neutral-200 hover:border-chizuru-600 transition-colors"
        />
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] py-1.5 z-50">
          {/* User info */}
          <div className="px-3.5 py-2.5 border-b border-neutral-100">
            <p className="font-sans font-semibold text-[13.5px] text-neutral-900 truncate">{user.displayName}</p>
            <p className="font-mono text-[11px] text-neutral-500 capitalize mt-[1px]">{user.role}</p>
          </div>
          {/* Quick Switch Roles */}
          <div className="px-1.5 py-1 border-b border-neutral-100 flex flex-col gap-0.5">
            <p className="px-2 py-0.5 text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider font-sans select-none">
              Đóng vai (Dev)
            </p>
            {user.role !== 'CLIENT' && (
              <Button
                variant="ghost"
                onClick={async () => {
                  setOpen(false);
                  await login('client');
                  if (typeof window !== 'undefined') {
                    window.location.href = '/explore';
                  }
                }}
                className="w-full justify-start px-2 py-1.5 text-left text-[12.5px] font-sans text-neutral-700 hover:bg-neutral-50 border-none shadow-none font-medium rounded-lg"
              >
                👤 Khách hàng (Minh)
              </Button>
            )}
            {user.role !== 'COMPANION' && (
              <Button
                variant="ghost"
                onClick={async () => {
                  setOpen(false);
                  await login('companion');
                  if (typeof window !== 'undefined') {
                    window.location.href = '/bookings';
                  }
                }}
                className="w-full justify-start px-2 py-1.5 text-left text-[12.5px] font-sans text-neutral-700 hover:bg-neutral-50 border-none shadow-none font-medium rounded-lg"
              >
                👧 Bạn gái (Linh)
              </Button>
            )}
            {user.role !== 'ADMIN' && (
              <Button
                variant="ghost"
                onClick={async () => {
                  setOpen(false);
                  await login('admin');
                  if (typeof window !== 'undefined') {
                    window.location.href = '/explore';
                  }
                }}
                className="w-full justify-start px-2 py-1.5 text-left text-[12.5px] font-sans text-neutral-700 hover:bg-neutral-50 border-none shadow-none font-medium rounded-lg"
              >
                🔑 Admin
              </Button>
            )}
          </div>
          {/* Actions */}
          <Button
            variant="ghost"
            onClick={() => { logout(); setOpen(false); }}
            className="w-full justify-start gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-sans text-rose-500 hover:bg-rose-50 border-none shadow-none font-medium"
          >
            <LogOutIcon size={15} className="flex-none" />
            Đăng xuất
          </Button>
        </div>
      )}
    </div>
  );
};
