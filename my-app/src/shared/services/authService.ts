import { cache } from 'react';
import { cookies } from 'next/headers';
import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { currentMockUser, mockUsers, setMockUser } from '@/mocks/fixtures/data';
import type { LogoutResponse, ServiceRequestOptions, User } from '@/shared/types';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function parseCookie(cookieString: string | null, name: string): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

async function getMeImpl(): Promise<User | null> {
  if (isMockMode()) {
    let role: string | null = null;
    try {
      const cookieStore = await cookies();
      role = cookieStore.get('msw_mock_role')?.value ?? null;
    } catch {
      // Ignore if called outside of request context
    }
    if (role && role in mockUsers) {
      setMockUser(role as keyof typeof mockUsers);
    }
    return currentMockUser as User;
  }
  const req = await getRequestCookieHeader();
  try {
    return await serverFetch<User>('/auth/me', { req });
  } catch (err: unknown) {
    console.error('[authService] Lỗi fetch user me:', err);
    return null;
  }
}

/**
 * Per-render dedupe — layout + page + nav cùng request chỉ hit BE 1 lần.
 * KHÔNG cross-request cache (an toàn user-specific theo AGENTS.md).
 */
const getMeCached = cache(getMeImpl);

export const authService = {
  /**
   * Lấy thông tin user hiện tại từ session.
   *
   * SC/Action không truyền options → đi qua React `cache()` dedupe.
   * Route handler truyền `options.req` → bypass dedupe (req khác mỗi request).
   * Trả `null` (không throw) — pattern auth check.
   */
  async getMe(options?: ServiceRequestOptions): Promise<User | null> {
    if (options?.req) {
      if (isMockMode()) {
        const cookieHeader = options.req.headers.get('cookie') ?? '';
        const role = parseCookie(cookieHeader, 'msw_mock_role');
        if (role && role in mockUsers) {
          setMockUser(role as keyof typeof mockUsers);
        }
        return currentMockUser as User;
      }
      try {
        return await serverFetch<User>('/auth/me', { req: options.req });
      } catch (err: unknown) {
        console.error('[authService] Lỗi fetch user me:', err);
        return null;
      }
    }
    return getMeCached();
  },

  /**
   * Đăng xuất khỏi hệ thống.
   *
   * SSOT yêu cầu body `{ refreshToken }` để BE revoke. Đọc từ cookie HttpOnly
   * `refresh_token`. Nếu không có thì gửi chuỗi rỗng — vẫn include field theo SSOT.
   */
  async logout(options?: ServiceRequestOptions): Promise<LogoutResponse> {
    if (isMockMode()) {
      return { message: 'Logout successful' };
    }
    const req = await getRequestCookieHeader(options?.req);
    const cookieHeader = req?.headers.get('cookie') ?? '';
    const refreshToken = parseCookie(cookieHeader, 'refresh_token') ?? '';
    return serverFetch<LogoutResponse>('/auth/logout', {
      req,
      method: 'POST',
      body: { refreshToken },
    });
  },

  /**
   * Refresh access token bằng refresh token rotation.
   *
   * SSOT: POST /auth/refresh body `{ refreshToken }` → `{ accessToken, refreshToken, expiresIn }`.
   * Refresh token đọc từ cookie HttpOnly `refresh_token`. Service KHÔNG nuốt lỗi.
   */
  async refresh(options?: ServiceRequestOptions): Promise<RefreshTokenResponse> {
    if (isMockMode()) {
      return {
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresIn: 3600,
      };
    }
    const req = await getRequestCookieHeader(options?.req);
    const cookieHeader = req?.headers.get('cookie') ?? '';
    const refreshToken = parseCookie(cookieHeader, 'refresh_token') ?? '';
    return serverFetch<RefreshTokenResponse>('/auth/refresh', {
      req,
      method: 'POST',
      body: { refreshToken },
    });
  },
};
