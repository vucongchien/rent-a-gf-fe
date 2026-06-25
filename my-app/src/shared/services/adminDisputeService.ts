/**
 * adminDisputeService — quản lý disputes.
 */

import { serverFetch } from '@/shared/lib/apiClient';
import { getRequestCookieHeader } from '@/shared/lib/cookieHelper';
import type {
  AdminAuditLogEntry,
  AdminDisputeDetail,
  AdminDisputeListParams,
  AdminDisputeListResponse,
  AdminDisputeOutcome,
  AdminDisputeRow,
  AdminDisputeStatus,
  AdminDisputeResolveResult,
  ServiceRequestOptions,
} from '@/shared/types';

interface ApiDisputeDTO {
  disputeId: string;
  bookingId: string;
  reporterId: string;
  accusedId: string;
  reason: string;
  status: string;
  adminId?: string | null;
  resolution?: string | null;
  notes?: string | null;
  version: number;
  evidences: Array<{
    evidenceId: string;
    evidenceType: string;
    content: string;
  }>;
  createdAt?: string;
  openedAt?: string;
}

interface ApiDisputeListResponse {
  disputes?: ApiDisputeDTO[];
  data?: ApiDisputeDTO[];
  rows?: ApiDisputeDTO[];
  total?: number | string;
  page?: number;
  pageSize?: number;
}

interface ApiResolveDisputeResponse {
  success?: boolean;
}

export const adminDisputeService = {
  async list(
    params: AdminDisputeListParams = {},
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeListResponse> {
    const req = await getRequestCookieHeader(options?.req);
    const sp = new URLSearchParams();
    if (params.status && params.status !== 'ALL') {
      sp.set('status', params.status === 'INVESTIGATING' ? 'RESOLVING' : params.status);
    }
    if (params.page) sp.set('page', String(params.page));
    if (params.pageSize) sp.set('pageSize', String(params.pageSize));
    const raw = await serverFetch<ApiDisputeListResponse>('/disputes', {
      searchParams: sp,
      req,
    });
    return normalizeList(raw, params);
  },

  async getById(
    disputeId: string,
    options?: ServiceRequestOptions,
  ): Promise<AdminDisputeDetail | null> {
    try {
      const req = await getRequestCookieHeader(options?.req);
      const raw = await serverFetch<ApiDisputeDTO>(`/disputes/${disputeId}`, {
        req,
      });
      return normalizeDetail(raw);
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
    // SSOT body: `{ resolution, notes }` với resolution ∈ REFUND_CLIENT | PAYOUT_COMPANION | REJECT_DISPUTE.
    const resolution =
      outcome === 'REFUND' ? 'REFUND_CLIENT'
      : outcome === 'CHARGE' ? 'PAYOUT_COMPANION'
      : 'REJECT_DISPUTE';
    const req = await getRequestCookieHeader(options?.req);
    const result = await serverFetch<ApiResolveDisputeResponse>(
      `/disputes/${disputeId}/resolve`,
      {
        method: 'POST',
        body: { resolution, notes: note },
        req,
      },
    );
    return {
      success: result.success ?? true,
      status: 'RESOLVED',
      outcome: {
        type: outcome,
        note,
        resolvedBy: '',
        resolvedAt: new Date().toISOString(),
      },
      auditEntry: createAuditEntry('RESOLVE_DISPUTE', disputeId, note),
    };
  },
};

function normalizeList(
  raw: ApiDisputeListResponse,
  params: AdminDisputeListParams,
): AdminDisputeListResponse {
  const apiRows = raw.disputes ?? raw.data ?? raw.rows ?? [];
  let rows = apiRows.map(normalizeRow);
  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((row) =>
      [row.disputeId, row.bookingId, row.reason, row.clientName, row.companionName]
        .some((value) => value.toLowerCase().includes(q)),
    );
  }
  return {
    rows,
    total: Number(raw.total ?? rows.length),
    page: raw.page ?? params.page ?? 1,
    pageSize: raw.pageSize ?? params.pageSize ?? 10,
    counts: countStatuses(rows),
  };
}

function normalizeDetail(raw: ApiDisputeDTO): AdminDisputeDetail {
  const row = normalizeRow(raw);
  const resolvedAt = raw.status === 'RESOLVED' ? row.openedAt : '';
  return {
    ...row,
    description: raw.notes ?? raw.reason,
    bookingSnapshot: {
      scenarioTitle: 'Chưa có trong API',
      startTime: '',
      price: 0,
    },
    evidence: raw.evidences.map((item) => ({
      evidenceId: item.evidenceId,
      label: `${item.evidenceType}: ${item.content}`,
      submittedBy: raw.reporterId,
      createdAt: '',
    })),
    outcome: raw.resolution
      ? {
          type: normalizeOutcome(raw.resolution),
          note: raw.notes ?? '',
          resolvedBy: raw.adminId ?? '',
          resolvedAt,
        }
      : null,
    auditLog: [],
  };
}

function normalizeRow(raw: ApiDisputeDTO): AdminDisputeRow {
  return {
    disputeId: raw.disputeId,
    bookingId: raw.bookingId,
    clientName: raw.reporterId,
    companionName: raw.accusedId,
    reason: raw.reason,
    status: normalizeStatus(raw.status),
    severity: 'MEDIUM',
    openedAt: raw.openedAt ?? raw.createdAt ?? '',
  };
}

function normalizeStatus(status: string): AdminDisputeStatus {
  if (status === 'RESOLVED') return 'RESOLVED';
  if (status === 'RESOLVING' || status === 'INVESTIGATING') return 'INVESTIGATING';
  return 'OPEN';
}

function normalizeOutcome(resolution: string): AdminDisputeOutcome {
  if (resolution === 'REFUND_CLIENT') return 'REFUND';
  if (resolution === 'PAYOUT_COMPANION') return 'CHARGE';
  return 'DISMISS';
}

function countStatuses(rows: AdminDisputeRow[]): Record<AdminDisputeStatus, number> {
  return rows.reduce<Record<AdminDisputeStatus, number>>(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { OPEN: 0, INVESTIGATING: 0, RESOLVED: 0 },
  );
}

function createAuditEntry(
  action: AdminAuditLogEntry['action'],
  targetId: string,
  reason: string,
): AdminAuditLogEntry {
  return {
    entryId: `local-${Date.now()}`,
    actorId: '',
    actorName: '',
    action,
    targetType: 'DISPUTE',
    targetId,
    reason,
    createdAt: new Date().toISOString(),
  };
}
