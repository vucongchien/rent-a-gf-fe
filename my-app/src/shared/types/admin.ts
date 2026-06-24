/**
 * admin.ts — Types cho Admin moderation domain.
 */

import type { PaginatedMeta } from './api';
import type { CompanionScenario, CompanionReview } from './companion';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type AdminModerationAction =
  | 'APPROVE'
  | 'REJECT'
  | 'SUSPEND'
  | 'LOCK_USER'
  | 'UNLOCK_USER'
  | 'RESOLVE_DISPUTE'
  | 'TOGGLE_FLAG';

export interface AdminCompanionRow {
  companionId: string;
  displayName: string;
  avatarUrl: string;
  availableCities: string[];
  status: ModerationStatus;
  submittedAt: string;
  reportCount: number;
  totalReviews: number;
  averageRating: number;
}

export interface AdminCompanionReport {
  reportId: string;
  reason: string;
  reporterName: string;
  createdAt: string;
}

export interface AdminAuditLogEntry {
  entryId: string;
  actorId: string;
  actorName: string;
  action: AdminModerationAction;
  targetType: 'COMPANION' | 'USER' | 'DISPUTE' | 'TRANSACTION' | 'FLAG';
  targetId: string;
  reason?: string;
  createdAt: string;
}

export interface AdminCompanionDetail extends AdminCompanionRow {
  introText: string;
  albumUrls: string[];
  voiceIntroUrl: string | null;
  scenarios: CompanionScenario[];
  recentReviews: CompanionReview[];
  reports: AdminCompanionReport[];
  auditLog: AdminAuditLogEntry[];
}

export interface AdminCompanionListParams {
  status?: ModerationStatus | 'ALL';
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminCompanionListResponse extends PaginatedMeta {
  rows: AdminCompanionRow[];
  /** Số lượng từng status để hiển thị badge trên filter tab */
  counts: Record<ModerationStatus, number>;
}

export interface AdminModerationActionResult {
  success: boolean;
  status: ModerationStatus;
  auditEntry: AdminAuditLogEntry;
}

// ─── USERS ─────────────────────────────────────────────────────────────────

export type AdminUserStatus = 'ACTIVE' | 'LOCKED';

export interface AdminUserRow {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: 'CLIENT' | 'COMPANION' | 'ADMIN';
  status: AdminUserStatus;
  walletBalance: number;
  totalBookings: number;
  violationCount: number;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserRow {
  recentBookings: Array<{
    bookingId: string;
    scenarioTitle: string;
    counterpartyName: string;
    status: string;
    startTime: string;
    price: number;
  }>;
  recentTransactions: Array<{
    transactionId: string;
    description: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  auditLog: AdminAuditLogEntry[];
}

export interface AdminUserListParams {
  role?: 'ALL' | 'CLIENT' | 'COMPANION' | 'ADMIN';
  status?: 'ALL' | AdminUserStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminUserListResponse extends PaginatedMeta {
  rows: AdminUserRow[];
  counts: { ACTIVE: number; LOCKED: number };
}

export type AdminUserAction = 'LOCK' | 'UNLOCK';

export interface AdminUserActionResult {
  success: boolean;
  status: AdminUserStatus;
  auditEntry: AdminAuditLogEntry;
}

// ─── TRANSACTIONS ──────────────────────────────────────────────────────────

export type AdminTransactionType = 'TOPUP' | 'BOOKING' | 'REFUND' | 'PAYOUT';
export type AdminTransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface AdminTransactionRow {
  transactionId: string;
  type: AdminTransactionType;
  status: AdminTransactionStatus;
  amount: number;
  userId: string;
  userName: string;
  description: string;
  reference: string | null;
  createdAt: string;
}

export interface AdminTransactionListParams {
  type?: 'ALL' | AdminTransactionType;
  status?: 'ALL' | AdminTransactionStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminTransactionListResponse extends PaginatedMeta {
  rows: AdminTransactionRow[];
  counts: Record<AdminTransactionStatus, number>;
  totals: {
    grossCredit: number;
    grossDebit: number;
    netFlow: number;
  };
}

// ─── DISPUTES ──────────────────────────────────────────────────────────────

export type AdminDisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
export type AdminDisputeSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type AdminDisputeOutcome = 'REFUND' | 'CHARGE' | 'DISMISS';

export interface AdminDisputeRow {
  disputeId: string;
  bookingId: string;
  clientName: string;
  companionName: string;
  reason: string;
  status: AdminDisputeStatus;
  severity: AdminDisputeSeverity;
  openedAt: string;
}

export interface AdminDisputeDetail extends AdminDisputeRow {
  description: string;
  bookingSnapshot: {
    scenarioTitle: string;
    startTime: string;
    price: number;
  };
  evidence: Array<{
    evidenceId: string;
    label: string;
    submittedBy: string;
    createdAt: string;
  }>;
  outcome: {
    type: AdminDisputeOutcome;
    note: string;
    resolvedBy: string;
    resolvedAt: string;
  } | null;
  auditLog: AdminAuditLogEntry[];
}

export interface AdminDisputeListParams {
  status?: 'ALL' | AdminDisputeStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminDisputeListResponse extends PaginatedMeta {
  rows: AdminDisputeRow[];
  counts: Record<AdminDisputeStatus, number>;
}

export interface AdminDisputeResolveResult {
  success: boolean;
  status: AdminDisputeStatus;
  outcome: AdminDisputeDetail['outcome'];
  auditEntry: AdminAuditLogEntry;
}

// ─── UPGRADE REQUESTS (Client → Companion) ────────────────────────────────

export type AdminUpgradeRequestStatus =
  | 'UPGRADE_STATUS_PENDING'
  | 'UPGRADE_STATUS_APPROVED'
  | 'UPGRADE_STATUS_REJECTED';

export interface AdminUpgradeRequest {
  id: string;
  userId: string;
  status: AdminUpgradeRequestStatus;
  reason: string;
  rejectReason: string;
  reviewedBy: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminUpgradeRequestListParams {
  page?: number;
  pageSize?: number;
}

export interface AdminUpgradeRequestListResponse extends PaginatedMeta {
  data: AdminUpgradeRequest[];
}

export interface AdminUpgradeRequestActionResult {
  message: string;
}

// ─── FEATURE FLAGS ─────────────────────────────────────────────────────────

export interface AdminFeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AdminFeatureFlagListResponse {
  flags: AdminFeatureFlag[];
}
