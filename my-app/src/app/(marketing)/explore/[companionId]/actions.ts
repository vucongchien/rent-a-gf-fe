'use server'
import { bookingService } from '@/shared/services/bookingService'
import type { BookingActionState } from './types'

export async function createBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const companionId = formData.get('companionId') as string
  const scenarioId = formData.get('scenarioId') as string
  const scheduledAt = formData.get('scheduledAt') as string
  const note = (formData.get('note') as string) || undefined

  if (!companionId || !scenarioId || !scheduledAt)
    return { status: 'error', message: 'Vui lòng điền đầy đủ thông tin.' }

  try {
    const result = await bookingService.createBooking({
      companionId, scenarioId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      note,
    })
    return { status: 'success', bookingId: result.id }
  } catch (err) {
    console.error('[createBookingAction] Lỗi khi tạo đặt lịch:', err)
    return { status: 'error', message: 'Đặt lịch thất bại. Vui lòng thử lại.' }
  }
}
