'use client';

import React from 'react';
import type { OptimisticMessage } from '@/shared/hooks/useChat';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';

interface ChatMessageBubbleProps {
  message: OptimisticMessage;
  currentUserId: string;
  role: 'CLIENT' | 'COMPANION';
  onRetry: () => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  currentUserId,
  role,
  onRetry,
}) => {
  const isSelf = message.senderId === currentUserId;
  const isClientMode = role === 'CLIENT';

  // Format thời gian gửi tin nhắn (ví dụ: "21:30")
  const formatMsgTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  // Xác định bong bóng chat của bản thân và đối phương
  const selfBubbleBg = isClientMode
    ? 'bg-chizuru-500 text-neutral-900 shadow-sm rounded-tr-[4px]' // Hồng Chizuru
    : 'bg-mami-500 text-neutral-900 shadow-sm rounded-tr-[4px]';   // Vàng Mami

  const partnerBubbleBg = 'bg-neutral-100 text-neutral-800 rounded-tl-[4px]';

  return (
    <div className={`flex w-full flex-col ${isSelf ? 'items-end' : 'items-start'} gap-1 font-sans`}>
      <div className={`flex items-end gap-2 max-w-[80%] ${isSelf ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Nút gửi lại nếu lỗi */}
        {isSelf && message.isError && (
          <Button
            onClick={onRetry}
            title="Gửi lại"
            variant="unstyled"
            className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 border border-rose-200 flex items-center justify-center text-xs font-bold hover:bg-rose-200 cursor-pointer transition-all active:scale-90"
          >
            !
          </Button>
        )}

        {/* Spinner đang gửi */}
        {isSelf && message.isSending && (
          <SpinnerIcon size={14} className="text-neutral-400 mb-2" />
        )}

        {/* Bong bóng tin nhắn */}
        <div
          className={`px-4 py-2.5 rounded-[18px] text-[13.5px] font-normal leading-relaxed break-words border border-transparent select-text ${
            isSelf ? `${selfBubbleBg} text-right` : `${partnerBubbleBg} text-left`
          } ${message.isError ? 'border-rose-200 bg-rose-50/50 text-rose-700' : ''}`}
        >
          {message.content}
        </div>
      </div>

      {/* Thời gian nhắn */}
      <span className="text-[10px] text-neutral-400 font-medium px-2 mb-1.5 select-none">
        {formatMsgTime(message.createdAt)}
        {message.isError && <span className="text-rose-500 font-semibold ml-1">· Lỗi gửi</span>}
        {message.isSending && <span className="text-neutral-400 font-normal ml-1">· Đang gửi</span>}
      </span>
    </div>
  );
};
