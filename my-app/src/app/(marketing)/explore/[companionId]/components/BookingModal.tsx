'use client'

import React, { useEffect } from 'react'
import { XIcon } from '@/shared/components/atoms/Icons'
import { BookingForm } from '@/shared/components/molecules/BookingForm'
import type { CompanionScenario } from '@/shared/types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  companionId: string
  companionName: string
  scenario: CompanionScenario
}

export function BookingModal({ isOpen, onClose, companionId, companionName, scenario }: BookingModalProps) {
  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Đóng bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 backdrop-blur-[2px] animate-fade-in pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Đặt lịch hẹn với ${companionName}`}
    >
      <div className="relative max-w-md w-full p-4 pointer-events-none">
        <div className="pointer-events-auto relative bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.1)]">
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto shadow-sm transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            aria-label="Đóng form đặt lịch"
          >
            <XIcon size={14} className="stroke-[2.5px]" />
          </button>

          <div className="note-card w-full p-8 bg-[--color-cream]">
            <h2 className="font-serif text-3xl text-brand mb-2">Đặt lịch hẹn</h2>
            <p className="text-sm text-neutral-600 mb-6">{scenario.name} · với {companionName}</p>
            <BookingForm
              companionId={companionId}
              companionName={companionName}
              scenarioId={scenario.id}
              scenarioName={scenario.name}
              priceInCoin={scenario.priceInCoin}
              durationMinutes={scenario.durationMinutes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
