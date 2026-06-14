'use client'

import { ClockIcon, CoinIcon } from '@/shared/components/atoms/Icons'
import { Button } from '@/shared/components/atoms/Button'

export interface BookingFormStep1Props {
  scenarioName: string
  durationMinutes: number
  priceInCoin: number
  scheduledAt: string
  onChangeScheduledAt: (val: string) => void
  note: string
  onChangeNote: (val: string) => void
  minDatetimeLocal: string
  onNextStep: () => void
  isPending: boolean
}

export function BookingFormStep1(props: BookingFormStep1Props) {
  const {
    scenarioName,
    durationMinutes,
    priceInCoin,
    scheduledAt,
    onChangeScheduledAt,
    note,
    onChangeNote,
    minDatetimeLocal,
    onNextStep,
    isPending,
  } = props

  return (
    <div className="space-y-5">
      {/* STEP 1: ĐIỀN THÔNG TIN LỊCH HẸN */}
      <div className="bg-white/60 rounded-2xl p-4 space-y-2 text-sm border border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Kịch bản:</span>
          <span className="font-bold text-neutral-800">{scenarioName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Thời lượng:</span>
          <span className="font-bold text-neutral-800 flex items-center gap-1">
            <ClockIcon size={13} /> {durationMinutes} phút
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 mt-2">
          <span className="text-neutral-500">Phí dịch vụ:</span>
          <span className="font-bold text-brand flex items-center gap-1">
            <CoinIcon size={13} /> {priceInCoin} Coin
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="scheduled-at" className="block text-xs font-bold text-neutral-700 mb-1.5">Ngày giờ hẹn</label>
        <input 
          id="scheduled-at"
          type="datetime-local" 
          value={scheduledAt}
          onChange={e => onChangeScheduledAt(e.target.value)}
          required
          min={minDatetimeLocal}
          disabled={isPending}
          className="w-full border-2 border-neutral-200 rounded-xl px-4 py-2.5 text-sm
                     focus:border-brand focus:outline-none transition-colors disabled:opacity-50 disabled:bg-neutral-50" 
        />
      </div>

      <div>
        <label htmlFor="booking-note" className="block text-xs font-bold text-neutral-700 mb-1.5">Ghi chú (tuỳ chọn)</label>
        <textarea 
          id="booking-note"
          value={note}
          onChange={e => onChangeNote(e.target.value)}
          rows={3}
          disabled={isPending}
          placeholder="Địa điểm, yêu cầu đặc biệt..."
          className="w-full border-2 border-neutral-200 rounded-xl px-4 py-2.5 text-sm
                     resize-none focus:border-brand focus:outline-none transition-colors disabled:opacity-50 disabled:bg-neutral-50" 
        />
      </div>

      <Button 
        type="button" 
        variant="primary" 
        size="md"
        className="rounded-full w-full justify-center"
        onClick={onNextStep}
        disabled={isPending}
      >
        Tiếp tục đặt lịch ♡
      </Button>
    </div>
  )
}
