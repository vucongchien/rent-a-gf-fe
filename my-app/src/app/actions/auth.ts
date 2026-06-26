'use server';

import { cookies } from 'next/headers';
import { authService } from '@/shared/services/authService';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/shared/lib/authCookies';

/**
 * Đăng xuất khỏi BFF. Gọi BE revoke refresh token nếu có, sau đó BFF luôn
 * xóa HttpOnly cookies để F5 không tự đăng nhập lại từ cookie cũ.
 *
 * Trả về `{ ok }` thay vì throw để Client Component xử lý UI nhẹ nhàng.
 */
export async function logoutAction(): Promise<{ ok: boolean }> {
  let ok = true;
  try {
    await authService.logout();
  } catch (err: unknown) {
    ok = false;
    console.error('[logoutAction] failed:', err);
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
  }
  return { ok };
}
