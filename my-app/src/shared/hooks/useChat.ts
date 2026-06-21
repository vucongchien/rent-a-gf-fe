'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ChatRoom, ChatMessage } from '@/shared/types';

export interface OptimisticMessage extends ChatMessage {
  isSending?: boolean;
  isError?: boolean;
}

export const useChat = (role: 'CLIENT' | 'COMPANION') => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc roomId từ URL query
  const activeRoomId = searchParams.get('roomId') || '';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // Dùng ref để lưu trữ tin nhắn hiện tại nhằm tránh closure stale trong polling
  const messagesRef = useRef<OptimisticMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 1. Tải danh sách phòng chat
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/interaction/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        setRoomsError(null);
      } else {
        setRoomsError('Không thể tải danh sách phòng chat');
      }
    } catch (err) {
      console.error('[useChat] Lỗi fetch rooms:', err);
      setRoomsError('Lỗi kết nối mạng');
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRooms();
  }, [fetchRooms]);

  // 2. Tải tin nhắn của phòng chat đang active
  const fetchMessages = useCallback(async (roomId: string, isSilent = false) => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    if (!isSilent) {
      setIsLoadingMessages(true);
    }

    try {
      const res = await fetch(`/api/interaction/rooms/${roomId}/messages`);
      if (res.ok) {
        const serverMsgs: ChatMessage[] = await res.json();
        
        // Trộn tin nhắn từ server với các tin nhắn đang gửi (optimistic) hoặc lỗi của client
        setMessages((prevMsgs) => {
          const sendingOrErrorMsgs = prevMsgs.filter(m => m.isSending || m.isError);
          
          // Lọc trùng lặp bằng cách tạo Map các tin nhắn từ server
          const merged = [...serverMsgs];
          
          // Bổ sung các tin nhắn đang gửi chưa có trong server list
          sendingOrErrorMsgs.forEach((clientMsg) => {
            // Nếu server chưa cập nhật tin nhắn này
            if (!merged.some(m => m.messageId === clientMsg.messageId)) {
              merged.push(clientMsg);
            }
          });

          // Sắp xếp theo thời gian
          return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    } catch (err) {
      console.error(`[useChat] Lỗi fetch messages cho room ${roomId}:`, err);
    } finally {
      if (!isSilent) {
        setIsLoadingMessages(false);
      }
    }
  }, []);

  // Gọi fetch messages lần đầu khi activeRoomId thay đổi
  useEffect(() => {
    if (activeRoomId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages(activeRoomId, false);
    } else {
      setMessages([]);
    }
  }, [activeRoomId, fetchMessages]);

  // 3. Cơ chế Polling tin nhắn mới mỗi 3.5 giây
  useEffect(() => {
    if (!activeRoomId) return;

    const intervalId = setInterval(() => {
      fetchMessages(activeRoomId, true);
      // Tiện thể làm mới danh sách phòng để cập nhật tin nhắn cuối cùng (lastMessage)
      fetchRooms();
    }, 3500);

    return () => clearInterval(intervalId);
  }, [activeRoomId, fetchMessages, fetchRooms]);

  // 4. Tìm phòng chat đang active
  const activeRoom = rooms.find((r) => r.chatRoomId === activeRoomId) || null;

  // 5. Chuyển đổi phòng chat (cập nhật URL)
  const selectRoom = useCallback((roomId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (roomId) {
      params.set('roomId', roomId);
    } else {
      params.delete('roomId');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  // 6. Gửi tin nhắn mới (Optimistic Update)
  const sendChatMessage = useCallback(async (text: string) => {
    if (!activeRoomId || !text.trim()) return;

    // Tạo tin nhắn tạm thời
    const tempId = `temp-${Date.now()}`;
    const tempMsg: OptimisticMessage = {
      messageId: tempId,
      roomId: activeRoomId,
      senderId: role === 'CLIENT' ? 'u-client-1' : 'u-comp-1', // Khớp với mockUser ID
      content: text,
      createdAt: new Date().toISOString(),
      isSending: true,
      isError: false,
    };

    // Render ngay lập tức lên UI
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/interaction/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const savedMsg: ChatMessage = await res.json();
        // Cập nhật lại tin nhắn tạm thời bằng tin nhắn thực tế từ server
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === tempId
              ? { ...savedMsg, isSending: false, isError: false }
              : m
          )
        );
        // Refresh danh sách phòng để update last message snippet
        fetchRooms();
      } else {
        throw new Error('Gửi tin nhắn thất bại');
      }
    } catch (err) {
      console.error('[useChat] Lỗi gửi tin nhắn:', err);
      // Đánh dấu tin nhắn bị lỗi gửi để hiển thị nút retry
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === tempId
            ? { ...m, isSending: false, isError: true }
            : m
        )
      );
    }
  }, [activeRoomId, role, fetchRooms]);

  // 7. Gửi lại tin nhắn bị lỗi
  const retryMessage = useCallback(async (tempId: string) => {
    const failedMsg = messages.find((m) => m.messageId === tempId);
    if (!failedMsg || !activeRoomId) return;

    // Thiết lập lại trạng thái đang gửi
    setMessages((prev) =>
      prev.map((m) =>
        m.messageId === tempId
          ? { ...m, isSending: true, isError: false }
          : m
      )
    );

    try {
      const res = await fetch(`/api/interaction/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: failedMsg.content }),
      });

      if (res.ok) {
        const savedMsg: ChatMessage = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === tempId
              ? { ...savedMsg, isSending: false, isError: false }
              : m
          )
        );
        fetchRooms();
      } else {
        throw new Error('Gửi lại thất bại');
      }
    } catch (err) {
      console.error('[useChat] Lỗi gửi lại tin nhắn:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === tempId
            ? { ...m, isSending: false, isError: true }
            : m
        )
      );
    }
  }, [activeRoomId, messages, fetchRooms]);

  return {
    rooms,
    messages,
    activeRoomId,
    activeRoom,
    isLoadingRooms,
    isLoadingMessages,
    roomsError,
    selectRoom,
    sendMessage: sendChatMessage,
    retryMessage,
    refreshRooms: fetchRooms,
  };
};
