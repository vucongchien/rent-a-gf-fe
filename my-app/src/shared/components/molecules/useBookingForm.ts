'use client'

import { useActionState, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBookingAction } from '@/app/(marketing)/explore/[companionId]/actions'
import { useWallet } from '@/shared/contexts/WalletContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import type { BookingActionState } from '@/app/(marketing)/explore/[companionId]/types'

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true'

export interface UseBookingFormProps {
  companionId: string
  companionName: string
  scenarioId: string
  scenarioName: string
  priceInCoin: number
  durationMinutes: number
}

/**
 * Hàm helper định dạng ngày giờ cục bộ (local timezone)
 * thành định dạng chuỗi YYYY-MM-DDThh:mm mà input[type="datetime-local"] yêu cầu.
 */
export function formatLocalDatetime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function useBookingForm(props: UseBookingFormProps) {
  const { companionId, scenarioId } = props
  const router = useRouter()
  const { balance, open: openWallet, fetchWallet } = useWallet()
  const { user, login } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')

  // --- Production path: Server Action ---
  // useActionState trả về: [state, action, isPending] trong React 19
  const [actionState, formAction, actionIsPending] = useActionState(
    createBookingAction,
    { status: 'idle' } as BookingActionState
  )

  // --- Mock path: Browser fetch → MSW intercepts → mockWallet updated browser-side ---
  const [mockState, setMockState] = useState<BookingActionState>({ status: 'idle' })
  const [mockIsPending, setMockIsPending] = useState(false)

  // Unified state dựa trên môi trường
  const state = IS_MOCK ? mockState : actionState
  const isPending = IS_MOCK ? mockIsPending : actionIsPending

  const errorMessage = validationError || (state.status === 'error' ? state.message : '')

  // Đồng bộ lại ví chỉ khi đặt lịch thành công (coin đã bị freeze ở BFF)
  useEffect(() => {
    if (state.status === 'success') {
      fetchWallet()
    }
  }, [state.status, fetchWallet])

  // Giá trị tối thiểu cho input datetime-local: Hiện tại + 1 tiếng (local time)
  const [minDatetimeLocal, setMinDatetimeLocal] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const oneHourLater = new Date(Date.now() + 3600 * 1000)
      setMinDatetimeLocal(formatLocalDatetime(oneHourLater))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Chuyển sang bước 2 (đối soát ví & xác nhận)
  const handleNextStep = () => {
    if (!scheduledAt) {
      setValidationError('Vui lòng chọn ngày giờ hẹn.')
      return
    }

    const minTime = Date.now() + 3600 * 1000 // Sau 1 tiếng
    const selectedTime = new Date(scheduledAt).getTime()

    if (selectedTime < minTime) {
      setValidationError('Thời gian đặt lịch phải sau thời điểm hiện tại ít nhất 1 giờ.')
      return
    }

    setValidationError('')
    setStep(2)
  }

  /**
   * Mock submit handler — dùng browser fetch để MSW Service Worker có thể
   * intercept và update mockWallet (browser-side).
   * Server Action bypass MSW hoàn toàn vì chạy trong Node.js (khác process).
   */
  const handleMockSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (mockIsPending) return

    setMockIsPending(true)
    setMockState({ status: 'idle' })

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId,
          scenarioId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          note: note || undefined,
        }),
      })

      if (res.ok) {
        const { data } = await res.json()
        setMockState({ status: 'success', bookingId: data.bookingId })
      } else {
        const { error } = await res.json().catch(() => ({ error: {} }))
        setMockState({
          status: 'error',
          message: error?.message ?? 'Đặt lịch thất bại. Vui lòng thử lại.',
        })
      }
    } catch {
      setMockState({ status: 'error', message: 'Mất kết nối mạng. Vui lòng thử lại.' })
    } finally {
      setMockIsPending(false)
    }
  }, [companionId, scenarioId, scheduledAt, note, mockIsPending])

  return {
    step,
    setStep,
    scheduledAt,
    setScheduledAt,
    note,
    setNote,
    validationError,
    setValidationError,
    state,
    // Production: truyền vào <form action={formAction}>
    formAction: IS_MOCK ? undefined : formAction,
    // Mock: truyền vào <form onSubmit={mockFormSubmit}>
    mockFormSubmit: IS_MOCK ? handleMockSubmit : undefined,
    isPending,
    errorMessage,
    handleNextStep,
    balance,
    openWallet,
    user,
    login,
    minDatetimeLocal,
    router,
  }
}
