/**
 * dispute.ts — Types cho Dispute domain (Client-side khiếu nại).
 * SSOT: docs/api_draft.md §2.6 Dispute & Report Service.
 */

export type DisputeStatus = 'OPEN' | 'RESOLVING' | 'RESOLVED';

export type DisputeEvidenceType = 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO';

export interface DisputeEvidence {
  evidenceId?: string;
  evidenceType: DisputeEvidenceType;
  /** URL của file (IMAGE/VIDEO/AUDIO) hoặc nội dung mô tả (TEXT). */
  content: string;
}

/** Request body khi Client tạo dispute. */
export interface CreateDisputeBody {
  bookingId: string;
  accusedId: string;
  reason: string;
  evidences: DisputeEvidence[];
}

/** Response khi tạo dispute thành công (SSOT). */
export interface CreateDisputeResponse {
  disputeId: string;
}

/** Chi tiết dispute (SSOT GET /disputes/{id}). */
export interface Dispute {
  disputeId: string;
  bookingId: string;
  reporterId: string;
  accusedId: string;
  reason: string;
  status: DisputeStatus;
  adminId: string | null;
  resolution: string | null;
  notes: string | null;
  version: number;
  evidences: DisputeEvidence[];
}
