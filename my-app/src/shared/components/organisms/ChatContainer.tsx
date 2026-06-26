'use client';

import React from 'react';
import { useChat } from '@/shared/hooks/useChat';
import { useAuth } from '@/shared/contexts/AuthContext';
import { ChatRoomList } from './ChatRoomList';
import { ChatWindow } from './ChatWindow';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';
import { Button } from '@/shared/components/atoms/Button';

interface ChatContainerProps {
  role: 'CLIENT' | 'COMPANION';
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ role }) => {
  const { user } = useAuth();
  
  // currentUserId từ auth — page đã guard trước nên user không null khi đến đây
  const currentUserId = user?.userId ?? '';

  const {
    rooms,
    messages,
    activeRoomId,
    activeRoom,
    isLoadingRooms,
    isLoadingMessages,
    roomsError,
    selectRoom,
    sendMessage,
    retryMessage,
  } = useChat(role, currentUserId);

  // Đang tải dữ liệu phòng lần đầu
  if (isLoadingRooms) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-neutral-400">
        <SpinnerIcon size={32} className="text-neutral-300" />
      </div>
    );
  }

  // Lỗi tải dữ liệu phòng
  if (roomsError) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center p-6 text-center text-rose-500 font-medium font-sans">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="text-sm">{roomsError}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="unstyled"
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all cursor-pointer"
        >
          Tải lại trang
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-white rounded-none md:rounded-3xl border border-none md:border md:border-neutral-100/80 md:shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
      
      {/* 1. Sidebar danh sách phòng chat */}
      <div
        className={`w-full md:w-[320px] lg:w-[360px] h-full shrink-0 ${
          activeRoomId ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatRoomList
          rooms={rooms}
          activeRoomId={activeRoomId}
          role={role}
          onSelectRoom={selectRoom}
        />
      </div>

      {/* 2. Cửa sổ nội dung hội thoại */}
      <div
        className={`flex-1 h-full ${
          activeRoomId ? 'block' : 'hidden md:block'
        }`}
      >
        <ChatWindow
          room={activeRoom}
          messages={messages}
          currentUserId={currentUserId}
          role={role}
          isLoadingMessages={isLoadingMessages}
          onSendMessage={sendMessage}
          onRetryMessage={retryMessage}
          onBack={() => selectRoom('')}
        />
      </div>

    </div>
  );
};
export default ChatContainer;
