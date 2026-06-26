'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBookingAction } from '@/app/(marketing)/explore/[companionId]/actions'
import { useWallet } from '@/shared/contexts/WalletContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import type { BookingActionState } from '@/app/(marketing)/explore/[companionId]/types'

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

export function useBookingForm(_props: UseBookingFormProps) {
  const { companionId, scenarioId } = _props
  const router = useRouter()
  const { balance, open: openWallet, fetchWallet } = useWallet()
  const { user, login } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isRestored, setIsRestored] = useState(false)

  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    { status: 'idle' } as BookingActionState
  )

  const errorMessage = validationError || (state.status === 'error' ? state.message : '')

  // 1. Phục hồi draft từ sessionStorage sau khi mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('rentagf.booking.draft')
      if (raw) {
        try {
          const draft = JSON.parse(raw)
          if (draft.companionId === companionId && draft.scenarioId === scenarioId) {
            if (draft.scheduledAt) setScheduledAt(draft.scheduledAt)
            if (draft.note !== undefined) setNote(draft.note)
            if (draft.step) setStep(draft.step)
          }
        } catch (e) {
          console.error('Failed to parse booking draft', e)
        }
      }
      setIsRestored(true)
    }
  }, [companionId, scenarioId])

  // 2. Đồng bộ các thay đổi lên sessionStorage (chỉ sau khi đã phục hồi xong)
  useEffect(() => {
    if (!isRestored) return

    const draft = {
      companionId,
      scenarioId,
      scheduledAt,
      note,
      step,
    }
    sessionStorage.setItem('rentagf.booking.draft', JSON.stringify(draft))
  }, [isRestored, companionId, scenarioId, scheduledAt, note, step])

  // 3. Xoá draft khi đặt lịch thành công
  useEffect(() => {
    if (state.status === 'success') {
      fetchWallet()
      sessionStorage.removeItem('rentagf.booking.draft')
    }
  }, [state.status, fetchWallet])

  const [minDatetimeLocal, setMinDatetimeLocal] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const oneHourLater = new Date(Date.now() + 3600 * 1000)
      setMinDatetimeLocal(formatLocalDatetime(oneHourLater))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleNextStep = () => {
    if (!scheduledAt) {
      setValidationError('Vui lòng chọn ngày giờ hẹn.')
      return
    }

    const minTime = Date.now() + 3600 * 1000
    const selectedTime = new Date(scheduledAt).getTime()

    if (selectedTime < minTime) {
      setValidationError('Thời gian đặt lịch phải sau thời điểm hiện tại ít nhất 1 giờ.')
      return
    }

    setValidationError('')
    setStep(2)
  }

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
    formAction,
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
