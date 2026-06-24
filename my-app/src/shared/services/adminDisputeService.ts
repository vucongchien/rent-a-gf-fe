/**
 * adminDisputeService — quản lý disputes.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { currentMockUser } from '@/mocks/fixtures/data';
import {
  adminDisputeOverlay,
  appendAuditEntry,
  getAdminDispute,
  listAdminDisputes,
} from '@/mocks/fixtures/admin';
import type {
  AdminDisputeDetail,
  AdminDisputeListParams,
  AdminDisputeListResponse,
  AdminDisputeOutcome,
  AdminDisputeResolveResult,
  AdminDisputeStatus,
  ServiceRequestOptions,
} from '@/shared/types';

const isMock = () =>
  process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true' || !process.env.API_URL;

export const adminDisputeService = {
  async list(
    params: AdminDisputeListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeListResponse> {
    if (isMock()) {
      const rows = listAdminDisputes();
      const counts: Record<AdminDisputeStatus, number> = {
        OPEN: 0,
        INVESTIGATING: 0,
        RESOLVED: 0,
      };
      rows.forEach((r) => {
        counts[r.status]++;
      });

      const status = params.status ?? 'ALL';
      const q = (params.q ?? '').trim().toLowerCase();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));

      let filtered = rows;
      if (status !== 'ALL') filtered = filtered.filter((r) => r.status === status);
      if (q)
        filtered = filtered.filter(
          (r) =>
            r.disputeId.toLowerCase().includes(q) ||
            r.bookingId.toLowerCase().includes(q) ||
            r.clientName.toLowerCase().includes(q) ||
            r.companionName.toLowerCase().includes(q),
        );

      const total = filtered.length;
      const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { rows: sliced, total, page, pageSize, counts };
    }

    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    return serverFetch<AdminDisputeListResponse>('/disputes', {
      searchParams: sp,
      req: options?.req,
    });
  },

  async getById(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeDetail | null> {
    if (isMock()) return getAdminDispute(disputeId);
    try {
      return await serverFetch<AdminDisputeDetail>(`/disputes/${disputeId}`, {
        req: options?.req,
      });
    } catch (err) {
      console.error('[adminDisputeService] getById error:', err);
      return null;
    }
  },

  async resolve(
    disputeId: string,
    outcome: AdminDisputeOutcome,
    note: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeResolveResult> {
    if (!note || note.trim().length < 5) {
      throw new Error('Phải nhập ghi chú giải quyết (≥ 5 ký tự)');
    }
    if (isMock()) {
      const ov = adminDisputeOverlay[disputeId];
      if (!ov) throw new Error('Không tìm thấy dispute');
      if (ov.status === 'RESOLVED') {
        throw new Error('Dispute đã được giải quyết, không thể thay đổi');
      }
      const actor = currentMockUser!;
      ov.status = 'RESOLVED';
      ov.outcome = {
        type: outcome,
        note: note.trim(),
        resolvedBy: actor?.displayName ?? 'Admin',
        resolvedAt: new Date().toISOString(),
      };
      const auditEntry = appendAuditEntry({
        actorId: actor?.userId ?? 'u-admin-1',
        actorName: actor?.displayName ?? 'Admin',
        action: 'RESOLVE_DISPUTE',
        targetType: 'DISPUTE',
        targetId: disputeId,
        reason: `${outcome} · ${note.trim()}`,
      });
      return {
        success: true,
        status: ov.status,
        outcome: ov.outcome,
        auditEntry,
      };
    }
    // SSOT body: `{ resolution, notes }` với resolution ∈ REFUND_CLIENT | PAYOUT_COMPANION | REJECT_DISPUTE.
    const resolution =
      outcome === 'REFUND' ? 'REFUND_CLIENT'
      : outcome === 'CHARGE' ? 'PAYOUT_COMPANION'
      : 'REJECT_DISPUTE';
    return serverFetch<AdminDisputeResolveResult>(
      `/disputes/${disputeId}/resolve`,
      {
        method: 'POST',
        body: { resolution, notes: note },
        req: options?.req,
      },
    );
  },
};
