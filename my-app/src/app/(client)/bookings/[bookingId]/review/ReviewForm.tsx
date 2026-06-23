'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StarRating } from '@/shared/components/atoms/StarRating';
import { SpinnerIcon } from '@/shared/components/atoms/Icons';
import { submitReviewAction, type SubmitReviewActionState } from './actions';

interface ReviewFormProps {
  bookingId: string;
  companionId: string;
}

const MAX_COMMENT_LENGTH = 500;
const INITIAL_STATE: SubmitReviewActionState = { status: 'idle' };

export const ReviewForm: React.FC<ReviewFormProps> = ({ bookingId, companionId }) => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitReviewAction, INITIAL_STATE);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (state.status === 'success') {
      router.replace(`/bookings/${bookingId}?reviewed=1`);
      router.refresh();
    }
  }, [state, router, bookingId]);

  const canSubmit = rating >= 1 && rating <= 5 && !isPending && state.status !== 'success';

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="companionId" value={companionId} />
      <input type="hidden" name="rating" value={rating} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <h2 className="font-sans font-bold text-base text-neutral-900 mb-1 text-center">
          Trải nghiệm cuộc hẹn ra sao?
        </h2>
        <p className="font-sans text-[12.5px] text-neutral-500 mb-5 text-center">
          Đánh giá của bạn giúp người khác chọn đúng bạn đồng hành.
        </p>

        <StarRating value={rating} onChange={setRating} disabled={isPending} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <label htmlFor="review-comment" className="block font-sans font-semibold text-[13.5px] text-neutral-800 mb-1">
          Chia sẻ thêm <span className="text-neutral-400 font-normal">(tùy chọn)</span>
        </label>
        <p className="font-sans text-[12px] text-neutral-500 mb-3">
          Kể về điều bạn ấn tượng nhất hoặc góp ý để bạn đồng hành làm tốt hơn.
        </p>
        <textarea
          id="review-comment"
          name="comment"
          rows={5}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending}
          placeholder="Ví dụ: Bạn rất biết lắng nghe và đúng giờ..."
          className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 font-sans text-[13.5px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-chizuru-400 focus:bg-white transition-colors disabled:opacity-60"
        />
        <p className="mt-1.5 text-right font-mono text-[11px] text-neutral-400">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </p>
      </section>

      <div className="rounded-xl bg-amber-50/70 border border-amber-200 px-4 py-3">
        <p className="font-sans text-[12.5px] text-amber-800 leading-snug">
          ⚠ Mỗi cuộc hẹn chỉ đánh giá được <strong>1 lần</strong> và không thể chỉnh sửa sau khi gửi.
        </p>
      </div>

      {state.status === 'error' && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 font-sans text-[13px] text-rose-700"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5">
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center h-11 px-5 rounded-full bg-white text-neutral-700 font-sans font-semibold text-[13.5px] border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          Để sau
        </Link>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-chizuru-500 hover:bg-chizuru-600 text-white font-sans font-semibold text-[13.5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending && <SpinnerIcon size={14} className="animate-spin" />}
          Gửi đánh giá
        </button>
      </div>
    </form>
  );
};
