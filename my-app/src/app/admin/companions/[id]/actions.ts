'use server';

import { revalidatePath } from 'next/cache';
import { adminCompanionService } from '@/shared/services/adminCompanionService';
import { authService } from '@/shared/services/authService';
import type { AdminModerationActionResult } from '@/shared/types';

interface ActionResponse {
  ok: boolean;
  status?: AdminModerationActionResult['status'];
  error?: string;
}

async function assertAdmin(): Promise<string | null> {
  const user = await authService.getMe();
  if (!user) return 'Phiên đăng nhập đã hết hạn';
  if (user.role !== 'ADMIN') return 'Yêu cầu quyền admin';
  return null;
}

export async function approveCompanionAction(
  companionId: string,
  reason: string | undefined,
): Promise<ActionResponse> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    const result = await adminCompanionService.approve(companionId, reason);
    revalidatePath('/admin/companions');
    revalidatePath(`/admin/companions/${companionId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function rejectCompanionAction(
  companionId: string,
  reason: string,
): Promise<ActionResponse> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    const result = await adminCompanionService.reject(companionId, reason);
    revalidatePath('/admin/companions');
    revalidatePath(`/admin/companions/${companionId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function suspendCompanionAction(
  companionId: string,
  reason: string,
): Promise<ActionResponse> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  try {
    const result = await adminCompanionService.suspend(companionId, reason);
    revalidatePath('/admin/companions');
    revalidatePath(`/admin/companions/${companionId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
