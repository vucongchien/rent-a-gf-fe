import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookies, headers } from 'next/headers';
import { chatService } from '../chatService';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@/shared/lib/tokenRefresh', () => ({
  refreshTokensFromCookie: vi.fn(),
}));

describe('chatService', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://api.example.test/api/v1';
    vi.mocked(cookies).mockResolvedValue({
      toString: () => 'access_token=jwt-token',
    } as never);
    vi.mocked(headers).mockResolvedValue({
      get: () => null,
    } as never);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    vi.restoreAllMocks();
  });

  describe('getChatRooms', () => {
    const mockRawRooms = [
      {
        roomId: 'room-1',
        bookingId: 'bk-1',
        clientId: 'client-1',
        companionId: 'comp-1',
        status: 'ACTIVE',
        lockAt: null,
        createdAt: '2026-06-26T00:00:00Z',
        updatedAt: '2026-06-26T01:00:00Z',
      },
    ];

    it('CLIENT: lấy danh sách room thành công và map đúng profile Companion', async () => {
      // Mock fetch cho client:
      // 1. Get rooms -> /interaction/rooms
      // 2. Get companion profile -> /companions/comp-1
      vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/interaction/rooms')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockRawRooms), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        if (urlStr.includes('/companions/comp-1')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                companionId: 'comp-1',
                displayName: 'Chizuru Mizuhara',
                avatarUrl: 'chizuru.png',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          );
        }
        return Promise.reject(new Error(`Unhandled URL in mock: ${urlStr}`));
      });

      const rooms = await chatService.getChatRooms('CLIENT');

      expect(rooms).toHaveLength(1);
      expect(rooms[0].chatRoomId).toBe('room-1');
      expect(rooms[0].companionName).toBe('Chizuru Mizuhara');
      expect(rooms[0].companionAvatarUrl).toBe('chizuru.png');
    });

    it('CLIENT: fallback tên khi fetch Companion profile lỗi', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/interaction/rooms')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockRawRooms), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        if (urlStr.includes('/companions/comp-1')) {
          return Promise.resolve(
            new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.reject(new Error(`Unhandled URL in mock: ${urlStr}`));
      });

      const rooms = await chatService.getChatRooms('CLIENT');

      expect(rooms).toHaveLength(1);
      expect(rooms[0].companionName).toBe('User #comp-1');
      expect(rooms[0].companionAvatarUrl).toBe('');
    });

    it('COMPANION: lấy danh sách room thành công và map đúng profile Client', async () => {
      // Mock fetch cho companion:
      // 1. Get rooms -> /interaction/rooms
      // 2. Get client profile -> /profiles/client-1
      vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/interaction/rooms')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockRawRooms), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        if (urlStr.includes('/profiles/client-1')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                clientId: 'client-1',
                displayName: 'Kazuya Kinoshita',
                avatarUrl: 'kazuya.png',
                bio: 'Sinh viên',
                role: 'CLIENT',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          );
        }
        return Promise.reject(new Error(`Unhandled URL in mock: ${urlStr}`));
      });

      const rooms = await chatService.getChatRooms('COMPANION');

      expect(rooms).toHaveLength(1);
      expect(rooms[0].chatRoomId).toBe('room-1');
      expect(rooms[0].companionName).toBe('Kazuya Kinoshita');
      expect(rooms[0].companionAvatarUrl).toBe('kazuya.png');
    });

    it('COMPANION: fallback tên khi fetch Client profile lỗi', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/interaction/rooms')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockRawRooms), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        if (urlStr.includes('/profiles/client-1')) {
          return Promise.resolve(
            new Response(JSON.stringify({ error: 'Not Found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.reject(new Error(`Unhandled URL in mock: ${urlStr}`));
      });

      // Để tránh làm bẩn test console log, có thể spy console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const rooms = await chatService.getChatRooms('COMPANION');

      expect(rooms).toHaveLength(1);
      expect(rooms[0].companionName).toBe('User #client');
      expect(rooms[0].companionAvatarUrl).toBe('');

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getChatMessages', () => {
    it('lấy tin nhắn thành công', async () => {
      const mockMessages = [
        {
          messageId: 'msg-1',
          roomId: 'room-1',
          senderId: 'comp-1',
          content: 'Hello',
          createdAt: '2026-06-26T01:00:00Z',
        },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockMessages), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const messages = await chatService.getChatMessages('room-1');
      expect(messages).toHaveLength(1);
      expect(messages[0].messageId).toBe('msg-1');
      expect(messages[0].content).toBe('Hello');
    });
  });

  describe('sendChatMessage', () => {
    it('gửi tin nhắn thành công', async () => {
      const mockSentMsg = {
        messageId: 'msg-new',
        roomId: 'room-1',
        senderId: 'comp-1',
        content: 'Hi there',
        createdAt: '2026-06-26T01:05:00Z',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockSentMsg), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const msg = await chatService.sendChatMessage('room-1', { text: 'Hi there' });
      expect(msg.messageId).toBe('msg-new');
      expect(msg.content).toBe('Hi there');
    });
  });
});
