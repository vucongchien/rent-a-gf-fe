'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/shared/contexts/NotificationContext';
import { Avatar } from '@/shared/components/atoms/Avatar';
import { 
  ChatIcon, 
  CalendarIcon, 
  CalendarXIcon, 
  CoinIcon, 
  InfoIcon, 
  SakuraIcon,
  CheckIcon
} from '@/shared/components/atoms/Icons';
import type { Notification } from '@/shared/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsReadLocal: (id: string) => void;
}

// Helper định dạng thời gian thân thiện bằng tiếng Việt
function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsReadLocal,
}) => {
  const router = useRouter();
  const { decrementUnreadCount } = useNotifications();
  const { isRead, title, body, createdAt, senderAvatar, senderName, type } = notification;

  // 1. Phân định xem có hiển thị Avatar hay không (Chỉ hiển thị Avatar cho các tương tác người dùng)
  const shouldRenderAvatar =
    (type.startsWith('BOOKING_') || type === 'CHAT_MESSAGE' || type === 'NEW_REVIEW') &&
    !!senderAvatar;

  // 2. Fallback sang các Icon màu nước vẽ tay tinh tế theo từng loại
  const getIconAndStyle = () => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return {
          icon: <ChatIcon size={20} className="text-blue-500" />,
          bg: 'bg-blue-50/60 text-blue-500'
        };
      case 'BOOKING_REQUESTED':
        return {
          icon: <CalendarIcon size={20} className="text-chizuru-500" />,
          bg: 'bg-chizuru-50/60 text-chizuru-500'
        };
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_COMPLETED':
        return {
          icon: <CheckIcon size={20} className="text-emerald-500" />,
          bg: 'bg-emerald-50/60 text-emerald-500'
        };
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
        return {
          icon: <CalendarXIcon size={20} className="text-rose-500" />,
          bg: 'bg-rose-50/60 text-rose-500'
        };
      case 'PAYMENT_SUCCESS':
        return {
          icon: <CoinIcon size={20} className="text-amber-500" />,
          bg: 'bg-amber-50/60 text-amber-500'
        };
      case 'PROMOTION_VOUCHER':
        return {
          icon: <SakuraIcon size={20} className="text-chizuru-500" />,
          bg: 'bg-chizuru-50/30 text-chizuru-500'
        };
      case 'OTP_CODE':
      case 'SYSTEM_MAINTENANCE':
      case 'PROFILE_REMINDER':
      case 'SYSTEM':
      default:
        return {
          icon: <InfoIcon size={20} className="text-neutral-500" />,
          bg: 'bg-neutral-100/70 text-neutral-500'
        };
    }
  };

  const { icon, bg } = getIconAndStyle();

  // 3. Xử lý khi click vào thông báo (Optimistic Update & Redirect)
  const handleClick = async () => {
    if (!isRead) {
      // Optimistic update biến mất dấu chấm đỏ trên UI ngay lập tức
      onMarkAsReadLocal(notification.id);
      decrementUnreadCount();

      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
        });
      } catch (err) {
        console.error('[NotificationItem] Lỗi call PATCH read API:', err);
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 py-3.5 px-4 md:p-4 rounded-none md:rounded-2xl border-none md:border transition-all duration-300 ease-out cursor-pointer shadow-none md:shadow-sm select-none ${
        isRead
          ? 'bg-white md:border-neutral-100/60 md:hover:bg-neutral-50/40 md:hover:-translate-y-[1px] md:hover:shadow-md'
          : 'bg-chizuru-50/10 md:border-chizuru-100/20 md:hover:bg-chizuru-50/20 md:hover:-translate-y-[1px] md:hover:shadow-md'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Cột 1: Avatar hoặc Icon màu nước */}
      <div className="shrink-0">
        {shouldRenderAvatar ? (
          <Avatar
            src={senderAvatar}
            name={senderName || 'User'}
            size={48}
            className="border border-chizuru-100/30"
          />
        ) : (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Cột 2: Nội dung văn bản */}
      <div className="flex-1 min-w-0 mt-0.5">
        <div className="flex justify-between items-start gap-2">
          <h4 className={`text-sm leading-tight truncate ${isRead ? 'font-medium text-neutral-800' : 'font-semibold text-neutral-900'}`}>
            {title}
          </h4>
          <span className="text-[11px] text-neutral-400 font-normal shrink-0 whitespace-nowrap">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
        <p className={`text-xs mt-1 leading-relaxed ${isRead ? 'text-neutral-500 font-normal' : 'text-neutral-700 font-medium'}`}>
          {body}
        </p>
      </div>

      {/* Cột 3: Chấm đỏ báo chưa đọc */}
      {!isRead && (
        <div className="shrink-0 self-center pl-1">
          <span
            className="block w-2.5 h-2.5 rounded-full bg-chizuru-500 animate-pulse shadow-[0_0_8px_rgba(251,105,153,0.6)]"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
