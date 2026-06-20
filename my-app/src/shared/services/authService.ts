import { serverFetch } from '@/shared/lib/apiClient';
import { currentMockUser } from '@/mocks/fixtures/data';
import type { User, ServiceRequestOptions } from '@/shared/types';
import { cookies } from 'next/headers';

async function getRequestCookieHeader(req?: { headers: { get(name: string): string | null } }) {
  if (req) return req;
  try {
    const cookieStore = await cookies();
    return {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'cookie') {
            return cookieStore.toString();
          }
          return null;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export const authService = {
  /**
   * Lấy thông tin user hiện tại từ session
   */
  async getMe(options?: ServiceRequestOptions): Promise<User | null> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return currentMockUser as User;
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<User>('/auth/me', { req });
    } catch (err) {
      console.error('[authService] Lỗi fetch user me:', err);
      return null;
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(options?: ServiceRequestOptions): Promise<{ message: string }> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { message: 'Logout successful' };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<{ message: string }>('/auth/logout', { req, method: 'POST' });
    } catch (err) {
      console.error('[authService] Lỗi logout:', err);
      throw err;
    }
  }
};

