'use client';

import React from 'react';
import { Button } from './Button';
import { BellIcon } from './Icons';

export interface NotificationButtonProps {
  className?: string;
  hasUnread?: boolean;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  className = '',
  hasUnread = true,
}) => {
  return (
    <Button
      variant="ghost"
      aria-label="Notifications"
      className={`relative w-10 h-10 p-0 rounded-xl flex items-center justify-center border-none shadow-none text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 ${className}`}
    >
      <BellIcon size={18} />
      {hasUnread && (
        <span
          className="absolute top-[9px] right-[9px] w-1.5 h-1.5 rounded-full bg-chizuru-600 animate-pulse"
          aria-hidden="true"
        />
      )}
    </Button>
  );
};
