/**
 * Admin fixtures — overlay & synthetic data cho admin console.
 *
 * Thiết kế:
 * - Reuse `companions` / `mockUsers` (data.ts) — không duplicate dữ liệu base.
 * - Mỗi companion / user có overlay status. Transactions / disputes / flags là dataset độc lập.
 * - Audit log + outcome stores là in-memory, append khi gọi action handler.
 */

import { companions, mockUsers, getMockAvatarUrl } from './data';
import type {
  AdminAuditLogEntry,
  AdminCompanionReport,
  AdminDisputeDetail,
  AdminDisputeRow,
  AdminFeatureFlag,
  AdminTransactionRow,
  AdminUserRow,
  AdminUserStatus,
  ModerationStatus,
  AdminModerationAction,
} from '@/shared/types';

interface AdminCompanionOverlay {
  status: ModerationStatus;
  submittedAt: string;
  reports: AdminCompanionReport[];
}

const daysAgoIso = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Patch một số companion sang PENDING / REJECTED / SUSPENDED để admin có data đa dạng test.
 */
function buildOverlay(companionId: string, idx: number): AdminCompanionOverlay {
  // Phân bố: 4 PENDING, 2 REJECTED, 2 SUSPENDED, còn lại APPROVED.
  let status: ModerationStatus = 'APPROVED';
  if (idx >= 23) status = 'PENDING';
  else if (idx === 21 || idx === 22) status = 'REJECTED';
  else if (idx === 19 || idx === 20) status = 'SUSPENDED';

  const reports: AdminCompanionReport[] =
    status === 'SUSPENDED'
      ? [
          {
            reportId: `rp-${companionId}-1`,
            reason: 'Vi phạm điều khoản: dùng ngôn từ không phù hợp trong chat',
            reporterName: 'Người dùng ẩn danh',
            createdAt: daysAgoIso(5),
          },
        ]
      : status === 'PENDING'
      ? []
      : [];

  return {
    status,
    submittedAt: daysAgoIso((idx % 14) + 1),
    reports,
  };
}

export const adminCompanionOverlay: Record<string, AdminCompanionOverlay> = (() => {
  const map: Record<string, AdminCompanionOverlay> = {};
  companions.forEach((c, idx) => {
    map[c.companionId] = buildOverlay(c.companionId, idx);
  });
  return map;
})();

/** Audit log store — mutable, append-only. */
export const adminAuditLog: AdminAuditLogEntry[] = [];

