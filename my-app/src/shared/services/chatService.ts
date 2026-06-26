import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type { ChatRoom, ChatMessage, RawChatRoom, ServiceRequestOptions } from '@/shared/types';

/**
 * fetchClientProfile — GET /profiles/{clientId}
 * Lấy public profile của client (người đặt lịch).
 * Dùng khi role=COMPANION muốn xem tên/avatar khách.
 */
async function fetchClientProfile(
  clientId: string,
  req: { headers: { get(name: string): string | null } } | undefined
): Promise<{ displayName: string; avatarUrl: string | null } | null> {
  try {
    const data = await serverFetch<{ clientId: string; displayName: string; avatarUrl: string | null }>(
      `/profiles/${clientId}`,
      { req }
    );
    return { displayName: data.displayName, avatarUrl: data.avatarUrl };
  } catch (err) {
    console.debug(`[chatService] client profile 404 cho ${clientId} — dùng fallback`);
    return null;
  }
}

/**
 * fetchCompanionProfile — GET /companions/{companionId}
 * Lấy public profile của companion.
 * Dùng khi role=CLIENT muốn xem tên/avatar bạn đồng hành.
 */
async function fetchCompanionProfile(
  companionId: string,
  req: { headers: { get(name: string): string | null } } | undefined
): Promise<{ displayName: string; avatarUrl: string | null } | null> {
  try {
    const data = await serverFetch<{ companionId: string; displayName: string; avatarUrl: string | null }>(
      `/companions/${companionId}`,
      { req }
    );
    return { displayName: data.displayName, avatarUrl: data.avatarUrl };
  } catch (err) {
    console.debug(`[chatService] companion profile 404 cho ${companionId} — dùng fallback`);
    return null;
  }
}

/**
 * normalizeChatRoom — Map raw API response → ChatRoom UI type.
 *
 * @param targetId - ID của người đối diện (companionId hoặc clientId tùy role)
 */
function normalizeChatRoom(
  raw: RawChatRoom,
  profile: { displayName: string; avatarUrl: string | null } | null,
  targetId: string,
): ChatRoom {
  return {
    chatRoomId: raw.roomId,
    clientId: raw.clientId,
    companionId: raw.companionId,
    bookingId: raw.bookingId,
    status: raw.status,
    companionName: profile?.displayName ?? `User #${targetId.slice(0, 6)}`,
    companionAvatarUrl: profile?.avatarUrl ?? '',
    lastMessage: null,
    lastMessageAt: raw.updatedAt,
    unreadCount: 0,
  };
}

export const chatService = {
  /**
   * getChatRooms — Lấy danh sách phòng chat kèm thông tin người đối diện.
   *
   * - role=CLIENT  → người kia là companion → GET /companions/{companionId}
   * - role=COMPANION → người kia là client  → GET /profiles/{clientId}
   */
  async getChatRooms(
    role: 'CLIENT' | 'COMPANION',
    options?: ServiceRequestOptions,
  ): Promise<ChatRoom[]> {
    const req = await getRequestCookieHeader(options?.req);
    const rawRooms = await serverFetch<RawChatRoom[]>('/interaction/rooms', { req });

    console.log(`[chatService.getChatRooms] role=${role}, rooms=${rawRooms.length}`, rawRooms.map(r => ({ roomId: r.roomId, clientId: r.clientId, companionId: r.companionId })));

    // Fetch profile người đối diện song song, đúng endpoint theo role
    const profiles = await Promise.all(
      rawRooms.map((r) =>
        role === 'CLIENT'
          ? fetchCompanionProfile(r.companionId, req)
          : fetchClientProfile(r.clientId, req)
      )
    );

    console.log(`[chatService.getChatRooms] profiles fetched:`, profiles.map(p => p ? { displayName: p.displayName } : null));

    const targetIds = rawRooms.map((r) =>
      role === 'CLIENT' ? r.companionId : r.clientId
    );

    return rawRooms.map((raw, i) => normalizeChatRoom(raw, profiles[i], targetIds[i]));
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
