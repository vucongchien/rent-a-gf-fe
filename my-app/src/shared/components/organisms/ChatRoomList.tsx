'use client';

import React, { useState, useMemo } from 'react';
import { ChatRoomItem } from '@/shared/components/molecules/ChatRoomItem';
import { SearchIcon, SakuraIcon } from '@/shared/components/atoms/Icons';
import type { ChatRoom } from '@/shared/types';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  activeRoomId: string;
  role: 'CLIENT' | 'COMPANION';
  onSelectRoom: (roomId: string) => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  activeRoomId,
  role,
  onSelectRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isClientMode = role === 'CLIENT';

  // Lọc phòng theo tên đối tác
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) =>
      r.companionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  // Accent color theo theme
  const borderFocusClass = isClientMode
    ? 'focus-within:border-chizuru-400 focus-within:ring-1 focus-within:ring-chizuru-100'
    : 'focus-within:border-mami-400 focus-within:ring-1 focus-within:ring-mami-100';

  return (
    <div className="w-full h-full flex flex-col bg-white font-sans border-r border-neutral-100/80">
      
      {/* Khung tìm kiếm ở đầu danh sách */}
      <div className="p-4 border-b border-neutral-100/50 shrink-0">
        <div className={`relative flex items-center h-10 w-full px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/20 transition-all ${borderFocusClass}`}>
          <SearchIcon size={16} className="text-neutral-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isClientMode ? "Tìm kiếm bạn gái..." : "Tìm kiếm khách hàng..."}
            className="w-full text-xs font-normal bg-transparent outline-none placeholder-neutral-400 text-neutral-800"
          />
        </div>
      </div>

      {/* Danh sách phòng */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 scrollbar-none">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.chatRoomId}
              room={room}
              isActive={room.chatRoomId === activeRoomId}
              role={role}
              onClick={() => onSelectRoom(room.chatRoomId)}
            />
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto border border-dashed border-neutral-200 bg-neutral-50/10 rounded-2xl mx-1 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-chizuru-50/20 flex items-center justify-center mb-3">
              <SakuraIcon size={24} className="text-chizuru-300 opacity-80" />
            </div>
            <h4 className="text-xs font-semibold text-neutral-800">Không tìm thấy cuộc trò chuyện</h4>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] leading-relaxed">
              {rooms.length === 0
                ? (isClientMode ? 'Bạn cần có lịch hẹn được xác nhận để bắt đầu trò chuyện.' : 'Bạn chưa có yêu cầu cuộc hẹn nào đang hoạt động.')
                : 'Thử tìm kiếm với một từ khóa khác.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatRoomList;
