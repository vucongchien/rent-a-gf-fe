/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useNotifications } from './NotificationContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/components/atoms/ToastNotification';

vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/shared/components/atoms/ToastNotification', () => ({
  useToast: vi.fn(),
}));

// Giả lập Mock EventSource trong Node.js testing environment
class MockEventSource {
  onmessage: any;
  onerror: any;
  listeners: Record<string, Function[]> = {};

  constructor(public url: string) {}

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  dispatchEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  close = vi.fn();
}

global.EventSource = MockEventSource as any;

// Component phụ trợ kiểm thử Context Values
const TestComponent: React.FC = () => {
  const { unreadCount, decrementUnreadCount, resetUnreadCount } = useNotifications();
  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <button data-testid="btn-decrement" onClick={decrementUnreadCount}>Decrement</button>
      <button data-testid="btn-reset" onClick={resetUnreadCount}>Reset</button>
    </div>
  );
};

describe('NotificationContext', () => {
  const mockToast = vi.fn();
  const mockUser = { 
    userId: 'u-client-1', 
    displayName: 'Minh Khách',
    email: 'minh@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'CLIENT' as const,
  };
  
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      items: [
        { id: '1', isRead: false },
        { id: '2', isRead: true },
        { id: '3', isRead: false },
      ],
      total: 3,
    }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    });
  });

  it('fetches initial notifications and counts unread items on mount', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Bắt đầu từ 0
    expect(screen.getByTestId('unread-count').textContent).toBe('0');

    // Chờ fetch và đếm số lượng chưa đọc (2 items)
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('2');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications');
  });

  it('updates unreadCount when decrement or reset is triggered', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('2');
    });

    // Test Decrement
    fireEvent.click(screen.getByTestId('btn-decrement'));
    expect(screen.getByTestId('unread-count').textContent).toBe('1');

    // Test Reset
    fireEvent.click(screen.getByTestId('btn-reset'));
    expect(screen.getByTestId('unread-count').textContent).toBe('0');
  });
});
