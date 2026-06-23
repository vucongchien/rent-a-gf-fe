'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ModerationStatus } from '@/shared/types';
import {
  approveCompanionAction,
  rejectCompanionAction,
  suspendCompanionAction,
} from './actions';

interface ModerationPanelProps {
  companionId: string;
  status: ModerationStatus;
}

type Mode = null | 'APPROVE' | 'REJECT' | 'SUSPEND';

const MODE_CONFIG: Record<
  Exclude<Mode, null>,
  { title: string; reasonRequired: boolean; confirmLabel: string; tone: 'pos' | 'neg' }
> = {
  APPROVE: {
    title: 'Duyệt hồ sơ',
    reasonRequired: false,
    confirmLabel: 'Duyệt',
    tone: 'pos',
  },
  REJECT: {
    title: 'Từ chối hồ sơ',
    reasonRequired: true,
    confirmLabel: 'Từ chối',
    tone: 'neg',
  },
  SUSPEND: {
    title: 'Khóa tài khoản',
    reasonRequired: true,
    confirmLabel: 'Khóa',
    tone: 'neg',
  },
};

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  companionId,
  status,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canApprove = status === 'PENDING';
  const canReject = status === 'PENDING';
  const canSuspend = status === 'APPROVED';

  const close = () => {
    setMode(null);
    setReason('');
    setError(null);
  };

  const handleConfirm = () => {
    if (!mode) return;
    const cfg = MODE_CONFIG[mode];
    if (cfg.reasonRequired && reason.trim().length < 3) {
      setError('Vui lòng nhập lý do (≥ 3 ký tự)');
      return;
    }
    setError(null);
    startTransition(async () => {
      const action =
        mode === 'APPROVE'
          ? approveCompanionAction(companionId, reason.trim() || undefined)
          : mode === 'REJECT'
          ? rejectCompanionAction(companionId, reason.trim())
          : suspendCompanionAction(companionId, reason.trim());
      const res = await action;
      if (!res.ok) {
        setError(res.error ?? 'Có lỗi xảy ra');
        return;
      }
      close();
      router.refresh();
    });
  };

  return (
    <div className="border border-border rounded-lg bg-surface p-5">
      <h3 className="text-[13px] font-semibold text-neutral-900 mb-4">
        Hành động moderation
      </h3>

      {!mode && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!canApprove}
            onClick={() => setMode('APPROVE')}
            className="h-10 rounded-md bg-ruka-500 text-neutral-900 text-[13px] font-semibold hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ✓ Duyệt hồ sơ
          </button>
          <button
            type="button"
            disabled={!canReject}
            onClick={() => setMode('REJECT')}
            className="h-10 rounded-md bg-sumi-100 text-neutral-900 text-[13px] font-semibold hover:bg-sumi-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ✗ Từ chối
          </button>
          <button
            type="button"
            disabled={!canSuspend}
            onClick={() => setMode('SUSPEND')}
            className="h-10 rounded-md border border-border bg-surface text-neutral-700 text-[13px] font-semibold hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ⛔ Khóa tài khoản
          </button>

          <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
            • Duyệt/Từ chối: chỉ khả dụng khi hồ sơ <strong>PENDING</strong>.<br />
            • Khóa: chỉ khả dụng khi hồ sơ đã <strong>APPROVED</strong>.
          </p>
        </div>
      )}

      {mode && (
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-neutral-900">
            {MODE_CONFIG[mode].title}
          </p>

          <label className="block text-[12px] text-text-muted">
            Lý do{' '}
            {MODE_CONFIG[mode].reasonRequired ? (
              <span className="text-rose-400">*</span>
            ) : (
              <span>(tùy chọn)</span>
            )}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isPending}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-[13px] text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
            placeholder="Nhập lý do để ghi audit log..."
          />

          {error && (
            <div className="text-[12px] text-rose-400 bg-sumi-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className="flex-1 h-9 rounded-md border border-border text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className={[
                'flex-1 h-9 rounded-md text-[13px] font-semibold transition disabled:opacity-50',
                MODE_CONFIG[mode].tone === 'pos'
                  ? 'bg-ruka-500 text-neutral-900 hover:brightness-95'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800',
              ].join(' ')}
            >
              {isPending ? 'Đang xử lý...' : MODE_CONFIG[mode].confirmLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