export function appendAuditEntry(input: {
  actorId: string;
  actorName: string;
  action: AdminModerationAction;
  targetType: AdminAuditLogEntry['targetType'];
  targetId: string;
  reason?: string;
}): AdminAuditLogEntry {
  const entry: AdminAuditLogEntry = {
    entryId: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  adminAuditLog.unshift(entry);
  return entry;
}

/** Lọc audit log theo target. */
export function getAuditEntriesFor(
  targetType: AdminAuditLogEntry['targetType'],
  targetId: string,
): AdminAuditLogEntry[] {
  return adminAuditLog.filter(
    (e) => e.targetType === targetType && e.targetId === targetId,
  );
}

// ─── USERS ─────────────────────────────────────────────────────────────────

interface AdminUserOverlay {
  status: AdminUserStatus;
  walletBalance: number;
  totalBookings: number;
  violationCount: number;
  createdAt: string;
}

/** Tạo seed users từ mockUsers + 8 synthetic clients để bảng có dữ liệu. */
function buildSeedUsers(): AdminUserRow[] {
  const base: AdminUserRow[] = [];

  // Reuse mockUsers
  ([mockUsers.client, mockUsers.companion, mockUsers.admin] as const).forEach((u, i) => {
    base.push({
      userId: u.userId,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      status: 'ACTIVE',
      walletBalance: u.role === 'CLIENT' ? 1200 : u.role === 'COMPANION' ? 4800 : 0,
      totalBookings: u.role === 'CLIENT' ? 4 : u.role === 'COMPANION' ? 12 : 0,
      violationCount: 0,
      createdAt: daysAgoIso(30 + i * 5),
    });
  });

  // Synthetic clients
  for (let i = 1; i <= 8; i++) {
    const id = `u-syn-${i}`;
    base.push({
      userId: id,
      email: `user${i}@example.com`,
      displayName: `Khách hàng ${i}`,
      avatarUrl: getMockAvatarUrl(id),
      role: 'CLIENT',
      status: i === 3 ? 'LOCKED' : 'ACTIVE',
      walletBalance: 200 + i * 130,
      totalBookings: (i * 2) % 9,
      violationCount: i === 3 ? 2 : i === 7 ? 1 : 0,
      createdAt: daysAgoIso(i * 4),
    });
  }
  return base;
}

const _seedUsers = buildSeedUsers();

export const adminUserOverlay: Record<string, AdminUserOverlay> = (() => {
  const map: Record<string, AdminUserOverlay> = {};
  _seedUsers.forEach((u) => {
    map[u.userId] = {
      status: u.status,
      walletBalance: u.walletBalance,
      totalBookings: u.totalBookings,
      violationCount: u.violationCount,
      createdAt: u.createdAt,
    };
  });
  return map;
})();

/** Static info cho user (immutable phần avatar/email/role). Map keyed by userId. */
export const adminUserStaticInfo: Record<
  string,
  Pick<AdminUserRow, 'userId' | 'email' | 'displayName' | 'avatarUrl' | 'role'>
> = (() => {
  const map: Record<string, AdminUserRow> = {};
  _seedUsers.forEach((u) => {
    map[u.userId] = u;
  });
  return map;
})();

export function listAdminUsers(): AdminUserRow[] {
  return Object.values(adminUserStaticInfo).map((info) => {
    const ov = adminUserOverlay[info.userId];
    return { ...info, ...ov };
  });
}

// ─── TRANSACTIONS ──────────────────────────────────────────────────────────

function buildTransactions(): AdminTransactionRow[] {
  const rows: AdminTransactionRow[] = [];
  const users = listAdminUsers();
  let counter = 1;
  const types: AdminTransactionRow['type'][] = ['TOPUP', 'BOOKING', 'REFUND', 'PAYOUT'];
  const statuses: AdminTransactionRow['status'][] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'PENDING', 'FAILED'];

  for (let i = 0; i < 28; i++) {
    const u = users[i % users.length];
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const amount =
      type === 'TOPUP'
        ? 500 + (i % 5) * 200
        : type === 'BOOKING'
        ? -(150 + (i % 4) * 80)
        : type === 'REFUND'
        ? 100 + (i % 3) * 50
        : -(300 + (i % 4) * 100);
    rows.push({
      transactionId: `tx-adm-${String(counter).padStart(4, '0')}`,
      type,
      status,
      amount,
      userId: u.userId,
      userName: u.displayName,
      description:
        type === 'TOPUP'
          ? 'Nạp tiền VNPay'
          : type === 'BOOKING'
          ? `Thanh toán booking #bk-${1000 + i}`
          : type === 'REFUND'
          ? `Hoàn tiền booking #bk-${1000 + i}`
          : 'Rút tiền về tài khoản ngân hàng',
      reference: type === 'TOPUP' ? `VNPAY-${100000 + i}` : `bk-${1000 + i}`,
      createdAt: daysAgoIso(i % 14),
    });
    counter++;
  }
  return rows;
}

export const adminTransactions: AdminTransactionRow[] = buildTransactions();

// ─── DISPUTES ──────────────────────────────────────────────────────────────

interface DisputeOverlay {
  status: AdminDisputeDetail['status'];
  outcome: AdminDisputeDetail['outcome'];
}

const _disputesSeed: Omit<AdminDisputeDetail, 'status' | 'outcome' | 'auditLog'>[] = [
  {
    disputeId: 'dsp-001',
    bookingId: 'bk-1',
    clientName: 'Minh Khách',
    companionName: 'Nguyễn Thị Linh',
    reason: 'Companion không xuất hiện đúng giờ',
    severity: 'HIGH',
    openedAt: daysAgoIso(2),
    description:
      'Khách hàng phản ánh companion trễ hơn 40 phút mà không thông báo, ảnh hưởng đến lịch trình buổi gặp.',
    bookingSnapshot: {
      scenarioTitle: 'Cà phê & trò chuyện',
      startTime: daysAgoIso(2),
      price: 150,
    },
    evidence: [
      {
        evidenceId: 'ev-001',
        label: 'Ảnh chụp tin nhắn xác nhận thời gian',
        submittedBy: 'Minh Khách',
        createdAt: daysAgoIso(2),
      },
    ],
  },
  {
    disputeId: 'dsp-002',
    bookingId: 'bk-2',
    clientName: 'Khách hàng 2',
    companionName: 'Trần Hà My',
    reason: 'Thanh toán bị trừ hai lần',
    severity: 'MEDIUM',
    openedAt: daysAgoIso(4),
    description:
      'Hệ thống ghi nhận giao dịch trừ tiền 2 lần cho cùng 1 booking. Đang đối soát với cổng thanh toán.',
    bookingSnapshot: {
      scenarioTitle: 'Ăn tối tại nhà hàng',
      startTime: daysAgoIso(5),
      price: 250,
    },
    evidence: [],
  },
  {
    disputeId: 'dsp-003',
    bookingId: 'bk-3',
    clientName: 'Khách hàng 5',
    companionName: 'Lê Hoàng Yến',
    reason: 'Companion vi phạm điều khoản giao tiếp',
    severity: 'HIGH',
    openedAt: daysAgoIso(7),
    description:
      'Khách phản ánh companion sử dụng ngôn từ không phù hợp trong chat. Đã thu thập log chat.',
    bookingSnapshot: {
      scenarioTitle: 'Workshop cắm hoa',
      startTime: daysAgoIso(8),
      price: 220,
    },
    evidence: [
      {
        evidenceId: 'ev-002',
        label: 'Trích đoạn chat 5/6',
        submittedBy: 'System',
        createdAt: daysAgoIso(7),
      },
    ],
  },
  {
    disputeId: 'dsp-004',
    bookingId: 'bk-4',
    clientName: 'Khách hàng 7',
    companionName: 'Phạm Quỳnh Anh',
    reason: 'Chất lượng buổi gặp không như mô tả',
    severity: 'LOW',
    openedAt: daysAgoIso(10),
    description: 'Khách không hài lòng với chất lượng buổi gặp so với scenario được mô tả.',
    bookingSnapshot: {
      scenarioTitle: 'Đi bộ Hồ Tây',
      startTime: daysAgoIso(11),
      price: 180,
    },
    evidence: [],
  },
  {
    disputeId: 'dsp-005',
    bookingId: 'bk-5',
    clientName: 'Khách hàng 4',
    companionName: 'Đỗ Bảo Châu',
    reason: 'Hủy booking sát giờ không hoàn tiền',
    severity: 'MEDIUM',
    openedAt: daysAgoIso(12),
    description:
      'Companion hủy booking 30 phút trước giờ hẹn nhưng hệ thống không tự động hoàn tiền cho khách.',
    bookingSnapshot: {
      scenarioTitle: 'Đi cà phê làm việc',
      startTime: daysAgoIso(13),
      price: 200,
    },
    evidence: [],
  },
];

