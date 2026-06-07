import React, { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '../atoms/Button';
import { Avatar } from '../atoms/Avatar';
import { LogOutIcon, ChevronDownIcon } from '../atoms/Icons';

export const SidebarUserSection: React.FC = () => {
  const { user, logout, login, isLoading } = useAuth();
  const [userDropOpen, setUserDropOpen] = useState(false);

  return (
    <div className="px-3 pb-[max(20px,env(safe-area-inset-bottom))] pt-2 border-t border-neutral-100">
      {isLoading ? (
        <div className="h-[60px] bg-neutral-100 rounded-xl animate-pulse" />
      ) : user ? (
        <div>
          {/* Dropdown — hiện phía trên row khi mở */}
          <div
            className={`
              overflow-hidden transition-all duration-200 ease-out mb-1.5
              ${userDropOpen ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <Button
              variant="ghost"
              onClick={() => { logout(); setUserDropOpen(false); }}
              className="w-full justify-start gap-[10px] px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 font-sans font-medium text-sm border-none shadow-none"
            >
              <LogOutIcon size={16} />
              Đăng xuất
            </Button>
          </div>

          {/* User row — tap để toggle dropdown */}
          <Button
            variant="ghost"
            onClick={() => setUserDropOpen((v) => !v)}
            aria-expanded={userDropOpen}
            aria-label="User menu"
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 font-normal hover:bg-neutral-50 active:bg-neutral-100 transition-colors border-solid shadow-none"
          >
            <Avatar src={user.avatarUrl} name={user.displayName} size={38} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-sans font-semibold text-sm text-neutral-900 leading-tight truncate">
                {user.displayName}
              </span>
              <span className="text-xs text-neutral-500 font-mono capitalize">
                {user.role}
              </span>
            </div>
            {/* ChevronUp/Down theo trạng thái mở */}
            <ChevronDownIcon
              size={14}
              className={`text-neutral-400 flex-none transition-transform duration-200 ${userDropOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
      ) : (
        /* Not logged in */
        <Button
          variant="primary"
          onClick={() => login('client')}
          className="w-full h-12 text-sm font-semibold rounded-xl"
        >
          Đăng nhập
        </Button>
      )}
    </div>
  );
};
