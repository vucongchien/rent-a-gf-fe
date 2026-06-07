import { serverFetch } from '@/shared/lib/apiClient';
import { mockChatRooms, mockMessages } from '@/mocks/fixtures/data';
import type { ChatRoom, ChatMessage, MessagePage, ApiResponse } from '@/shared/types';
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
  async getChatRooms(options?: { req?: any }): Promise<ApiResponse<{ rooms: ChatRoom[] }>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const rooms: ChatRoom[] = mockChatRooms.map((r: any) => ({
        id: r.id,
        bookingId: r.bookingId,
        companionId: r.bookingId === 'bk-1' ? 'comp-1' : 'comp-2',
        companionName: r.participantName,
        companionAvatarUrl: r.participantAvatarUrl,
        isLocked: r.isLocked,
        lastMessage: r.lastMessage,
        lastMessageAt: r.lastMessageAt,
        unreadCount: r.unreadCount,
      }));
      return {
        data: { rooms },
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<{ rooms: ChatRoom[] }>>('/chat/rooms', { req });
    } catch (err) {
      console.error('[chatService] Lỗi fetch chat rooms:', err);
      throw err;
    }
  },

  /**
   * Load tin nhắn của một phòng chat (cursor-based)
   */
  async getChatMessages(
    roomId: string,
    options?: { req?: any; searchParams?: URLSearchParams }
  ): Promise<{ data: MessagePage }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const roomMessages = mockMessages[roomId] || [];
      return {
        data: {
          items: roomMessages as ChatMessage[],
          nextCursor: null,
        }
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<{ data: MessagePage }>(`/chat/rooms/${roomId}/messages`, {
        req,
        searchParams: options?.searchParams,
      });
    } catch (err) {
      console.error(`[chatService] Lỗi fetch chat messages cho room ${roomId}:`, err);
      throw err;
    }
  },

  /**
   * Gửi tin nhắn mới
   */
  async sendChatMessage(
    roomId: string,
    body: { content: string },
    options?: { req?: any }
  ): Promise<{ data: ChatMessage }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'u-client-1',
        senderName: 'Minh Khách',
        content: body.content,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };
      // Mock push tin nhắn mới vào store tạm thời
      if (!mockMessages[roomId]) {
        mockMessages[roomId] = [];
      }
      mockMessages[roomId].push(newMessage as any);

      return {
        data: newMessage,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<{ data: ChatMessage }>(`/chat/rooms/${roomId}/messages`, {
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
