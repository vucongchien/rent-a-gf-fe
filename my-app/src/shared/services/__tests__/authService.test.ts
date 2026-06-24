import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/apiClient', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('@/shared/lib/cookieHelper', () => ({
  getRequestCookieHeader: vi.fn(() => Promise.resolve({ Cookie: 'mock-cookie' })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const { authService } = await import('../authService');
const { serverFetch } = await import('@/shared/lib/apiClient');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('nên giải mã thông tin user từ cookie access_token', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'CLIENT',
      };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      
      const mockGet = vi.fn().mockReturnValue({ value: token });
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: mockGet,
      } as any);

      const user = await authService.getMe();

      expect(user).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'test',
        avatarUrl: '',
        role: 'CLIENT',
      });
    });

    it('nên trả về null nếu không có cookie access_token', async () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: mockGet,
      } as any);

      const user = await authService.getMe();
      expect(user).toBeNull();
    });
  });
});
