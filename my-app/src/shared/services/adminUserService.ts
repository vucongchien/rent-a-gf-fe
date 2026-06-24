/**
 * adminUserService — quản lý users từ admin console.
 *
 * Mock mode: đọc/ghi trực tiếp fixtures.
 * KHÔNG dùng "use cache" — sensitive data.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { currentMockUser } from '@/mocks/fixtures/data';
import {
  adminUserOverlay,
  adminUserStaticInfo,
  appendAuditEntry,
  getAuditEntriesFor,
  listAdminUsers,
} from '@/mocks/fixtures/admin';
import type {
  AdminUserActionResult,
  AdminUserDetail,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserRow,
  ServiceRequestOptions,
} from '@/shared/types';

const isMock = () =>
  process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

export const adminUserService = {
  async list(
    params: AdminUserListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUserListResponse> {
    if (isMock()) {
      const rows = listAdminUsers();
      const counts = { ACTIVE: 0, LOCKED: 0 };
      rows.forEach((r) => {
        counts[r.status]++;
      });

      const role = params.role ?? 'ALL';
      const status = params.status ?? 'ALL';
      const q = (params.q ?? '').trim().toLowerCase();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));

      let filtered = rows;
      if (role !== 'ALL') filtered = filtered.filter((r) => r.role === role);
      if (status !== 'ALL') filtered = filtered.filter((r) => r.status === status);
      if (q)
        filtered = filtered.filter(
          (r) =>
            r.displayName.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.userId.toLowerCase().includes(q),
        );

      const total = filtered.length;
      const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { rows: sliced, total, page, pageSize, counts };
    }

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
    if (isMock()) {
      const info = adminUserStaticInfo[userId];
      const ov = adminUserOverlay[userId];
      if (!info || !ov) return null;
      const row: AdminUserRow = { ...info, ...ov };
      return {
        ...row,
        recentBookings: [],
        recentTransactions: [],
        auditLog: getAuditEntriesFor('USER', userId),
      };
    }
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
  if (isMock()) {
    const ov = adminUserOverlay[userId];
    if (!ov) throw new Error('Không tìm thấy user');
    const requiredFrom = action === 'LOCK' ? 'ACTIVE' : 'LOCKED';
    if (ov.status !== requiredFrom) {
      throw new Error(
        `Chỉ thực hiện được khi user đang ${requiredFrom} (hiện tại: ${ov.status})`,
      );
    }
    ov.status = action === 'LOCK' ? 'LOCKED' : 'ACTIVE';
    const actor = currentMockUser!;
    const auditEntry = appendAuditEntry({
      actorId: actor?.userId ?? 'u-admin-1',
      actorName: actor?.displayName ?? 'Admin',
      action: action === 'LOCK' ? 'LOCK_USER' : 'UNLOCK_USER',
      targetType: 'USER',
      targetId: userId,
      reason,
    });
    return { success: true, status: ov.status, auditEntry };
  }
  const path = `/admin/accounts/${userId}/${action.toLowerCase()}`;
  return serverFetch<AdminUserActionResult>(path, {
    method: 'POST',
    body: reason ? { reason } : undefined,
    req: options?.req,
  });
}
