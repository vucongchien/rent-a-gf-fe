'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { ChatMessageBubble } from '@/shared/components/molecules/ChatMessageBubble';
import { ChatInputArea } from '@/shared/components/molecules/ChatInputArea';
import { Avatar } from '@/shared/components/atoms/Avatar';
import { SpinnerIcon, ChevronLeftIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';
import type { ChatRoom } from '@/shared/types';
import type { OptimisticMessage } from '@/shared/hooks/useChat';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: OptimisticMessage[];
  currentUserId: string;
  role: 'CLIENT' | 'COMPANION';
  isLoadingMessages: boolean;
  onSendMessage: (text: string) => void;
  onRetryMessage: (tempId: string) => void;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  currentUserId,
  role,
  isLoadingMessages,
  onSendMessage,
  onRetryMessage,
  onBack,
}) => {
  const isClientMode = role === 'CLIENT';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối bằng container nội bộ để tránh cuộn toàn trang
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Cuộn mượt khi đổi phòng và khi có tin nhắn mới
  useEffect(() => {
    if (room?.chatRoomId) {
      scrollToBottom('smooth');
    }
  }, [room?.chatRoomId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  // Phân nhóm tin nhắn theo ngày để tăng độ chuyên nghiệp
  const formatDateLabel = (dateStr: string) => {
    if (dateStr === 'unknown') return 'Không rõ ngày';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Hôm nay';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: OptimisticMessage[] } = {};
    messages.forEach((msg) => {
      try {
        const dateStr = new Date(msg.createdAt).toDateString();
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(msg);
      } catch {
        const key = 'unknown';
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
      }
    });
    return Object.entries(groups).map(([dateStr, msgs]) => ({
      dateLabel: formatDateLabel(dateStr),
      msgs,
    }));
  }, [messages]);

  if (!room) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50/20 text-neutral-400 font-sans p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full border border-dashed border-neutral-300 flex items-center justify-center mb-4 text-neutral-300 text-2xl">
          💬
        </div>
        <h4 className="text-sm font-semibold text-neutral-700">Chưa chọn cuộc trò chuyện</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-[280px] leading-relaxed">
          Chọn một cuộc trò chuyện từ danh sách bên cạnh để bắt đầu trao đổi thông tin.
        </p>
      </div>
    );
  }

  const isLocked = room.status === 'INACTIVE';
  const statusColor = isLocked
    ? 'bg-neutral-100 text-neutral-500'
    : isClientMode
      ? 'bg-chizuru-50/50 text-chizuru-600 border border-chizuru-100/30'
      : 'bg-mami-50/50 text-mami-700 border border-mami-100/30';

  return (
    <div className="w-full h-full flex flex-col bg-neutral-50/30 font-sans">
      
      {/* Header Khung Chat */}
      <div className="h-16 px-4 bg-white border-b border-neutral-100/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Nút Back cho mobile view */}
          {onBack && (
            <Button
              onClick={onBack}
              title="Quay lại"
              variant="unstyled"
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 mr-1 md:hidden cursor-pointer flex items-center justify-center"
            >
              <ChevronLeftIcon size={20} className="stroke-[2.5]" />
            </Button>
          )}

          {/* Avatar partner */}
          <Avatar
            src={room.companionAvatarUrl}
            name={room.companionName}
            size={38}
            className="rounded-xl border border-neutral-100"
          />

          <div className="min-w-0">
            <h3 className="text-[14.5px] font-bold text-neutral-900 leading-tight truncate">
              {room.companionName}
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium font-mono leading-none">
              Booking: #{room.bookingId}
            </span>
          </div>
        </div>

        {/* Trạng thái phòng chat */}
        <span className={`text-[10.5px] font-bold px-2 py-0.75 rounded-lg select-none ${statusColor}`}>
          {isLocked ? 'Đã khóa' : 'Hoạt động'}
        </span>
      </div>

      {/* Vùng Tin Nhắn */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none"
      >
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            <SpinnerIcon size={24} className="text-neutral-300" />
          </div>
        ) : messages.length > 0 ? (
          groupedMessages.map((group) => (
            <div key={group.dateLabel} className="flex flex-col gap-2.5">
              {/* Vạch kẻ chia ngày */}
              <div className="flex items-center justify-center my-3 select-none">
                <div className="h-[1px] flex-1 bg-neutral-100/60" />
                <span className="text-[10px] text-neutral-400 font-bold px-3 uppercase tracking-wider bg-transparent">
                  {group.dateLabel}
                </span>
                <div className="h-[1px] flex-1 bg-neutral-100/60" />
              </div>

              {/* Danh sách tin nhắn trong ngày */}
              {group.msgs.map((msg) => (
                <ChatMessageBubble
                  key={msg.messageId}
                  message={msg}
                  currentUserId={currentUserId}
                  role={role}
                  onRetry={() => onRetryMessage(msg.messageId)}
                />
              ))}
            </div>
          ))
        ) : (
          /* Empty Chat Area */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 select-none p-6">
            <span className="text-2xl mb-2">👋</span>
            <h5 className="text-xs font-semibold text-neutral-700">Bắt đầu cuộc trò chuyện</h5>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] leading-relaxed">
              Gửi một lời chào dễ thương để mở lời cùng đối tác của bạn nhé.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input gửi tin nhắn */}
      <ChatInputArea
        isLocked={isLocked}
        role={role}
        onSend={onSendMessage}
      />
    </div>
  );
};
export default ChatWindow;
