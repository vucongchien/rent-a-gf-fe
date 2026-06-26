import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from './useChat';

// Mock các hooks của Next.js navigation
const mockPush = vi.fn();
let mockSearchRoomId = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/chat',
  useSearchParams: () => ({
    get: (key: string) => (key === 'roomId' ? mockSearchRoomId : null),
    toString: () => (mockSearchRoomId ? `roomId=${mockSearchRoomId}` : ''),
  }),
}));

// Mock AuthContext
vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 'u-client-1', displayName: 'Test User', role: 'CLIENT' },
  }),
}));

describe('useChat hook', () => {
  const mockRooms = [
    { chatRoomId: 'room-1', bookingId: 'bk-1', clientId: 'u-client-1', companionId: 'u-comp-1', companionName: 'Linh', companionAvatarUrl: '', status: 'ACTIVE', lastMessage: 'Hi', lastMessageAt: '', unreadCount: 1 },
    { chatRoomId: 'room-2', bookingId: 'bk-2', clientId: 'u-client-1', companionId: 'u-comp-2', companionName: 'My', companionAvatarUrl: '', status: 'INACTIVE', lastMessage: 'Bye', lastMessageAt: '', unreadCount: 0 },
  ];

  const mockMessages = [
    { messageId: 'msg-1', roomId: 'room-1', senderId: 'u-comp-1', content: 'Chào bạn!', createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchRoomId = '';
    
    // Reset global fetch mock
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/interaction/rooms/room-1/messages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMessages),
        });
      }
      if (url.includes('/api/interaction/rooms')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRooms),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as unknown as typeof global.fetch;
  });

  it('khởi tạo state mặc định và fetch rooms thành công', async () => {
    const { result } = renderHook(() => useChat('CLIENT', 'u-client-1'));

    expect(result.current.isLoadingRooms).toBe(true);
    expect(result.current.activeRoomId).toBe('');
    expect(result.current.messages).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoadingRooms).toBe(false);
    });

    expect(result.current.rooms).toHaveLength(2);
    expect(result.current.rooms[0].companionName).toBe('Linh');
  });

  it('fetch tin nhắn khi activeRoomId được set', async () => {
    mockSearchRoomId = 'room-1';
    const { result } = renderHook(() => useChat('CLIENT', 'u-client-1'));

    await waitFor(() => {
      expect(result.current.isLoadingRooms).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    expect(result.current.messages[0].content).toBe('Chào bạn!');
    expect(result.current.activeRoom?.companionName).toBe('Linh');
  });

  it('gửi tin nhắn thành công qua Optimistic Update', async () => {
    mockSearchRoomId = 'room-1';
    
    // Mock POST message
    const savedMsg = {
      messageId: 'msg-new-123',
      roomId: 'room-1',
      senderId: 'u-client-1',
      content: 'Chào Linh',
      createdAt: new Date().toISOString(),
    };

    global.fetch = vi.fn((url, options) => {
      if (url.includes('/messages') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(savedMsg),
        });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMessages) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRooms) });
    }) as unknown as typeof global.fetch;

    const { result } = renderHook(() => useChat('CLIENT', 'u-client-1'));

    await waitFor(() => {
      expect(result.current.isLoadingRooms).toBe(false);
    });

    // Trigger gửi tin nhắn
    await act(async () => {
      result.current.sendMessage('Chào Linh');
    });

    // Check Optimistic state (tin nhắn tạm có isSending: true)
    const tempMsg = result.current.messages.find(m => m.content === 'Chào Linh');
    expect(tempMsg).toBeDefined();
    
    // Chờ cho đến khi fetch resolved
    await waitFor(() => {
      const finalMsg = result.current.messages.find(m => m.messageId === 'msg-new-123');
      expect(finalMsg).toBeDefined();
      expect(finalMsg?.isSending).toBe(false);
    });
  });

  it('gửi tin nhắn thất bại, đánh dấu lỗi và có thể retry', async () => {
    mockSearchRoomId = 'room-1';

    // Mock POST message lỗi mạng
    global.fetch = vi.fn((url, options) => {
      if (url.includes('/messages') && options?.method === 'POST') {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMessages) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRooms) });
    }) as unknown as typeof global.fetch;

    const { result } = renderHook(() => useChat('CLIENT', 'u-client-1'));

    await waitFor(() => {
      expect(result.current.isLoadingRooms).toBe(false);
    });

    // Gửi tin nhắn lỗi
    await act(async () => {
      result.current.sendMessage('Lỗi mạng nha');
    });

    // Kiểm tra đã gán flag isError: true
    await waitFor(() => {
      const errorMsg = result.current.messages.find(m => m.content === 'Lỗi mạng nha');
      expect(errorMsg).toBeDefined();
      expect(errorMsg?.isError).toBe(true);
      expect(errorMsg?.isSending).toBe(false);
    });

    // Giả lập sửa lỗi mạng và gọi retry
    const tempId = result.current.messages.find(m => m.content === 'Lỗi mạng nha')?.messageId || '';
    const successMsg = {
      messageId: 'msg-success-retry',
      roomId: 'room-1',
      senderId: 'u-client-1',
      content: 'Lỗi mạng nha',
      createdAt: new Date().toISOString(),
    };

    global.fetch = vi.fn((url, options) => {
      if (url.includes('/messages') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(successMsg),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }) as unknown as typeof global.fetch;

    await act(async () => {
      result.current.retryMessage(tempId);
    });

    await waitFor(() => {
      const finalMsg = result.current.messages.find(m => m.messageId === 'msg-success-retry');
      expect(finalMsg).toBeDefined();
      expect(finalMsg?.isError).toBe(false);
      expect(finalMsg?.isSending).toBe(false);
    });
  });
});
