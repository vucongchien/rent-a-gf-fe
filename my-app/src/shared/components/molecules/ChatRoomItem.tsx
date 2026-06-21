'use client';

import React from 'react';
import { Avatar } from '@/shared/components/atoms/Avatar';
import { Button } from '@/shared/components/atoms/Button';
import type { ChatRoom } from '@/shared/types';

interface ChatRoomItemProps {
  room: ChatRoom;
  isActive: boolean;
  role: 'CLIENT' | 'COMPANION';
  onClick: () => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isActive,
  role,
  onClick,
}) => {
  const isClientMode = role === 'CLIENT';

  // Định dạng thời gian nhắn tin cuối cùng
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      
      // Nếu là hôm nay, hiện Giờ:Phút
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      
      // Nếu là hôm qua, hiện "Hôm qua"
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
      }

      // Các ngày khác thì hiện Ngày/Tháng
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
      return '';
    }
  };

  // Xác định các class màu sắc cho theme tương ứng
  const activeClass = isClientMode
    ? 'bg-chizuru-50/50 text-chizuru-900 border border-chizuru-100/40 shadow-sm'
    : 'bg-mami-50/50 text-mami-900 border border-mami-100/40 shadow-sm';

  const hoverClass = isClientMode
    ? 'hover:bg-chizuru-50/20 text-neutral-800'
    : 'hover:bg-mami-50/20 text-neutral-800';

  const badgeColor = isClientMode
    ? 'bg-chizuru-500 text-white'
    : 'bg-mami-500 text-neutral-900';

  return (
    <Button
      onClick={onClick}
      variant="unstyled"
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 border border-transparent cursor-pointer text-left ${
        isActive ? activeClass : `bg-white border-neutral-100/50 ${hoverClass}`
      }`}
    >
      {/* Avatar của đối tác chat */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={room.companionAvatarUrl}
          name={room.companionName}
          size={42}
          className="rounded-xl border border-neutral-100"
        />
        
        {/* Indicator nếu phòng đang hoạt động (ACTIVE) */}
        {room.status === 'ACTIVE' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Thông tin phòng chat */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-sm font-semibold text-neutral-900 font-sans truncate pr-2">
            {room.companionName}
          </h4>
          <span className="text-[10.5px] font-medium text-neutral-400 font-sans shrink-0">
            {formatTime(room.lastMessageAt)}
          </span>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <p className="text-xs text-neutral-500 truncate font-normal leading-relaxed">
            {room.lastMessage || (
              <span className="text-neutral-400 italic">Chưa có tin nhắn nào</span>
            )}
          </p>

          {/* Badge đếm số tin nhắn chưa đọc */}
          {room.unreadCount !== undefined && room.unreadCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-5 h-5 ${badgeColor}`}>
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Button>
  );
};
