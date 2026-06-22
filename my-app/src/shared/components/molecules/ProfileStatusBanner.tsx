import React from 'react';
import { StatusBadge } from '@/shared/components/atoms/StatusBadge';

export type CompanionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ProfileStatusBannerProps {
  status: CompanionStatus;
  reason?: string | null;
}

const COPY: Record<
  CompanionStatus,
  { variant: 'pending' | 'approved' | 'rejected'; title: string; body: string }
> = {
  PENDING: {
    variant: 'pending',
    title: 'Hồ sơ đang chờ duyệt',
    body: 'Kịch bản của bạn chưa hiển thị công khai. Bạn vẫn có thể bổ sung thông tin.',
  },
  APPROVED: {
    variant: 'approved',
    title: 'Hồ sơ đã được duyệt',
    body: 'Hồ sơ và kịch bản của bạn đang hiển thị công khai với Client.',
  },
  REJECTED: {
    variant: 'rejected',
    title: 'Hồ sơ bị từ chối',
    body: 'Vui lòng cập nhật thông tin và gửi lại để được xét duyệt.',
  },
};

export const ProfileStatusBanner: React.FC<ProfileStatusBannerProps> = ({ status, reason }) => {
  const copy = COPY[status];
  if (!copy) return null;

  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-surface p-4 shadow-[0_2px_0_var(--color-neutral-900)]"
      data-testid="profile-status-banner"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-sans font-bold text-[15px] text-neutral-900">{copy.title}</p>
        <StatusBadge variant={copy.variant} />
      </div>
      <p className="font-sans text-[12.5px] text-neutral-600 leading-relaxed">{copy.body}</p>
      {status === 'REJECTED' && reason && (
        <p className="mt-2 font-sans text-[12px] text-rose-700 italic">Lý do: {reason}</p>
      )}
    </section>
  );
};
