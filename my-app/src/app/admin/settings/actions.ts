'use server';

import { revalidatePath } from 'next/cache';
import { adminSettingsService } from '@/shared/services/adminSettingsService';
import { authService } from '@/shared/services/authService';

interface ToggleResponse {
  ok: boolean;
  enabled?: boolean;
  error?: string;
}

export async function toggleFeatureFlagAction(
  key: string,
  enabled: boolean,
): Promise<ToggleResponse> {
  const user = await authService.getMe();
  if (!user) return { ok: false, error: 'Phiên đăng nhập đã hết hạn' };
  if (user.role !== 'ADMIN') return { ok: false, error: 'Yêu cầu quyền admin' };

  try {
    const flag = await adminSettingsService.toggleFlag(key, enabled);
    revalidatePath('/admin/settings');
    return { ok: true, enabled: flag.enabled };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
