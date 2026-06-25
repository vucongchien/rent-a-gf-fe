/**
 * adminUserService — quản lý users từ admin console.
 *
 * KHÔNG dùng "use cache" — sensitive data.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import type {
  AdminUserActionResult,
  AdminUserDetail,
  AdminUserListParams,
  AdminUserListResponse,
  ServiceRequestOptions,
} from '@/shared/types';

export const adminUserService = {
  async list(
    params: AdminUserListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUserListResponse> {
    const sp = new URLSearchParams();
    if (params.role) sp.set('role', params.role);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminUserListResponse>('/admin/accounts', {
      searchParams: sp,
      req: options?.req,
    });
  },

  async getById(userId: string, options?: ServiceRequestOptions): Promise<AdminUserDetail | null> {
    try {
      return await serverFetch<AdminUserDetail>(`/admin/accounts/${userId}`, {
        req: options?.req,
      });
    } catch (err) {
      console.error('[adminUserService] getById error:', err);
      return null;
    }
  },

  async lock(
    userId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminUserActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do khóa (≥ 3 ký tự)');
    }
    return mutateUser('LOCK', userId, reason, options);
  },

  async unlock(
    userId: string,
    reason: string | undefined,
    options?: ServiceRequestOptions,
  ): Promise<AdminUserActionResult> {
    return mutateUser('UNLOCK', userId, reason, options);
  },
};

async function mutateUser(
  action: 'LOCK' | 'UNLOCK',
  userId: string,
  reason: string | undefined,
  options?: ServiceRequestOptions,
): Promise<AdminUserActionResult> {
  const path = `/admin/accounts/${userId}/${action.toLowerCase()}`;
  return serverFetch<AdminUserActionResult>(path, {
    method: 'POST',
    body: reason ? { reason } : undefined,
    req: options?.req,
  });
}
