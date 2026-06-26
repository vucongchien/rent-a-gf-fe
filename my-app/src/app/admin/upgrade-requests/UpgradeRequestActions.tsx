'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/atoms/Button';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';
import { useToast } from '@/shared/components/atoms/ToastNotification';
import {
  approveUpgradeRequestAction,
  rejectUpgradeRequestAction,
} from '@/app/actions/adminUpgradeRequest';

interface UpgradeRequestActionsProps {
  id: string;
}

export const UpgradeRequestActions: React.FC<UpgradeRequestActionsProps> = ({ id }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApproving, startApprove] = useTransition();
  const [isRejecting, startReject] = useTransition();

  const handleApprove = () => {
    setErrorMsg(null);
    startApprove(async () => {
      const result = await approveUpgradeRequestAction(id);
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      toast({ message: 'Đã duyệt yêu cầu.' });
      router.refresh();
    });
  };

  const handleReject = () => {
    setErrorMsg(null);
    if (reason.trim().length < 3) {
      setErrorMsg('Lý do phải ≥ 3 ký tự.');
      return;
    }
    startReject(async () => {
      const result = await rejectUpgradeRequestAction(id, reason.trim());
      if (result.status === 'error') {
        setErrorMsg(result.message);
        return;
      }
      toast({ message: 'Đã từ chối yêu cầu.' });
      setRejecting(false);
      setReason('');
      router.refresh();
    });
  };

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          aria-label="Lý do từ chối"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isRejecting}
          placeholder="Nhập lý do từ chối..."
          className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-[12px] text-neutral-800 focus:outline-none focus:border-rose-400 disabled:opacity-60"
        />
        {errorMsg && (
          <p role="alert" className="text-[11px] text-rose-600">
            {errorMsg}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="unstyled"
            onClick={() => {
              setRejecting(false);
              setErrorMsg(null);
              setReason('');
            }}
            disabled={isRejecting}
            className="h-7 px-2.5 rounded-md bg-white text-neutral-700 text-[11px] font-semibold border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer"
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="unstyled"
            onClick={handleReject}
            disabled={isRejecting}
            className="h-7 px-2.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1 disabled:opacity-60 cursor-pointer"
          >
            {isRejecting && <SpinnerIcon size={10} className="animate-spin" />}
            Xác nhận
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="unstyled"
        onClick={handleApprove}
        disabled={isApproving}
        className="h-7 px-2.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 disabled:opacity-60 cursor-pointer"
      >
        {isApproving && <SpinnerIcon size={10} className="animate-spin" />}
        Duyệt
      </Button>
      <Button
        type="button"
        variant="unstyled"
        onClick={() => {
          setRejecting(true);
          setErrorMsg(null);
        }}
        disabled={isApproving}
        className="h-7 px-2.5 rounded-md bg-white text-rose-600 text-[11px] font-semibold border border-rose-200 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
      >
        Từ chối
      </Button>
      {errorMsg && (
        <span role="alert" className="text-[11px] text-rose-600 ml-1">
          {errorMsg}
        </span>
      )}
    </div>
  );
};
