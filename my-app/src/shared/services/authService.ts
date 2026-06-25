import { cache } from 'react';
import { serverFetch } from '@/shared/lib/apiClient';
import { REFRESH_COOKIE_NAME } from '@/shared/lib/authCookies';
import { getUserFromRequest, parseCookieValue } from '@/shared/lib/authSession';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type { LogoutResponse, ServiceRequestOptions, User } from '@/shared/types';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * authService — chỉ ĐỌC session từ cookie do middleware đã refresh sẵn.
 *
 * Refresh logic được dồn về middleware.ts (single refresh point). Bất kỳ
 * request nào đi qua matcher đều được middleware kiểm tra access_token + tự
 * gọi BE /auth/refresh nếu cần, set lại cookie + patch request cookie header
 * trước khi tới đây. Vì vậy `getMe` ở RSC/route chỉ cần decode cookie hiện tại.
 *
 * Lưu ý RSC không Set-Cookie được — đó là lý do refresh KHÔNG nằm ở đây.
 */
async function getMeImpl(): Promise<User | null> {
  const req = await getRequestCookieHeader();
  return req ? getUserFromRequest(req) : null;
}

/**
 * Per-render dedupe — layout + page + nav cùng request chỉ hit cookie decode 1 lần.
 * KHÔNG cross-request cache (an toàn user-specific theo AGENTS.md).
 */
const getMeCached = cache(getMeImpl);

export const authService = {
  /**
   * Lấy thông tin user hiện tại từ access_token cookie (đã được middleware refresh).
   *
   * SC/Action không truyền options → đi qua React `cache()` dedupe.
   * Route handler truyền `options.req` → bypass dedupe (req khác mỗi request).
   * Trả `null` (không throw) — pattern auth check.
   */
  async getMe(options?: ServiceRequestOptions): Promise<User | null> {
    if (options?.req) {
      return getUserFromRequest(options.req);
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
    const refreshToken = parseCookieValue(cookieHeader, REFRESH_COOKIE_NAME) ?? '';
    return serverFetch<LogoutResponse>('/auth/logout', {
      req,
      method: 'POST',
      body: { refreshToken },
    });
  },

  /**
   * Refresh access token bằng refresh token rotation.
   *
   * Không dùng cho `/api/auth/refresh/route.ts`: endpoint đó phải gọi helper
   * refresh thuần để tránh gửi Bearer access_token đã hết hạn.
   */
  async refresh(options?: ServiceRequestOptions): Promise<RefreshTokenResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const cookieHeader = req?.headers.get('cookie') ?? '';
    const refreshToken = parseCookieValue(cookieHeader, REFRESH_COOKIE_NAME) ?? '';
    return serverFetch<RefreshTokenResponse>('/auth/refresh', {
      req,
      method: 'POST',
      body: { refreshToken },
    });
  },
};
