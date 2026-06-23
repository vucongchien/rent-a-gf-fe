import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { bookingService } from '@/shared/services/bookingService';
import { companionService } from '@/shared/services/companionService';
import { ChevronLeftIcon } from '@/shared/components/atoms/Icons';
import { ReviewForm } from './ReviewForm';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingReviewPage({ params }: PageProps) {
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

        <Suspense fallback={<ReviewPageSkeleton />}>
          <ReviewPageLoader bookingId={bookingId} />
        </Suspense>
      </div>
    </div>
  );
}

async function ReviewPageLoader({ bookingId }: { bookingId: string }) {
  const booking = await bookingService.getBookingDetail(bookingId);
  if (!booking) notFound();

  if (booking.status !== 'COMPLETED' || booking.hasReviewed) {
    redirect(`/bookings/${bookingId}`);
  }

  const companion = await companionService.getCompanionDetail(booking.companionId);
  const partnerName = companion?.displayName ?? 'Bạn đồng hành';
  const partnerAvatar = companion?.avatarUrl;

  return (
    <>
      <header className="flex items-center gap-4 mb-6">
        <div className="relative w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {partnerAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chizuru-50 text-chizuru-500 font-sans font-bold text-xl">
              {partnerName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="font-sans text-[11px] font-bold tracking-wider uppercase text-neutral-400">
            Đánh giá cuộc hẹn cùng
          </p>
          <h1 className="font-sans font-bold text-lg sm:text-xl text-neutral-900 leading-tight">
            {partnerName}
          </h1>
          <p className="font-sans text-[12.5px] text-neutral-500 truncate">
            {booking.scenarioSnapshot.title}
          </p>
        </div>
      </header>

      <ReviewForm bookingId={booking.bookingId} companionId={booking.companionId} />
    </>
  );
}

function ReviewPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <header className="flex items-center gap-4 mb-6">
        <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full bg-neutral-100 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-32 bg-neutral-100 rounded" />
          <div className="h-5 w-48 bg-neutral-200 rounded" />
          <div className="h-3 w-56 bg-neutral-100 rounded" />
        </div>
      </header>

      {/* Form section 1 skeleton */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="h-5 w-44 bg-neutral-200 rounded mx-auto mb-2" />
        <div className="h-3.5 w-64 bg-neutral-100 rounded mx-auto mb-5" />
        <div className="h-10 w-48 bg-neutral-100 rounded mx-auto" />
      </div>

      {/* Form section 2 skeleton */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
        <div className="h-3.5 w-72 bg-neutral-100 rounded mb-3" />
        <div className="h-28 bg-neutral-50 rounded-xl w-full" />
      </div>

      {/* Info card skeleton */}
      <div className="h-11 bg-amber-50/50 border border-amber-100 rounded-xl w-full mb-6" />

      {/* Action buttons skeleton */}
      <div className="flex justify-end gap-2.5">
        <div className="h-11 w-24 bg-neutral-100 rounded-full" />
        <div className="h-11 w-32 bg-neutral-200 rounded-full" />
      </div>
    </div>
  );
}
