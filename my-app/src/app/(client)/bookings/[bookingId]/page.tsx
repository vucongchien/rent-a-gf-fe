import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bookingService } from '@/shared/services/bookingService';
import { companionService } from '@/shared/services/companionService';
import type { BookingDetail, BookingStatus } from '@/shared/types';
import {
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  CoinIcon,
  CalendarIcon,
} from '@/shared/components/atoms/Icons';
import { BookingDetailActions } from './BookingDetailActions';

interface PageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ reviewed?: string }>;
}

export default async function BookingDetailPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params;
  const { reviewed } = await searchParams;

  return (
    <div className="w-full pt-20 md:pt-4 pb-12">
      <div className="max-w-[680px] mx-auto w-full px-4">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
        >
          <ChevronLeftIcon size={16} />
          Quay lại danh sách
        </Link>

        {reviewed === '1' && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="font-sans text-[13px] text-emerald-800">
              Cảm ơn bạn đã gửi đánh giá! Cảm nhận của bạn đã được ghi lại.
            </p>
          </div>
        )}

        <Suspense fallback={<BookingDetailSkeleton />}>
          <BookingDetailLoader bookingId={bookingId} />
        </Suspense>
      </div>
    </div>
  );
}

async function BookingDetailLoader({ bookingId }: { bookingId: string }) {
  const booking = await bookingService.getBookingDetail(bookingId);
  if (!booking) notFound();

  // Fetch companion song song để hiển thị avatar + tên (BookingDetail không có)
  const companion = await companionService.getCompanionDetail(booking.companionId);

  return <BookingDetailView booking={booking} companion={companion} />;
}

interface BookingDetailViewProps {
  booking: BookingDetail;
  companion: Awaited<ReturnType<typeof companionService.getCompanionDetail>>;
}

function BookingDetailView({ booking, companion }: BookingDetailViewProps) {
  const partnerName = companion?.displayName ?? 'Bạn đồng hành';
  const partnerAvatar = companion?.avatarUrl;
  const status = getStatusConfig(booking.status);

  return (
    <article className="flex flex-col gap-5">
      {/* Header: avatar + name + status */}
      <header className="flex items-center gap-4">
        <div className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] flex-shrink-0 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {partnerAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-sans font-bold text-2xl">
              {partnerName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {companion ? (
            <Link
              href={`/explore/${companion.companionId}`}
              className="font-sans font-bold text-lg sm:text-xl text-neutral-900 leading-tight hover:text-chizuru-600 transition-colors w-fit"
            >
              {partnerName}
            </Link>
          ) : (
            <span className="font-sans font-bold text-lg sm:text-xl text-neutral-900 leading-tight">
              {partnerName}
            </span>
          )}
          <span className={`inline-flex w-fit items-center font-sans font-bold text-[11px] tracking-wider px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </header>

      {/* Scenario card */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <p className="font-sans text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1.5">
          Kịch bản
        </p>
        <h2 className="font-sans font-bold text-base sm:text-lg text-neutral-900 mb-4">
          {booking.scenarioSnapshot.title}
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <MetaRow icon={<MapPinIcon size={16} className="text-chizuru-500" />} label="Địa điểm">
            {booking.scenarioSnapshot.publicPlace}
          </MetaRow>
          <MetaRow icon={<ClockIcon size={16} className="text-mami-500" />} label="Thời lượng">
            {booking.scenarioSnapshot.durationMinutes} phút
          </MetaRow>
          <MetaRow icon={<CalendarIcon size={16} className="text-ruka-500" />} label="Bắt đầu">
            {formatDateTimeVN(booking.startTime)}
          </MetaRow>
          <MetaRow icon={<CalendarIcon size={16} className="text-ruka-500" />} label="Kết thúc">
            {formatDateTimeVN(booking.endTime)}
          </MetaRow>
          <MetaRow icon={<CoinIcon size={16} className="text-amber-500" />} label="Giá trị">
            <span className="font-semibold text-neutral-800">
              {booking.scenarioSnapshot.price.toLocaleString('vi-VN')} Kano-Coin
            </span>
          </MetaRow>
        </dl>
      </section>

      {/* Actions */}
      <section>
        <BookingDetailActions
          bookingId={booking.bookingId}
          status={booking.status}
          chatRoomId={booking.chatRoomId}
          hasReviewed={booking.hasReviewed}
        />
      </section>

      {/* Footer meta: chatRoomStatus + id */}
      <footer className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-2">
        <span>ID: {booking.bookingId}</span>
        {booking.chatRoomStatus === 'INACTIVE' && (
          <span className="text-neutral-500">Phòng chat đã đóng</span>
        )}
      </footer>
    </article>
  );
}

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-none">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <dt className="font-sans text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</dt>
        <dd className="font-sans text-[13.5px] text-neutral-700 break-words">{children}</dd>
      </div>
    </div>
  );
}

function getStatusConfig(status: BookingStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ duyệt', bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'ACCEPTED':
      return { label: 'Đã xác nhận', bg: 'bg-emerald-100', text: 'text-emerald-800' };
    case 'COMPLETED':
      return { label: 'Hoàn thành', bg: 'bg-neutral-200', text: 'text-neutral-700' };
    case 'CANCELLED':
      return { label: 'Đã hủy', bg: 'bg-rose-100', text: 'text-rose-700' };
    case 'REJECTED':
      return { label: 'Bị từ chối', bg: 'bg-rose-100', text: 'text-rose-700' };
    case 'DISPUTED':
      return { label: 'Tranh chấp', bg: 'bg-orange-100', text: 'text-orange-800' };
    default:
      return { label: status, bg: 'bg-neutral-100', text: 'text-neutral-700' };
  }
}

function formatDateTimeVN(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${time} · ${date}`;
}

function BookingDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-full bg-neutral-100 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-5 w-40 bg-neutral-200 rounded-md" />
          <div className="h-4 w-20 bg-neutral-100 rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="h-3 w-20 bg-neutral-100 rounded mb-2" />
        <div className="h-5 w-56 bg-neutral-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 bg-neutral-100 rounded" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-neutral-100 rounded mb-1" />
                <div className="h-4 w-32 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="h-11 w-32 bg-neutral-200 rounded-full" />
        <div className="h-11 w-32 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}
