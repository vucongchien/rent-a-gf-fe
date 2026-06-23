import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { authService } from '@/shared/services/authService';
import { adminCompanionService } from '@/shared/services/adminCompanionService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { AdminStatusPill } from '@/shared/components/admin/AdminStatusPill';
import { ModerationPanel } from './ModerationPanel';

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
  APPROVE: 'Duyệt',
  REJECT: 'Từ chối',
  SUSPEND: 'Khóa',
};

export default async function AdminCompanionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await authService.getMe();
  const { id } = await params;
  const detail = await adminCompanionService.getById(id);
  if (!detail) notFound();

  return (
    <>
      {user && <AdminTopbar user={user} title="Companion detail" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex items-center gap-2 text-[12.5px] text-text-muted">
          <Link href="/admin/companions" className="hover:text-neutral-900">
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ─── Cột trái: hồ sơ ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {/* Header card */}
            <div className="border border-border rounded-lg bg-surface p-6 flex items-start gap-5">
              <Image
                src={detail.avatarUrl}
                alt={detail.displayName}
                width={88}
                height={88}
                className="rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[20px] font-semibold text-neutral-900">
                    {detail.displayName}
                  </h2>
                  <AdminStatusPill status={detail.status} />
                </div>
                <p className="text-[12px] text-text-muted font-mono mt-1">
                  {detail.companionId}
                </p>
                <p className="text-[13.5px] text-neutral-700 mt-3 leading-relaxed">
                  {detail.biography || (
                    <span className="text-text-muted italic">Chưa có biography</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-4 text-[12.5px]">
                  <span className="text-neutral-700">
                    🌆 {detail.availableCities.join(', ')}
                  </span>
                  <span className="text-neutral-700">
                    ⭐ {detail.averageRating.toFixed(1)} ({detail.totalReviews} đánh giá)
                  </span>
                  <span className="text-text-muted">
                    Nộp đơn: {formatDateTime(detail.submittedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Album */}
            {detail.albumUrls.length > 0 && (
              <section className="border border-border rounded-lg bg-surface p-5">
                <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                  Album ({detail.albumUrls.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {detail.albumUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden bg-neutral-100"
                    >
                      <Image
                        src={url}
                        alt={`album-${i}`}
                        fill
                        sizes="(max-width: 640px) 33vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Scenarios */}
            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Scenarios ({detail.scenarios.length})
              </h3>
              {detail.scenarios.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">Chưa có scenario nào.</p>
              ) : (
                <div className="divide-y divide-border">
                  {detail.scenarios.map((s) => (
                    <div
                      key={s.scenarioId}
                      className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-neutral-900">
                          {s.title}
                        </p>
                        <p className="text-[12.5px] text-text-muted mt-0.5">
                          {s.description}
                        </p>
                        <p className="text-[11.5px] text-text-muted mt-1">
                          📍 {s.publicPlace} · ⏱ {s.durationMinutes} phút
                        </p>
                      </div>
                      <span className="text-[13px] font-semibold text-neutral-900 shrink-0">
                        {s.price} coin
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reports */}
            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Báo cáo ({detail.reports.length})
              </h3>
              {detail.reports.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">Không có báo cáo nào.</p>
              ) : (
                <div className="space-y-3">
                  {detail.reports.map((r) => (
                    <div
                      key={r.reportId}
                      className="bg-sumi-100 rounded-md p-3 text-[12.5px]"
                    >
                      <p className="text-neutral-800">{r.reason}</p>
                      <p className="text-text-muted text-[11.5px] mt-1">
                        Bởi {r.reporterName} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Audit log */}
            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Audit log ({detail.auditLog.length})
              </h3>
              {detail.auditLog.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">
                  Chưa có hành động nào được ghi nhận.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {detail.auditLog.map((e) => (
                    <li
                      key={e.entryId}
                      className="flex items-start gap-3 text-[12.5px]"
                    >
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
                        {e.reason && (
                          <p className="text-text-muted mt-0.5">{e.reason}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* ─── Cột phải: panel moderation ─────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[80px] self-start space-y-4">
            <ModerationPanel
              companionId={detail.companionId}
              status={detail.status}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
