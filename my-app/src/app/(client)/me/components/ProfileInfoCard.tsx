import React from 'react';
import type { User } from '@/shared/types';

interface ProfileInfoCardProps {
  user: User | null;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <p className="font-sans text-sm text-neutral-500">Không tìm thấy thông tin tài khoản.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-100 shadow-[0_4px_14px_rgba(0,0,0,0.08)] mb-4">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={user.avatarUrl} 
            alt={user.displayName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-sans font-bold text-2xl">
            {user.displayName.charAt(0)}
          </div>
        )}
      </div>

      <h2 className="font-sans font-bold text-lg text-neutral-900 leading-tight mb-1 text-center truncate w-full max-w-[240px]">
        {user.displayName}
      </h2>
      <p className="font-sans text-[13px] text-neutral-500 truncate w-full text-center max-w-[240px]">
        {user.email}
      </p>
    </div>
  );
};

