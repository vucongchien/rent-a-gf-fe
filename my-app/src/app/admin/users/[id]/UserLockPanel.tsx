'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUserStatus } from '@/shared/types';
import { lockUserAction, unlockUserAction } from './actions';

interface UserLockPanelProps {
  userId: string;
  status: AdminUserStatus;
}

export const UserLockPanel: React.FC<UserLockPanelProps> = ({ userId, status }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isLocked = status === 'LOCKED';
  const action = isLocked ? 'unlock' : 'lock';

  const submit = () => {
    if (!isLocked && reason.trim().length < 3) {
      setError('Vui lòng nhập lý do khóa (≥ 3 ký tự)');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = isLocked
        ? await unlockUserAction(userId, reason.trim() || undefined)
        : await lockUserAction(userId, reason.trim());
      if (!res.ok) {
        setError(res.error ?? 'Có lỗi xảy ra');
        return;
      }
      setOpen(false);
      setReason('');
      router.refresh();
    });
  };

  return (
    <div className="border border-border rounded-lg bg-surface p-5">
      <h3 className="text-[13px] font-semibold text-neutral-900 mb-4">Quản lý tài khoản</h3>

      {!open && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={[
              'w-full h-10 rounded-md text-[13px] font-semibold transition',
              isLocked
                ? 'bg-ruka-500 text-neutral-900 hover:brightness-95'
                : 'bg-neutral-900 text-white hover:bg-neutral-800',
            ].join(' ')}
          >
            {isLocked ? '🔓 Mở khóa tài khoản' : '🔒 Khóa tài khoản'}
          </button>
          <p className="text-[11px] text-text-muted leading-relaxed">
            {isLocked
              ? 'User đang bị khóa và không thể đăng nhập. Mở khóa sẽ cho phép truy cập trở lại.'
              : 'Khóa sẽ ngay lập tức chặn user đăng nhập và sử dụng dịch vụ.'}
          </p>
        </div>
      )}

      {open && (
        <div className="space-y-3">
          <label className="block text-[12px] text-text-muted">
            Lý do {!isLocked && <span className="text-rose-400">*</span>}
            {isLocked && <span>(tùy chọn)</span>}
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setReason('');
                setError(null);
              }}
              disabled={isPending}
              className="flex-1 h-9 rounded-md border border-border text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className={[
                'flex-1 h-9 rounded-md text-[13px] font-semibold disabled:opacity-50',
                isLocked
                  ? 'bg-ruka-500 text-neutral-900 hover:brightness-95'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800',
              ].join(' ')}
            >
              {isPending ? 'Đang xử lý...' : isLocked ? 'Mở khóa' : 'Khóa'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLockPanel;
