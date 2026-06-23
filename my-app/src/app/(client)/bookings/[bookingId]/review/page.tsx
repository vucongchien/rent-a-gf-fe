import React from 'react';
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

  const booking = await bookingService.getBookingDetail(bookingId);
  if (!booking) notFound();

  if (booking.status !== 'COMPLETED' || booking.hasReviewed) {
    redirect(`/bookings/${bookingId}`);
  }

  const companion = await companionService.getCompanionDetail(booking.companionId);
  const partnerName = companion?.displayName ?? 'Bạn đồng hành';
  const partnerAvatar = companion?.avatarUrl;

  return (
    <div className="w-full pt-20 md:pt-4 pb-12">
      <div className="max-w-[680px] mx-auto w-full px-4">
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
        >
          <ChevronLeftIcon size={16} />
          Quay lại chi tiết
        </Link>

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
      </div>
    </div>
  );
}