export const adminDisputeOverlay: Record<string, DisputeOverlay> = {
  'dsp-001': { status: 'OPEN', outcome: null },
  'dsp-002': { status: 'INVESTIGATING', outcome: null },
  'dsp-003': { status: 'OPEN', outcome: null },
  'dsp-004': {
    status: 'RESOLVED',
    outcome: {
      type: 'DISMISS',
      note: 'Sau khi xác minh, scenario đã mô tả chính xác. Đóng dispute không hoàn tiền.',
      resolvedBy: 'Admin',
      resolvedAt: daysAgoIso(9),
    },
  },
  'dsp-005': { status: 'INVESTIGATING', outcome: null },
};

export function listAdminDisputes(): AdminDisputeRow[] {
  return _disputesSeed.map((d) => ({
    ...d,
    status: adminDisputeOverlay[d.disputeId].status,
  }));
}

export function getAdminDispute(disputeId: string): AdminDisputeDetail | null {
  const base = _disputesSeed.find((d) => d.disputeId === disputeId);
  if (!base) return null;
  const ov = adminDisputeOverlay[disputeId];
  return {
    ...base,
    status: ov.status,
    outcome: ov.outcome,
    auditLog: getAuditEntriesFor('DISPUTE', disputeId),
  };
}

// ─── FEATURE FLAGS ─────────────────────────────────────────────────────────

export const adminFeatureFlags: AdminFeatureFlag[] = [
  {
    key: 'wallet.realPayment',
    label: 'Wallet · Thanh toán thật',
    description:
      'Bật/tắt tích hợp VNPay thật. Khi tắt, mọi top-up sẽ chạy qua mock provider.',
    enabled: false,
    updatedAt: daysAgoIso(5),
    updatedBy: 'Admin',
  },
  {
    key: 'chat.voiceMessage',
    label: 'Chat · Tin nhắn thoại',
    description: 'Cho phép gửi tin nhắn thoại trong chat room.',
    enabled: true,
    updatedAt: daysAgoIso(10),
    updatedBy: 'Admin',
  },
  {
    key: 'booking.urlModal',
    label: 'Booking · URL-driven modal',
    description:
      'Bật intercepting route cho booking modal (desktop). Tắt sẽ fallback sang full page.',
    enabled: true,
    updatedAt: daysAgoIso(20),
    updatedBy: null,
  },
  {
    key: 'notifications.push',
    label: 'Notifications · Web Push',
    description: 'Bật/tắt push notification cho tất cả users.',
    enabled: false,
    updatedAt: daysAgoIso(3),
    updatedBy: 'Admin',
  },
  {
    key: 'admin.bulkActions',
    label: 'Admin · Bulk actions',
    description: 'Bật bulk approve/reject trên trang Companions admin.',
    enabled: false,
    updatedAt: daysAgoIso(1),
    updatedBy: null,
  },
];

export function setFeatureFlag(key: string, enabled: boolean, actorName: string): AdminFeatureFlag | null {
  const flag = adminFeatureFlags.find((f) => f.key === key);
  if (!flag) return null;
  flag.enabled = enabled;
  flag.updatedAt = new Date().toISOString();
  flag.updatedBy = actorName;
  return flag;
}
