import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type { ChatRoom, ChatMessage, ServiceRequestOptions } from '@/shared/types';

export const chatService = {
  async getChatRooms(options?: ServiceRequestOptions): Promise<ChatRoom[]> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatRoom[]>('/interaction/rooms', { req });
  },

  async getChatMessages(
    roomId: string,
    options?: ServiceRequestOptions & { searchParams?: URLSearchParams }
  ): Promise<ChatMessage[]> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatMessage[]>(`/interaction/rooms/${roomId}/messages`, {
      req,
      searchParams: options?.searchParams,
    });
  },

  async sendChatMessage(
    roomId: string,
    body: { text: string },
    options?: ServiceRequestOptions
  ): Promise<ChatMessage> {
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<ChatMessage>(`/interaction/rooms/${roomId}/messages`, {
      req,
      method: 'POST',
      body,
    });
  }
};
