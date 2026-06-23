'use server';

import { revalidatePath } from 'next/cache';
import { adminUserService } from '@/shared/services/adminUserService';
import { authService } from '@/shared/services/authService';
import type { AdminUserStatus } from '@/shared/types';

interface ActionResponse {
  ok: boolean;
  status?: AdminUserStatus;
  error?: string;
}

async function assertAdmin(): Promise<string | null> {
  const user = await authService.getMe();
  if (!user) return 'Phiên đăng nhập đã hết hạn';
  if (user.role !== 'ADMIN') return 'Yêu cầu quyền admin';
  return null;
}

export async function lockUserAction(
  userId: string,
  reason: string,
): Promise<ActionResponse> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    const result = await adminUserService.lock(userId, reason);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function unlockUserAction(
  userId: string,
  reason: string | undefined,
): Promise<ActionResponse> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    const result = await adminUserService.unlock(userId, reason);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
