'use client';

import React, { useActionState, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';
import {
  requestCompanionUpgradeAction,
  type RequestUpgradeActionState,
} from '@/app/actions/upgradeRequest';

const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;
const INITIAL_STATE: RequestUpgradeActionState = { status: 'idle' };

export const UpgradeToCompanionCard: React.FC = () => {
  const [state, formAction, isPending] = useActionState(
    requestCompanionUpgradeAction,
    INITIAL_STATE,
  );
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState('');

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <h3 className="font-sans font-bold text-[14.5px] text-emerald-800 mb-1">
          Đã gửi yêu cầu
        </h3>
        <p className="font-sans text-[12.5px] text-emerald-700 leading-snug">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <h3 className="font-sans font-bold text-[14.5px] text-neutral-900 mb-1">
        Trở thành Companion
      </h3>
      <p className="font-sans text-[12.5px] text-neutral-500 leading-snug mb-3">
        Chia sẻ thời gian cùng người khác và nhận thu nhập qua Kano-Coin. Yêu cầu sẽ được Admin xét duyệt trước khi kích hoạt.
      </p>

      {!expanded ? (
        <Button
          type="button"
          variant="unstyled"
          onClick={() => setExpanded(true)}
          className="w-full inline-flex items-center justify-center h-10 px-4 rounded-full bg-chizuru-500 hover:bg-chizuru-600 text-white font-sans font-semibold text-[13px] transition-colors cursor-pointer"
        >
          Gửi yêu cầu nâng cấp
        </Button>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="upgrade-reason"
              className="block font-sans font-semibold text-[12.5px] text-neutral-800 mb-1"
            >
              Lý do bạn muốn trở thành Companion
            </label>
            <textarea
              id="upgrade-reason"
              name="reason"
              rows={4}
              maxLength={MAX_REASON_LENGTH}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              required
              placeholder="Ví dụ: Mình muốn chia sẻ thời gian rảnh sau giờ học, có kinh nghiệm dẫn tour và giao tiếp tốt..."
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 font-sans text-[12.5px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-chizuru-400 focus:bg-white transition-colors disabled:opacity-60"
            />
            <p className="mt-1 text-right font-mono text-[11px] text-neutral-400">
              {reason.length}/{MAX_REASON_LENGTH}
            </p>
          </div>

          {state.status === 'error' && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 font-sans text-[12px] text-rose-700"
            >
              {state.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="unstyled"
              onClick={() => {
                setExpanded(false);
                setReason('');
              }}
              disabled={isPending}
              className="inline-flex items-center h-9 px-4 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[12.5px] border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="unstyled"
              disabled={isPending || reason.trim().length === 0}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-chizuru-500 hover:bg-chizuru-600 text-white font-sans font-semibold text-[12.5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending && <SpinnerIcon size={12} className="animate-spin" />}
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
