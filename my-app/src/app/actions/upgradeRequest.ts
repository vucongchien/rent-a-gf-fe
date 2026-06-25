'use server';

import { revalidatePath } from 'next/cache';
import { companionService } from '@/shared/services/companionService';

export type RequestUpgradeActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export async function requestCompanionUpgradeAction(
  _prev: RequestUpgradeActionState,
  formData: FormData,
): Promise<RequestUpgradeActionState> {
  const reason = String(formData.get('reason') ?? '').trim();

  if (reason.length < MIN_REASON_LENGTH) {
    return {
      status: 'error',
      message: `Vui lòng mô tả lý do tối thiểu ${MIN_REASON_LENGTH} ký tự.`,
    };
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return {
      status: 'error',
      message: `Lý do tối đa ${MAX_REASON_LENGTH} ký tự.`,
    };
  }

  try {
    await companionService.applyCompanion({ reason });
    revalidatePath('/me');
    return {
      status: 'success',
      message: 'Đã gửi yêu cầu. Admin sẽ xem xét và phản hồi qua thông báo.',
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không gửi được yêu cầu. Vui lòng thử lại.';
    return { status: 'error', message };
  }
}
