import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

vi.mock('@/shared/lib/apiClient', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('@/shared/lib/cookieHelper', () => ({
  getRequestCookieHeader: vi.fn(() => Promise.resolve({ Cookie: 'mock-cookie' })),
}));

vi.mock('@/shared/lib/env', () => ({
  isMockMode: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock data.ts to control mockUsers and setMockUser
vi.mock('@/mocks/fixtures/data', () => {
  const mockUsers = {
    client: { userId: 'u-client-1', role: 'CLIENT', displayName: 'Client' },
    admin: { userId: 'u-admin-1', role: 'ADMIN', displayName: 'Admin' },
  };
  return {
    mockUsers,
    currentMockUser: mockUsers.client,
    setMockUser: vi.fn((_role: string) => {
      // update currentMockUser mock if necessary
    }),
  };
});

const { authService } = await import('../authService');
const { isMockMode } = await import('@/shared/lib/env');
const { serverFetch } = await import('@/shared/lib/apiClient');
const { cookies } = await import('next/headers');
const { setMockUser } = await import('@/mocks/fixtures/data');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('nên trả về mock user mặc định khi ở mock mode và không có cookie', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);
      
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies);

      const user = await authService.getMe();

      expect(user?.role).toBe('CLIENT');
      expect(setMockUser).not.toHaveBeenCalled();
    });

    it('nên gọi setMockUser khi ở mock mode và có cookie msw_mock_role', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);

      const mockCookieStore = {
        get: vi.fn().mockImplementation((name) => {
          if (name === 'msw_mock_role') return { value: 'admin' };
          return undefined;
        }),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies);

      await authService.getMe();

      expect(setMockUser).toHaveBeenCalledWith('admin');
    });

    it('nên đọc role từ request headers khi truyền options.req', async () => {
      vi.mocked(isMockMode).mockReturnValue(true);

      const req = {
        headers: {
          get: vi.fn().mockReturnValue('msw_mock_role=admin; other=123'),
        },
      };

      await authService.getMe({ req: req as unknown as Request });

      expect(req.headers.get).toHaveBeenCalledWith('cookie');
      expect(setMockUser).toHaveBeenCalledWith('admin');
    });

    it('nên gọi API /auth/me khi không phải mock mode', async () => {
      vi.mocked(isMockMode).mockReturnValue(false);
      const apiUser = { userId: 'real-1', role: 'CLIENT', displayName: 'Real' };
      vi.mocked(serverFetch).mockResolvedValueOnce(apiUser);

      const user = await authService.getMe();

      expect(serverFetch).toHaveBeenCalledWith('/auth/me', expect.any(Object));
      expect(user).toEqual(apiUser);
    });
  });
});
