import React from 'react';
import type { ModerationStatus } from '@/shared/types';

interface AdminStatusPillProps {
  status: ModerationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ModerationStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    bg: 'bg-mami-100',
    text: 'text-neutral-800',
  },
  APPROVED: {
    label: 'Đã duyệt',
    bg: 'bg-ruka-100',
    text: 'text-neutral-800',
  },
  REJECTED: {
    label: 'Từ chối',
    bg: 'bg-sumi-100',
    text: 'text-neutral-800',
  },
  SUSPENDED: {
    label: 'Bị khóa',
    bg: 'bg-neutral-200',
    text: 'text-neutral-700',
  },
};

export const AdminStatusPill: React.FC<AdminStatusPillProps> = ({
  status,
  className = '',
}) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={[
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide',
        cfg.bg,
        cfg.text,
        className,
      ].join(' ')}
    >
      {cfg.label}
    </span>
  );
};

export default AdminStatusPill;
