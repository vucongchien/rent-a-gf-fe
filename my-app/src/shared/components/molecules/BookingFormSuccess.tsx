'use client'

import { Button } from '@/shared/components/atoms/Button'

export interface BookingFormSuccessProps {
  companionName: string
  onGoToBookings: () => void
  onContinueExplore: () => void
}

export function BookingFormSuccess(props: BookingFormSuccessProps) {
  const { companionName, onGoToBookings, onContinueExplore } = props

  return (
    <div className="text-center py-8 px-4 space-y-6">
      <div className="text-6xl">💌</div>
      <div className="space-y-2">
        <h3 className="font-serif text-2xl text-brand font-black">Đặt hẹn thành công!</h3>
        <p className="text-sm text-neutral-600 max-w-xs mx-auto">
          Yêu cầu đã được gửi đến <b>{companionName}</b>. Tiền đặt cọc tạm thời đã được giữ trong két an toàn (Escrow).
        </p>
      </div>
      <div className="space-y-2.5 pt-2">
        <Button 
          variant="primary" 
          size="md" 
          className="rounded-full w-full justify-center"
          onClick={onGoToBookings}
        >
          Đi tới xem lịch hẹn
        </Button>
        <Button 
          variant="outline" 
          size="md" 
          className="rounded-full w-full justify-center border-neutral-300 text-neutral-600"
          onClick={onContinueExplore}
        >
          Tiếp tục khám phá
        </Button>
      </div>
    </div>
  )
}
