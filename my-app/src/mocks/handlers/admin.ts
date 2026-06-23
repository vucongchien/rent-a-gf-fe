/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from 'msw';
import { companions, currentMockUser } from '../fixtures/data';
import {
  adminCompanionOverlay,
  appendAuditEntry,
  getAuditEntriesFor,
} from '../fixtures/admin';
import type {
  AdminCompanionDetail,
  AdminCompanionListResponse,
  AdminCompanionRow,
  AdminModerationActionResult,
  ModerationStatus,
} from '@/shared/types';

const ALL_STATUSES: ModerationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

function requireAdmin() {
  const user = currentMockUser;
  if (!user || user.role !== 'ADMIN') {
    return HttpResponse.json(
      { code: 'FORBIDDEN', message: 'Yêu cầu quyền admin' },
      { status: 403 },
    );
  }
  return null;
}

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

export const adminHandlers = [
  // ─── GET /api/admin/companions ──────────────────────────────────────────
  http.get('/api/admin/companions', async ({ request }) => {
    const denied = requireAdmin();
    if (denied) return denied;
    await delay(400);

    const url = new URL(request.url);
    const statusParam = (url.searchParams.get('status') ?? 'ALL').toUpperCase();
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.max(
      1,
      Math.min(100, Number(url.searchParams.get('pageSize') ?? '20')),
    );

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

    let filtered = rows;
    if (statusParam !== 'ALL' && (ALL_STATUSES as string[]).includes(statusParam)) {
      filtered = filtered.filter((r) => r.status === statusParam);
    }
    if (q) {
      filtered = filtered.filter((r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.companionId.toLowerCase().includes(q),
      );
    }

    const total = filtered.length;
    const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

    const body: AdminCompanionListResponse = {
      rows: sliced,
      total,
      page,
      pageSize,
      counts,
    };
    return HttpResponse.json(body);
  }),

  // ─── GET /api/admin/companions/:id ──────────────────────────────────────
  http.get('/api/admin/companions/:id', async ({ params }) => {
    const denied = requireAdmin();
    if (denied) return denied;
    await delay(300);

    const companion = companions.find((c) => c.companionId === params.id);
    if (!companion) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy companion' },
        { status: 404 },
      );
    }
    const overlay = adminCompanionOverlay[companion.companionId];
    const detail: AdminCompanionDetail = {
      ...toRow(companion),
      biography: companion.biography,
      albumUrls: companion.albumUrls,
      voiceIntroUrl: companion.voiceIntroUrl,
      scenarios: companion.scenarios,
      recentReviews: companion.recentReviews,
      reports: overlay.reports,
      auditLog: getAuditEntriesFor('COMPANION', companion.companionId),
    };
    return HttpResponse.json(detail);
  }),

  // ─── POST /api/admin/companions/:id/approve ─────────────────────────────
  http.post('/api/admin/companions/:id/approve', async ({ params, request }) => {
    const denied = requireAdmin();
    if (denied) return denied;
    await delay(400);

    const overlay = adminCompanionOverlay[params.id as string];
    if (!overlay) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy companion' },
        { status: 404 },
      );
    }
    if (overlay.status !== 'PENDING') {
      return HttpResponse.json(
        {
          code: 'INVALID_STATE',
          message: `Chỉ duyệt được hồ sơ ở trạng thái PENDING (hiện tại: ${overlay.status})`,
        },
        { status: 409 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    overlay.status = 'APPROVED';
    const actor = currentMockUser!;
    const auditEntry = appendAuditEntry({
      actorId: actor.userId,
      actorName: actor.displayName,
      action: 'APPROVE',
      targetType: 'COMPANION',
      targetId: params.id as string,
      reason: body.reason,
    });
    const result: AdminModerationActionResult = {
      success: true,
      status: overlay.status,
      auditEntry,
    };
    return HttpResponse.json(result);
  }),

  // ─── POST /api/admin/companions/:id/reject ──────────────────────────────
  http.post('/api/admin/companions/:id/reject', async ({ params, request }) => {
    const denied = requireAdmin();
    if (denied) return denied;
    await delay(400);

    const overlay = adminCompanionOverlay[params.id as string];
    if (!overlay) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy companion' },
        { status: 404 },
      );
    }
    if (overlay.status !== 'PENDING') {
      return HttpResponse.json(
        {
          code: 'INVALID_STATE',
          message: `Chỉ từ chối được hồ sơ ở trạng thái PENDING (hiện tại: ${overlay.status})`,
        },
        { status: 409 },
      );
    }
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    if (!body.reason || body.reason.trim().length < 3) {
      return HttpResponse.json(
        { code: 'VALIDATION', message: 'Phải nhập lý do từ chối (≥ 3 ký tự)' },
        { status: 400 },
      );
    }

    overlay.status = 'REJECTED';
    const actor = currentMockUser!;
    const auditEntry = appendAuditEntry({
      actorId: actor.userId,
      actorName: actor.displayName,
      action: 'REJECT',
      targetType: 'COMPANION',
      targetId: params.id as string,
      reason: body.reason,
    });
    const result: AdminModerationActionResult = {
      success: true,
      status: overlay.status,
      auditEntry,
    };
    return HttpResponse.json(result);
  }),

  // ─── POST /api/admin/companions/:id/suspend ─────────────────────────────
  http.post('/api/admin/companions/:id/suspend', async ({ params, request }) => {
    const denied = requireAdmin();
    if (denied) return denied;
    await delay(400);

    const overlay = adminCompanionOverlay[params.id as string];
    if (!overlay) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy companion' },
        { status: 404 },
      );
    }
    if (overlay.status !== 'APPROVED') {
      return HttpResponse.json(
        {
          code: 'INVALID_STATE',
          message: `Chỉ suspend được hồ sơ ở trạng thái APPROVED (hiện tại: ${overlay.status})`,
        },
        { status: 409 },
      );
    }
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    if (!body.reason || body.reason.trim().length < 3) {
      return HttpResponse.json(
        { code: 'VALIDATION', message: 'Phải nhập lý do suspend (≥ 3 ký tự)' },
        { status: 400 },
      );
    }

    overlay.status = 'SUSPENDED';
    const actor = currentMockUser!;
    const auditEntry = appendAuditEntry({
      actorId: actor.userId,
      actorName: actor.displayName,
      action: 'SUSPEND',
      targetType: 'COMPANION',
      targetId: params.id as string,
      reason: body.reason,
    });
    const result: AdminModerationActionResult = {
      success: true,
      status: overlay.status,
      auditEntry,
    };
    return HttpResponse.json(result);
  }),
];
