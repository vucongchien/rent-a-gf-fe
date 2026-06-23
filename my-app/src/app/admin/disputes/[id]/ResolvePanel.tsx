'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminDisputeOutcome, AdminDisputeStatus } from '@/shared/types';
import { resolveDisputeAction } from './actions';

interface ResolvePanelProps {
  disputeId: string;
  status: AdminDisputeStatus;
}

const OUTCOMES: { value: AdminDisputeOutcome; label: string; tone: 'pos' | 'neg' | 'neutral' }[] = [
  { value: 'REFUND', label: 'Hoàn tiền cho khách', tone: 'pos' },
  { value: 'CHARGE', label: 'Tính phí companion', tone: 'neg' },
  { value: 'DISMISS', label: 'Bỏ qua (đóng)', tone: 'neutral' },
];

export const ResolvePanel: React.FC<ResolvePanelProps> = ({ disputeId, status }) => {
  const router = useRouter();
  const [outcome, setOutcome] = useState<AdminDisputeOutcome | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status === 'RESOLVED') {
    return (
      <div className="border border-border rounded-lg bg-surface p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-2">Đã giải quyết</h3>
        <p className="text-[12px] text-text-muted leading-relaxed">
          Dispute này đã được đóng. Xem outcome chi tiết bên dưới.
        </p>
      </div>
    );
  }

  const submit = () => {
    if (!outcome) {
      setError('Vui lòng chọn kết quả');
      return;
    }
    if (note.trim().length < 5) {
      setError('Ghi chú phải ≥ 5 ký tự');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await resolveDisputeAction(disputeId, outcome, note.trim());
      if (!res.ok) {
        setError(res.error ?? 'Có lỗi xảy ra');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="border border-border rounded-lg bg-surface p-5 space-y-4">
      <h3 className="text-[13px] font-semibold text-neutral-900">Giải quyết dispute</h3>

      <div className="space-y-2">
        {OUTCOMES.map((o) => (
          <label
            key={o.value}
            className={[
              'flex items-start gap-2.5 p-3 rounded-md border cursor-pointer transition-colors',
              outcome === o.value
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-border hover:bg-neutral-50',
            ].join(' ')}
          >
            <input
              type="radio"
              name={`outcome-${disputeId}`}
              value={o.value}
              checked={outcome === o.value}
              onChange={() => setOutcome(o.value)}
              disabled={isPending}
              className="mt-0.5"
            />
            <span className="text-[13px] text-neutral-900">{o.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-[12px] text-text-muted mb-1">
          Ghi chú giải quyết <span className="text-rose-400">*</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          disabled={isPending}
          placeholder="Mô tả lý do và hành động đã thực hiện..."
          className="w-full px-3 py-2 rounded-md border border-border bg-surface text-[13px] text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
        />
      </div>

      {error && (
        <div className="text-[12px] text-rose-400 bg-sumi-100 px-3 py-2 rounded-md">{error}</div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="w-full h-10 rounded-md bg-neutral-900 text-white text-[13px] font-semibold hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? 'Đang xử lý...' : 'Đóng dispute'}
      </button>
    </div>
  );
};

export default ResolvePanel;
