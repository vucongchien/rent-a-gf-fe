/**
 * adminCompanionService — moderation API cho admin console.
 *
 * Quy ước:
 * - KHÔNG dùng "use cache" — admin data nhạy cảm + thay đổi nhanh.
 * - Mock mode (NEXT_PUBLIC_MOCK_ENABLED=true hoặc không có API_URL): đọc/ghi trực tiếp fixtures.
 * - Real mode: serverFetch tới BFF /admin/companions.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { companions, currentMockUser } from '@/mocks/fixtures/data';
import {
  adminCompanionOverlay,
  appendAuditEntry,
  getAuditEntriesFor,
} from '@/mocks/fixtures/admin';
import type {
  AdminCompanionDetail,
  AdminCompanionListParams,
  AdminCompanionListResponse,
  AdminCompanionRow,
  AdminModerationActionResult,
  ModerationStatus,
  ServiceRequestOptions,
} from '@/shared/types';

const ALL_STATUSES: ModerationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

const isMock = () =>
  process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

function toRow(c: (typeof companions)[number]): AdminCompanionRow {
  const overlay = adminCompanionOverlay[c.companionId];
  return {
    companionId: c.companionId,
    displayName: c.displayName,
    avatarUrl: c.avatarUrl,
    availableCities: c.availableCities,
    status: overlay.status,
    submittedAt: overlay.submittedAt,
    reportCount: overlay.reports.length,
    totalReviews: c.totalReviews,
    averageRating: c.averageRating,
  };
}

export const adminCompanionService = {
  async list(
    params: AdminCompanionListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminCompanionListResponse> {
    if (isMock()) {
      const rows = companions.map(toRow);
      const counts: Record<ModerationStatus, number> = {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        SUSPENDED: 0,
      };
      rows.forEach((r) => {
        counts[r.status]++;
      });

      const status = params.status ?? 'ALL';
      const q = (params.q ?? '').trim().toLowerCase();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));

      let filtered = rows;
      if (status !== 'ALL' && (ALL_STATUSES as string[]).includes(status)) {
        filtered = filtered.filter((r) => r.status === status);
      }
      if (q) {
        filtered = filtered.filter(
          (r) =>
            r.displayName.toLowerCase().includes(q) ||
            r.companionId.toLowerCase().includes(q),
        );
      }
      const total = filtered.length;
      const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { rows: sliced, total, page, pageSize, counts };
    }

    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminCompanionListResponse>('/admin/companions', {
      searchParams: sp,
      req: options?.req,
    });
  },

  async getById(
    companionId: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminCompanionDetail | null> {
    if (isMock()) {
      const companion = companions.find((c) => c.companionId === companionId);
      if (!companion) return null;
      const overlay = adminCompanionOverlay[companion.companionId];
      return {
        ...toRow(companion),
        introText: companion.introText,
        albumUrls: companion.albumUrls,
        voiceIntroUrl: companion.voiceIntroUrl,
        scenarios: companion.scenarios,
        recentReviews: companion.recentReviews,
        reports: overlay.reports,
        auditLog: getAuditEntriesFor('COMPANION', companion.companionId),
      };
    }
    try {
      return await serverFetch<AdminCompanionDetail>(
        `/admin/companions/${companionId}`,
        { req: options?.req },
      );
    } catch (err) {
      console.error('[adminCompanionService] getById error:', err);
      return null;
    }
  },

  async approve(
    companionId: string,
    reason: string | undefined,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    return mutateMoc('APPROVE', companionId, reason, options);
  },

  async reject(
    companionId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do từ chối (≥ 3 ký tự)');
    }
    return mutateMoc('REJECT', companionId, reason, options);
  },

  async suspend(
    companionId: string,
    reason: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminModerationActionResult> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Phải nhập lý do suspend (≥ 3 ký tự)');
    }
    return mutateMoc('SUSPEND', companionId, reason, options);
  },
};

async function mutateMoc(
  action: 'APPROVE' | 'REJECT' | 'SUSPEND',
  companionId: string,
  reason: string | undefined,
  options?: ServiceRequestOptions,
): Promise<AdminModerationActionResult> {
  const path = `/admin/companions/${companionId}/${action.toLowerCase()}`;
  if (isMock()) {
    const overlay = adminCompanionOverlay[companionId];
    if (!overlay) {
      throw new Error('Không tìm thấy companion');
    }
    const requiredFrom: ModerationStatus =
      action === 'SUSPEND' ? 'APPROVED' : 'PENDING';
    if (overlay.status !== requiredFrom) {
      throw new Error(
        `Chỉ thực hiện được khi đang ở trạng thái ${requiredFrom} (hiện tại: ${overlay.status})`,
      );
    }
    overlay.status =
      action === 'APPROVE'
        ? 'APPROVED'
        : action === 'REJECT'
        ? 'REJECTED'
        : 'SUSPENDED';
    const actor = currentMockUser!;
    const auditEntry = appendAuditEntry({
      actorId: actor?.userId ?? 'u-admin-1',
      actorName: actor?.displayName ?? 'Admin',
      action,
      targetType: 'COMPANION',
      targetId: companionId,
      reason,
    });
    return { success: true, status: overlay.status, auditEntry };
  }
  return serverFetch<AdminModerationActionResult>(path, {
    method: 'POST',
    body: reason ? { reason } : undefined,
    req: options?.req,
  });
}
