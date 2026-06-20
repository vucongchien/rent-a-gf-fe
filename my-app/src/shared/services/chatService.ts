import { serverFetch } from '@/shared/lib/apiClient';
import { mockChatRooms, mockMessages } from '@/mocks/fixtures/data';
import type { ChatRoom, ChatMessage, ServiceRequestOptions } from '@/shared/types';
import { cookies } from 'next/headers';

async function getRequestCookieHeader(req?: { headers: { get(name: string): string | null } }) {
  if (req) return req;
  try {
    const cookieStore = await cookies();
    return {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'cookie') {
            return cookieStore.toString();
          }
          return null;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export const chatService = {
  /**
   * Lấy danh sách phòng chat của user hiện tại
   */
  async getChatRooms(options?: ServiceRequestOptions): Promise<ChatRoom[]> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const rooms: ChatRoom[] = mockChatRooms.map((r) => ({
        chatRoomId: r.chatRoomId,
        bookingId: r.bookingId,
        companionId: r.companionId,
        companionName: r.companionName,
        companionAvatarUrl: r.companionAvatarUrl,
        status: r.status,
        lastMessage: r.lastMessage,
        lastMessageAt: r.lastMessageAt,
        unreadCount: r.unreadCount,
      }));
      return rooms;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ChatRoom[]>('/interaction/rooms', { req });
    } catch (err) {
      console.error('[chatService] Lỗi fetch chat rooms:', err);
      return [];
    }
  },

  /**
   * Load tin nhắn của một phòng chat
   */
  async getChatMessages(
    roomId: string,
    options?: ServiceRequestOptions & { searchParams?: URLSearchParams }
  ): Promise<ChatMessage[]> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const roomMessages = mockMessages[roomId] || [];
      return roomMessages;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ChatMessage[]>(`/interaction/rooms/${roomId}/messages`, {
        req,
        searchParams: options?.searchParams,
      });
    } catch (err) {
      console.error(`[chatService] Lỗi fetch chat messages cho room ${roomId}:`, err);
      return [];
    }
  },

  /**
   * Gửi tin nhắn mới
   */
  async sendChatMessage(
    roomId: string,
    body: { text: string },
    options?: ServiceRequestOptions
  ): Promise<ChatMessage> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const newMessage: ChatMessage = {
        messageId: `msg-${Date.now()}`,
        roomId,
        senderId: 'u-client-1',
        content: body.text,
        createdAt: new Date().toISOString(),
      };
      // Mock push tin nhắn mới vào store tạm thời
      if (!mockMessages[roomId]) {
        mockMessages[roomId] = [];
      }
      mockMessages[roomId].push(newMessage);

      return newMessage;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ChatMessage>(`/interaction/rooms/${roomId}/messages`, {
        req,
        method: 'POST',
        body,
      });
    } catch (err) {
      console.error(`[chatService] Lỗi gửi tin nhắn cho room ${roomId}:`, err);
      throw err;
    }
  }
};

