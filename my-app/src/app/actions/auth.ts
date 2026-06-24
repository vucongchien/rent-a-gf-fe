'use server';

import { authService } from '@/shared/services/authService';
import { cookies } from 'next/headers';

/**
 * Đăng xuất khỏi BFF. Cookie HttpOnly do BE invalidate; FE chỉ cần forward
 * `POST /auth/logout` qua service rồi để client clear local state.
 *
 * Trả về `{ ok }` thay vì throw để Client Component xử lý UI nhẹ nhàng.
 */
export async function logoutAction(): Promise<{ ok: boolean }> {
  try {
    // 1. Cố gắng gọi Backend để invalidate token trên server
    await authService.logout().catch((err) => {
      console.warn('[logoutAction] Warning: Không thể revoke token trên Backend:', err);
    });
  } catch (err) {
    // ignore
  } finally {
    // 2. Bắt buộc phải xóa cookie ở BFF để giải phóng session của trình duyệt
    try {
      const cookieStore = await cookies();
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
    } catch (cookieErr) {
      console.error('[logoutAction] Lỗi xóa cookies ở BFF:', cookieErr);
    }
  }
  return { ok: true };
}
