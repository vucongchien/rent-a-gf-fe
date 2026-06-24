'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { bookingService } from '@/shared/services/bookingService';
import { CACHE_TAGS } from '@/shared/lib/cacheTags';
import { getCurrentUserId } from '@/shared/lib/userContext';
import type { CreateReviewResponse } from '@/shared/types';

export type SubmitReviewActionState =
  | { status: 'idle' }
  | { status: 'success'; data: CreateReviewResponse }
  | { status: 'error'; message: string };

const MAX_COMMENT_LENGTH = 500;

export async function submitReviewAction(
  _prev: SubmitReviewActionState,
  formData: FormData,
): Promise<SubmitReviewActionState> {
  const bookingId = String(formData.get('bookingId') ?? '').trim();
  const companionId = String(formData.get('companionId') ?? '').trim();
  const rating = Number(formData.get('rating'));
  const comment = String(formData.get('comment') ?? '').trim();

  if (!bookingId) return { status: 'error', message: 'Thiếu mã booking.' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: 'error', message: 'Vui lòng chọn số sao từ 1 đến 5.' };
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    return { status: 'error', message: `Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự.` };
  }

  try {
    const clientId = (await getCurrentUserId()) ?? '';
    const data = await bookingService.submitReview({
      bookingId,
      clientId,
      companionId,
      rating,
      comment,
    });

    if (companionId) {
      revalidateTag(CACHE_TAGS.companion(companionId), { expire: 0 });
    }
    revalidatePath('/bookings');
    revalidatePath(`/bookings/${bookingId}`);

    return { status: 'success', data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không gửi được đánh giá. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
