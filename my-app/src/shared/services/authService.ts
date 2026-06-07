import { serverFetch } from '@/shared/lib/apiClient';
import { currentMockUser } from '@/mocks/fixtures/data';
import type { User, ApiResponse } from '@/shared/types';
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
  async getMe(options?: { req?: any }): Promise<ApiResponse<User>> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return {
        data: currentMockUser as any,
      };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch<ApiResponse<User>>('/auth/me', { req });
    } catch (err) {
      console.error('[authService] Lỗi fetch user me:', err);
      throw err;
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(options?: { req?: any }): Promise<any> {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

    if (isMock) {
      return { success: true };
    }

    const req = await getRequestCookieHeader(options?.req);

    try {
      return await serverFetch('/auth/logout', { req, method: 'POST' });
    } catch (err) {
      console.error('[authService] Lỗi logout:', err);
      throw err;
    }
  }
};
