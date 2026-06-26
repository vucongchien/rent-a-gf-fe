import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/authCookies';
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
    let token: string | null = null;
    try {
      const cookieStore = await cookies();
      if (typeof cookieStore.get === 'function') {
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
      } else {
        const cookieStr = cookieStore.toString();
        const match = cookieStr.split(';').map(c => c.trim()).find(c => c.startsWith(`${AUTH_COOKIE_NAME}=`));
        token = match ? match.slice(AUTH_COOKIE_NAME.length + 1) : null;
      }
    } catch {
      // ignore
    }

    const extraHeaders: Record<string, string> = {};
    if (token) {
      extraHeaders['Authorization'] = `Bearer ${token}`;
    }

    const data = await serverFetch<{ clientId: string; displayName: string; avatarUrl: string | null }>(
      `/profiles/${clientId}`,
      { req, extraHeaders }
    );
    return { displayName: data.displayName, avatarUrl: data.avatarUrl };
  } catch (err) {
    console.warn(`[chatService] Không fetch được client profile cho ${clientId} (sử dụng fallback):`, (err as Error).message);
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
    let token: string | null = null;
    try {
      const cookieStore = await cookies();
      if (typeof cookieStore.get === 'function') {
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
      } else {
        const cookieStr = cookieStore.toString();
        const match = cookieStr.split(';').map(c => c.trim()).find(c => c.startsWith(`${AUTH_COOKIE_NAME}=`));
        token = match ? match.slice(AUTH_COOKIE_NAME.length + 1) : null;
      }
    } catch {
      // ignore
    }

    const extraHeaders: Record<string, string> = {};
    if (token) {
      extraHeaders['Authorization'] = `Bearer ${token}`;
    }

    const data = await serverFetch<{ companionId: string; displayName: string; avatarUrl: string | null }>(
      `/companions/${companionId}`,
      { req, extraHeaders }
    );
    return { displayName: data.displayName, avatarUrl: data.avatarUrl };
  } catch (err) {
    console.warn(`[chatService] Không fetch được companion profile cho ${companionId} (sử dụng fallback):`, (err as Error).message);
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

    console.log(`[chatService.getChatRooms] role=${role}, rooms=${rawRooms.length}`, JSON.stringify(rawRooms[0], null, 2));

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
