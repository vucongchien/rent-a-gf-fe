import { cache } from 'react';
import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { currentMockUser } from '@/mocks/fixtures/data';
import type { LogoutResponse, ServiceRequestOptions, User } from '@/shared/types';

async function getMeImpl(): Promise<User | null> {
  if (isMockMode()) {
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
      if (isMockMode()) return currentMockUser as User;
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
   */
  async logout(options?: ServiceRequestOptions): Promise<LogoutResponse> {
    if (isMockMode()) {
      return { message: 'Logout successful' };
    }
    const req = await getRequestCookieHeader(options?.req);
    return serverFetch<LogoutResponse>('/auth/logout', { req, method: 'POST' });
  },
};
