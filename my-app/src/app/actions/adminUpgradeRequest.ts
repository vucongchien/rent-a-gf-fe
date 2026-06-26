'use server';

import { revalidatePath } from 'next/cache';
import { adminUpgradeRequestService } from '@/shared/services/adminUpgradeRequestService';
import type {
  AdminUpgradeRequestActionResult,
  AdminUpgradeRequestListParams,
  AdminUpgradeRequestListResponse,
} from '@/shared/types';

export type AdminUpgradeRequestListActionState =
  | { status: 'success'; data: AdminUpgradeRequestListResponse }
  | { status: 'error'; message: string };

export type AdminUpgradeRequestMutationState =
  | { status: 'success'; data: AdminUpgradeRequestActionResult }
  | { status: 'error'; message: string };

/** Load list cho admin console (server action wrapper khi cần dùng từ client). */
export async function listUpgradeRequestsAction(
  params: AdminUpgradeRequestListParams = {},
): Promise<AdminUpgradeRequestListActionState> {
  try {
    const data = await adminUpgradeRequestService.listUpgradeRequests(params);
    return { status: 'success', data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể tải danh sách yêu cầu nâng cấp.';
    return { status: 'error', message };
  }
}

export async function approveUpgradeRequestAction(
  id: string,
): Promise<AdminUpgradeRequestMutationState> {
  try {
    const data = await adminUpgradeRequestService.approveUpgradeRequest(id);
    revalidatePath('/admin/upgrade-requests');
    return { status: 'success', data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể duyệt yêu cầu. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}

export async function rejectUpgradeRequestAction(
  id: string,
  reason: string,
): Promise<AdminUpgradeRequestMutationState> {
  try {
    const data = await adminUpgradeRequestService.rejectUpgradeRequest(id, reason);
    revalidatePath('/admin/upgrade-requests');
    return { status: 'success', data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể từ chối yêu cầu. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
