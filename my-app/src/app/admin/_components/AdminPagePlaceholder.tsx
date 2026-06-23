import React from 'react';
import { authService } from '@/shared/services/authService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';

interface AdminPagePlaceholderProps {
  title: string;
  sliceNumber: number;
  description: string;
}

export async function AdminPagePlaceholder({
  title,
  sliceNumber,
  description,
}: AdminPagePlaceholderProps) {
  const user = await authService.getMe();
  if (!user) return null;

  return (
    <>
      <AdminTopbar user={user} title={title} />
      <div className="flex-1 p-8">
        <div className="max-w-xl mx-auto mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mami-100 text-neutral-800 text-[11px] font-semibold tracking-wider uppercase">
            <span aria-hidden>🚧</span>
            Slice {sliceNumber}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-neutral-900">
            {title} sẽ được hoàn thiện ở slice {sliceNumber}
          </h2>
          <p className="mt-3 text-[14px] text-text-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </>
  );
}
