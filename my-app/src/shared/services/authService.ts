import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import { isMockMode } from '@/shared/lib/env';
import { currentMockUser } from '@/mocks/fixtures/data';
import type { User, ServiceRequestOptions } from '@/shared/types';

export const authService = {
  /**
   * Lấy thông tin user hiện tại từ session
   */
  async getMe(options?: ServiceRequestOptions): Promise<User | null> {
    if (isMockMode()) {
      return currentMockUser as User;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<User>('/auth/me', { req });
    } catch (err: unknown) {
      console.error('[authService] Lỗi fetch user me:', err);
      return null;
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(options?: ServiceRequestOptions): Promise<{ message: string }> {
    if (isMockMode()) {
      return { message: 'Logout successful' };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<{ message: string }>('/auth/logout', { req, method: 'POST' });
    } catch (err: unknown) {
      console.error('[authService] Lỗi logout:', err);
      throw err;
    }
  }
};
