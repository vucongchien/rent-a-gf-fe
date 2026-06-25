import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { authService } from '@/shared/services/authService';
import { adminDisputeService } from '@/shared/services/adminDisputeService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { ResolvePanel } from './ResolvePanel';
import type { AdminDisputeOutcome, AdminDisputeSeverity, AdminDisputeStatus } from '@/shared/types';

const STATUS_CONFIG: Record<AdminDisputeStatus, { label: string; bg: string }> = {
  OPEN: { label: 'Mở', bg: 'bg-sumi-100' },
  INVESTIGATING: { label: 'Đang xử lý', bg: 'bg-mami-100' },
  RESOLVED: { label: 'Đã giải quyết', bg: 'bg-ruka-100' },
};

const SEVERITY_LABEL: Record<AdminDisputeSeverity, string> = {
  HIGH: 'Mức cao',
  MEDIUM: 'Mức trung bình',
  LOW: 'Mức thấp',
};

const OUTCOME_LABEL: Record<AdminDisputeOutcome, string> = {
  REFUND: 'Hoàn tiền cho khách',
  CHARGE: 'Tính phí companion',
  DISMISS: 'Bỏ qua (đóng)',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Chưa có dữ liệu';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await authService.getMe();
  const { id } = await params;
  const detail = await adminDisputeService.getById(id);
  if (!detail) notFound();

  const statusCfg = STATUS_CONFIG[detail.status];

  return (
    <>
      {user && <AdminTopbar user={user} title="Dispute detail" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="flex items-center gap-2 text-[12.5px] text-text-muted">
          <Link href="/admin/disputes" className="hover:text-neutral-900">
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6 min-w-0">
            <div className="border border-border rounded-lg bg-surface p-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-[12.5px] text-text-muted">{detail.disputeId}</span>
                <span
                  className={[
                    'inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold text-neutral-800',
                    statusCfg.bg,
                  ].join(' ')}
                >
                  {statusCfg.label}
                </span>
                <span className="inline-flex items-center px-2 h-5 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-semibold">
                  {SEVERITY_LABEL[detail.severity]}
                </span>
              </div>
              <h2 className="text-[18px] font-semibold text-neutral-900 mt-3">
                {detail.reason}
              </h2>
              <p className="text-[13px] text-neutral-700 mt-3 leading-relaxed">
                {detail.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
                <Info label="Khách" value={detail.clientName} />
                <Info label="Companion" value={detail.companionName} />
                <Info label="Booking" value={detail.bookingId} mono />
                <Info label="Mở lúc" value={formatDateTime(detail.openedAt)} />
              </div>
            </div>

            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Booking liên quan
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Info label="Scenario" value={detail.bookingSnapshot.scenarioTitle} />
                <Info label="Thời gian" value={formatDateTime(detail.bookingSnapshot.startTime)} />
                <Info label="Giá" value={`${detail.bookingSnapshot.price} coin`} />
              </div>
            </section>

            <section className="border border-border rounded-lg bg-surface p-5">
              <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
                Bằng chứng ({detail.evidence.length})
              </h3>
              {detail.evidence.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">Chưa có bằng chứng được nộp.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.evidence.map((e) => (
                    <li
                      key={e.evidenceId}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-md text-[12.5px]"
                    >
                      <span className="text-neutral-800">{e.label}</span>
                      <span className="text-text-muted">
                        {e.submittedBy} · {formatDateTime(e.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {detail.outcome && (
              <section className="border border-border rounded-lg bg-ruka-50 p-5">
                <h3 className="text-[13px] font-semibold text-neutral-900 mb-2">
                  Kết quả: {OUTCOME_LABEL[detail.outcome.type]}
                </h3>
                <p className="text-[13px] text-neutral-800 leading-relaxed">{detail.outcome.note}</p>
                <p className="text-[11.5px] text-text-muted mt-2">
                  Bởi {detail.outcome.resolvedBy} · {formatDateTime(detail.outcome.resolvedAt)}
                </p>
              </section>
            )}

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
                        {e.action.replace('_', ' ')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-neutral-800">
                          {e.actorName}{' '}
                          <span className="text-text-muted">· {formatDateTime(e.createdAt)}</span>
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
            <ResolvePanel disputeId={detail.disputeId} status={detail.status} />
          </aside>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
      <p
        className={[
          'text-[13px] text-neutral-900 mt-0.5',
          mono ? 'font-mono' : '',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}
