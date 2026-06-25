import { cache } from 'react';
import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
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
