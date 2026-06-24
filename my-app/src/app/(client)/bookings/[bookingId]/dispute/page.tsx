import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { bookingService } from '@/shared/services/bookingService';
import { authService } from '@/shared/services/authService';
import { companionService } from '@/shared/services/companionService';
import { ChevronLeftIcon } from '@/shared/components/atoms/Icons';
import { DisputeForm } from './DisputeForm';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingDisputePage({ params }: PageProps) {
  const { bookingId } = await params;

  return (
    <div className="w-full pt-6 md:pt-4 pb-12">
      <div className="max-w-[680px] mx-auto w-full px-4">
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
        >
          <ChevronLeftIcon size={16} />
          Quay lại chi tiết
        </Link>

        <Suspense fallback={<DisputePageSkeleton />}>
          <DisputeLoader bookingId={bookingId} />
        </Suspense>
      </div>
    </div>
  );
}

async function DisputeLoader({ bookingId }: { bookingId: string }) {
  const [booking, me] = await Promise.all([
    bookingService.getBookingDetail(bookingId),
    authService.getMe(),
  ]);
  if (!booking) notFound();
  if (!me) redirect('/login');

  // Chỉ user là client hoặc companion của booking mới được mở dispute.
  const isParticipant = me.userId === booking.clientId || me.userId === booking.companionId;
  if (!isParticipant) notFound();

  // Chỉ ACCEPTED hoặc COMPLETED mới được dispute (SSOT §2.6).
  if (booking.status !== 'ACCEPTED' && booking.status !== 'COMPLETED') {
    redirect(`/bookings/${bookingId}`);
  }

  // Người bị tố cáo là phía còn lại.
  const accusedId = me.userId === booking.clientId ? booking.companionId : booking.clientId;

  const companion = await companionService.getCompanionDetail(booking.companionId);
  const partnerName = companion?.displayName ?? 'Bạn đồng hành';

  return (
    <>
      <header className="flex flex-col gap-1 mb-6">
        <p className="font-sans text-[11px] font-bold tracking-wider uppercase text-neutral-400">
          Báo cáo vấn đề
        </p>
        <h1 className="font-sans font-bold text-lg sm:text-xl text-neutral-900 leading-tight">
          Cuộc hẹn với {partnerName}
        </h1>
        <p className="font-sans text-[12.5px] text-neutral-500 truncate">
          {booking.scenarioSnapshot.title}
        </p>
      </header>

      <DisputeForm bookingId={booking.bookingId} accusedId={accusedId} />
    </>
  );
}

function DisputePageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-32 bg-neutral-100 rounded mb-2" />
      <div className="h-6 w-64 bg-neutral-200 rounded mb-2" />
      <div className="h-3 w-48 bg-neutral-100 rounded mb-6" />
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-4">
        <div className="h-4 w-24 bg-neutral-200 rounded mb-3" />
        <div className="h-10 w-full bg-neutral-100 rounded" />
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-4">
        <div className="h-4 w-24 bg-neutral-200 rounded mb-3" />
        <div className="h-24 w-full bg-neutral-100 rounded" />
      </div>
    </div>
  );
}
