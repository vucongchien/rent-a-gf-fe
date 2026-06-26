/**
 * adminUserService — quản lý users từ admin console.
 *
 * KHÔNG dùng "use cache" — sensitive data.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminAuditLogEntry,
  AdminUserActionResult,
  AdminUserDetail,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserRow,
  AdminUserStatus,
  ServiceRequestOptions,
} from '@/shared/types';

type ApiAccountRole =
  | 'ACCOUNT_ROLE_UNSPECIFIED'
  | 'ACCOUNT_ROLE_CLIENT'
  | 'ACCOUNT_ROLE_COMPANION'
  | 'ACCOUNT_ROLE_ADMIN'
  | 'CLIENT'
  | 'COMPANION'
  | 'ADMIN';

type ApiAccountStatus =
  | 'ACCOUNT_STATUS_UNSPECIFIED'
  | 'ACCOUNT_STATUS_ACTIVE'
  | 'ACCOUNT_STATUS_LOCKED'
  | AdminUserStatus;

interface ApiAccountResponse {
  id: string;
  email?: string;
  role?: ApiAccountRole;
  status?: ApiAccountStatus;
  violationCount?: number;
  createdAt?: string;
}

interface ApiMessageResponse {
  message?: string;
}

export const adminUserService = {
  async list(
    params: AdminUserListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminUserListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const sp = new URLSearchParams();
    if (params.role) sp.set('role', params.role);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));

    interface ApiAccountsListResponse {
      data?: ApiAccountResponse[];
      total?: number;
      page?: number;
      pageSize?: number;
    }

    try {
      const raw = await serverFetch<ApiAccountsListResponse>('/admin/accounts', {
        searchParams: sp,
        req,
      });

      const rawData = raw.data || [];
      const rows: AdminUserRow[] = rawData.map((item): AdminUserRow => {
        const email = item.email ?? '';
        const userId = item.id;
        return {
          userId,
          email,
          displayName: email || userId,
          avatarUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(email || userId)}`,
          role: normalizeRole(item.role),
          status: normalizeStatus(item.status),
          walletBalance: 0, // Backend API admin/accounts chưa hỗ trợ trả về số dư
          totalBookings: 0, // Backend API chưa hỗ trợ số lượng booking
          violationCount: item.violationCount ?? 0,
          createdAt: item.createdAt ?? '',
        };
      });

      // Tự tính toán counts của danh sách trả về để tránh crash
      const counts = {
        ACTIVE: rows.filter((r) => r.status === 'ACTIVE').length,
        LOCKED: rows.filter((r) => r.status === 'LOCKED').length,
      };

      return {
        rows,
        page: raw.page ?? params.page ?? 1,
        pageSize: raw.pageSize ?? params.pageSize ?? 12,
        total: raw.total ?? rows.length,
        counts,
      };
    } catch (err) {
      console.error('[adminUserService.list] Lỗi gọi API accounts:', err);
      return {
        rows: [],
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 12,
        total: 0,
        counts: { ACTIVE: 0, LOCKED: 0 },
      };
    }
  },

  async getById(userId: string, options?: ServiceRequestOptions): Promise<AdminUserDetail | null> {
    try {
      const req = await getRequestCookieHeader(options?.req);
      const raw = await serverFetch<ApiAccountResponse>(`/admin/accounts/${userId}`, {
        req,
      });
      return normalizeAccountDetail(raw);
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
  const req = await getRequestCookieHeader(options?.req);
  const path = `/admin/accounts/${userId}/${action.toLowerCase()}`;
  await serverFetch<ApiMessageResponse>(path, {
    method: 'POST',
    body: { reason: reason ?? '' },
    req,
  });
  const status = action === 'LOCK' ? 'LOCKED' : 'ACTIVE';
  return {
    success: true,
    status,
    auditEntry: createAuditEntry(action === 'LOCK' ? 'LOCK_USER' : 'UNLOCK_USER', userId, reason),
  };
}

function normalizeAccountDetail(raw: ApiAccountResponse): AdminUserDetail {
  const email = raw.email ?? '';
  const userId = raw.id;
  return {
    userId,
    email,
    displayName: email || userId,
    avatarUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(email || userId)}`,
    role: normalizeRole(raw.role),
    status: normalizeStatus(raw.status),
    walletBalance: 0,
    totalBookings: 0,
    violationCount: raw.violationCount ?? 0,
    createdAt: raw.createdAt ?? '',
    recentBookings: [],
    recentTransactions: [],
    auditLog: [],
  };
}

function normalizeRole(role: ApiAccountRole | undefined): AdminUserDetail['role'] {
  if (role === 'ACCOUNT_ROLE_ADMIN' || role === 'ADMIN') return 'ADMIN';
  if (role === 'ACCOUNT_ROLE_COMPANION' || role === 'COMPANION') return 'COMPANION';
  return 'CLIENT';
}

function normalizeStatus(status: ApiAccountStatus | undefined): AdminUserStatus {
  return status === 'ACCOUNT_STATUS_LOCKED' || status === 'LOCKED' ? 'LOCKED' : 'ACTIVE';
}

function createAuditEntry(
  action: AdminAuditLogEntry['action'],
  userId: string,
  reason: string | undefined,
): AdminAuditLogEntry {
  return {
    entryId: `local-${Date.now()}`,
    actorId: '',
    actorName: '',
    action,
    targetType: 'USER',
    targetId: userId,
    reason,
    createdAt: new Date().toISOString(),
  };
}
