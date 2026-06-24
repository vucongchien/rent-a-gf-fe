'use client'

import { useFormStatus } from 'react-dom'
import { CoinIcon, SpinnerIcon } from '@/shared/components/atoms/Icons'
import { Button } from '@/shared/components/atoms/Button'
import type { User } from '@/shared/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export interface BookingFormStep2Props {
  companionName: string
  scenarioName: string
  priceInCoin: number
  scheduledAt: string
  balance: number
  user: User | null // Kiểu từ AuthContext
  isPending: boolean
  openWallet: () => void
  onBackStep: () => void
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus()
  const activePending = pending || isPending

  return (
    <Button 
      type="submit" 
      disabled={activePending} 
      variant="primary" 
      size="md"
      className="rounded-full w-full justify-center"
    >
      {activePending ? <SpinnerIcon size={18} /> : 'Xác nhận & Thanh toán ♡'}
    </Button>
  )
}

export function BookingFormStep2(props: BookingFormStep2Props) {
  const router = useRouter()
  const {
    companionName,
    scenarioName,
    priceInCoin,
    scheduledAt,
    balance,
    user,
    isPending,
    openWallet,
    onBackStep,
  } = props

  return (
    <div className="space-y-4">
      <h4 className="font-sans font-bold text-xs text-neutral-400 tracking-wider uppercase">Tóm tắt lịch hẹn</h4>
      
      <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 text-sm border border-neutral-100">
        <div className="flex justify-between">
          <span className="text-neutral-500">Bạn đồng hành:</span>
          <span className="font-bold text-neutral-800">{companionName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Kịch bản:</span>
          <span className="font-bold text-neutral-800">{scenarioName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Thời gian hẹn:</span>
          <span className="font-bold text-neutral-800">
            {scheduledAt ? new Date(scheduledAt).toLocaleString('vi-VN', { 
              hour: '2-digit', minute: '2-digit', 
              day: '2-digit', month: '2-digit', year: 'numeric' 
            }) : ''}
          </span>
        </div>
        <div className="flex justify-between border-t border-dashed border-neutral-200 pt-2.5">
          <span className="text-neutral-500">Tổng chi phí:</span>
          <span className="font-black text-brand flex items-center gap-1 text-base">
            <CoinIcon size={14} /> {priceInCoin} Coin
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-sm">
        <span className="text-neutral-500">Số dư ví của bạn:</span>
        <span className={`font-bold ${balance < priceInCoin ? 'text-error' : 'text-neutral-800'}`}>
          {balance} Coin
        </span>
      </div>

      {/* Check Authentication */}
      {!user ? (
        <div className="space-y-3">
          <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200/50">
            🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập Google để lưu sổ hẹn.
          </div>
          <Button 
            type="button" 
            variant="accent" 
            size="md"
            className="rounded-full w-full justify-center"
            onClick={() => router.push('/login')}
            disabled={isPending}
          >
            Đăng nhập bằng Google 🔑
          </Button>
        </div>
      ) : balance < priceInCoin ? (
        /* Check Ví tiền */
        <div className="space-y-3">
          <div className="text-xs text-center text-error bg-error/5 rounded-xl p-3 border border-error/20">
            ⚠️ Số dư ví không đủ để thanh toán. Vui lòng nạp thêm coin.
          </div>
          <Button 
            type="button" 
            variant="accent" 
            size="md"
            className="rounded-full w-full justify-center"
            onClick={() => openWallet()}
            disabled={isPending}
          >
            Nạp thêm Kano-Coin 🪙
          </Button>
        </div>
      ) : (
        /* Đủ điều kiện thanh toán */
        <SubmitButton isPending={isPending} />
      )}

      <Button 
        type="button" 
        variant="outline" 
        size="md"
        className="rounded-full w-full justify-center border-neutral-300 text-neutral-600"
        onClick={onBackStep}
        disabled={isPending}
      >
        Quay lại chỉnh sửa
      </Button>
    </div>
  )
}
