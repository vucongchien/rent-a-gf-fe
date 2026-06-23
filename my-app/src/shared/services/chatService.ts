import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { mockChatRooms, mockMessages } from '@/mocks/fixtures/data';
import type { ChatRoom, ChatMessage, ServiceRequestOptions } from '@/shared/types';

export const chatService = {
  /**
   * Lấy danh sách phòng chat của user hiện tại
   */
  async getChatRooms(options?: ServiceRequestOptions): Promise<ChatRoom[]> {
    if (isMockMode()) {
      const { currentMockUser, mockBookings } = await import('@/mocks/fixtures/data');
      const isComp = currentMockUser?.role === 'COMPANION';

      const rooms: ChatRoom[] = mockChatRooms.map((r) => {
        const bk = mockBookings.find(b => b.bookingId === r.bookingId);
        return {
          chatRoomId: r.chatRoomId,
          bookingId: r.bookingId,
          companionId: r.companionId,
          companionName: isComp && bk ? bk.clientName : r.companionName,
          companionAvatarUrl: isComp && bk ? bk.clientAvatarUrl : r.companionAvatarUrl,
          status: r.status,
          lastMessage: r.lastMessage,
          lastMessageAt: r.lastMessageAt,
          unreadCount: r.unreadCount,
        };
      });
      return rooms;
    }

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatRoom[]>('/interaction/rooms', { req });
  },

  /**
   * Load tin nhắn của một phòng chat
   */
  async getChatMessages(
    roomId: string,
    options?: ServiceRequestOptions & { searchParams?: URLSearchParams }
  ): Promise<ChatMessage[]> {
    if (isMockMode()) {
      const roomMessages = mockMessages[roomId] || [];
      return roomMessages;
    }

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatMessage[]>(`/interaction/rooms/${roomId}/messages`, {
      req,
      searchParams: options?.searchParams,
    });
  },

  /**
   * Gửi tin nhắn mới
   */
  async sendChatMessage(
    roomId: string,
    body: { text: string },
    options?: ServiceRequestOptions
  ): Promise<ChatMessage> {
    if (isMockMode()) {
      const newMessage: ChatMessage = {
        messageId: `msg-${Date.now()}`,
        roomId,
        senderId: 'u-client-1',
        content: body.text,
        createdAt: new Date().toISOString(),
      };
      if (!mockMessages[roomId]) {
        mockMessages[roomId] = [];
      }
      mockMessages[roomId].push(newMessage);

      return newMessage;
    }

    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatMessage>(`/interaction/rooms/${roomId}/messages`, {
      req,
      method: 'POST',
      body,
    });
  }
};
