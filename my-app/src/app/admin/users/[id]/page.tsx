import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { authService } from '@/shared/services/authService';
import { adminUserService } from '@/shared/services/adminUserService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { UserLockPanel } from './UserLockPanel';

const ROLE_LABEL: Record<string, string> = {
  CLIENT: 'Khách',
  COMPANION: 'Companion',
  ADMIN: 'Admin',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ACTION_LABEL: Record<string, string> = {
  LOCK_USER: 'Khóa',
  UNLOCK_USER: 'Mở khóa',
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await authService.getMe();
  const { id } = await params;
  const detail = await adminUserService.getById(id);
  if (!detail) notFound();

  return (
    <>
      {user && <AdminTopbar user={user} title="User detail" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex items-center gap-2 text-[12.5px] text-text-muted">
          <Link href="/admin/users" className="hover:text-neutral-900">
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6 min-w-0">
            <div className="border border-border rounded-lg bg-surface p-6 flex items-start gap-5">
              <Image
                src={detail.avatarUrl}
                alt={detail.displayName}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[20px] font-semibold text-neutral-900">
                    {detail.displayName}
                  </h2>
                  <span
                    className={[
                      'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold',
                      detail.status === 'ACTIVE'
                        ? 'bg-ruka-100 text-neutral-800'
                        : 'bg-sumi-100 text-neutral-800',
                    ].join(' ')}
                  >
                    {detail.status === 'ACTIVE' ? 'Active' : 'Locked'}
                  </span>
                  <span className="inline-flex items-center px-2 h-5 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-semibold">
                    {ROLE_LABEL[detail.role] ?? detail.role}
                  </span>
                </div>
                <p className="text-[12.5px] text-text-muted mt-1">{detail.email}</p>
                <p className="text-[11px] text-text-muted font-mono mt-1">
                  {detail.userId}
                </p>

                <div className="grid grid-cols-3 gap-4 mt-5">
                  <Stat label="Số dư ví" value={`${detail.walletBalance.toLocaleString('vi-VN')} coin`} />
                  <Stat label="Bookings" value={String(detail.totalBookings)} />
                  <Stat
                    label="Vi phạm"
                    value={String(detail.violationCount)}
                    tone={detail.violationCount > 0 ? 'warn' : 'neutral'}
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-4">
                  Đăng ký: {formatDateTime(detail.createdAt)}
                </p>
              </div>
            </div>

            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Bookings gần đây ({detail.recentBookings.length})
              </h3>
              {detail.recentBookings.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">
                  Chưa có booking nào trong dữ liệu mock.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {detail.recentBookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-neutral-900 truncate">
                          {b.scenarioTitle}
                        </p>
                        <p className="text-[11.5px] text-text-muted">
                          với {b.counterpartyName} · {formatDateTime(b.startTime)}
                        </p>
                      </div>
                      <span className="text-[12.5px] text-neutral-700">
                        {b.price} coin
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Audit log ({detail.auditLog.length})
              </h3>
              {detail.auditLog.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">Chưa có hành động.</p>
              ) : (
                <ol className="space-y-2.5">
                  {detail.auditLog.map((e) => (
                    <li key={e.entryId} className="flex items-start gap-3 text-[12.5px]">
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-semibold">
                        {ACTION_LABEL[e.action] ?? e.action}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-neutral-800">
                          {e.actorName}{' '}
                          <span className="text-text-muted">
                            · {formatDateTime(e.createdAt)}
                          </span>
                        </p>
                        {e.reason && <p className="text-text-muted mt-0.5">{e.reason}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-[80px] self-start space-y-4">
            <UserLockPanel userId={detail.userId} status={detail.status} />
          </aside>
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'warn';
}) {
  return (
    <div>
      <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
      <p
        className={[
          'text-[16px] font-semibold mt-0.5',
          tone === 'warn' ? 'text-rose-400' : 'text-neutral-900',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}
