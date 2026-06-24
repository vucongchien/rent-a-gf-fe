'use server';

import { revalidatePath } from 'next/cache';
import { disputeService } from '@/shared/services/disputeService';
import type { CreateDisputeBody, CreateDisputeResponse } from '@/shared/types';

export type CreateDisputeActionState =
  | { status: 'success'; data: CreateDisputeResponse }
  | { status: 'error'; message: string };

/**
 * Tạo khiếu nại từ Client/Companion sau khi đã có evidences. Sau mutation,
 * revalidate trang bookings vì booking bị flagged DISPUTED có thể đổi UI.
 */
export async function createDisputeAction(
  body: CreateDisputeBody,
): Promise<CreateDisputeActionState> {
  try {
    if (!body.bookingId || !body.accusedId || !body.reason) {
      return { status: 'error', message: 'Thiếu thông tin bắt buộc cho khiếu nại.' };
    }
    const data = await disputeService.createDispute(body);
    revalidatePath('/bookings');
    revalidatePath(`/bookings/${body.bookingId}`);
    return { status: 'success', data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể gửi khiếu nại. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
