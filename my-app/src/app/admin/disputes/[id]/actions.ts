'use server';

import { revalidatePath } from 'next/cache';
import { adminDisputeService } from '@/shared/services/adminDisputeService';
import { authService } from '@/shared/services/authService';
import type { AdminDisputeOutcome, AdminDisputeStatus } from '@/shared/types';

interface ResolveResponse {
  ok: boolean;
  status?: AdminDisputeStatus;
  error?: string;
}

export async function resolveDisputeAction(
  disputeId: string,
  outcome: AdminDisputeOutcome,
  note: string,
): Promise<ResolveResponse> {
  const user = await authService.getMe();
  if (!user) return { ok: false, error: 'Phiên đăng nhập đã hết hạn' };
  if (user.role !== 'ADMIN') return { ok: false, error: 'Yêu cầu quyền admin' };

  try {
    const result = await adminDisputeService.resolve(disputeId, outcome, note);
    revalidatePath('/admin/disputes');
    revalidatePath(`/admin/disputes/${disputeId}`);
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
