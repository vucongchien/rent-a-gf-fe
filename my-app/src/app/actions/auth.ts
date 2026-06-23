'use server';

import { authService } from '@/shared/services/authService';

/**
 * Đăng xuất khỏi BFF. Cookie HttpOnly do BE invalidate; FE chỉ cần forward
 * `POST /auth/logout` qua service rồi để client clear local state.
 *
 * Trả về `{ ok }` thay vì throw để Client Component xử lý UI nhẹ nhàng.
 */
export async function logoutAction(): Promise<{ ok: boolean }> {
  try {
    await authService.logout();
    return { ok: true };
  } catch (err: unknown) {
    console.error('[logoutAction] failed:', err);
    return { ok: false };
  }
}
