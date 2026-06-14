'use client'

import React, { useState } from 'react'
import { ClockIcon, CoinIcon, CalendarIcon } from '@/shared/components/atoms/Icons'
import type { CompanionScenario } from '@/shared/types'
import { BookingModal } from './BookingModal'
import { Button } from '@/shared/components/atoms/Button'

interface SceneCardProps {
  companionName: string
  sc: CompanionScenario
  onSelect: (scenario: CompanionScenario) => void
}

function SceneCard({ companionName, sc, onSelect }: SceneCardProps) {
  return (
    <article
      id={`scene-${sc.id}`}
      className="bg-white/90 rounded-2xl p-5 border border-neutral-100 shadow-[var(--shadow-card-info)]
                 flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-info-hover)]"
    >
      <div className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans font-bold text-neutral-800 text-base leading-snug flex-1">
            {sc.name}
          </h3>
          <span className="flex-none text-neutral-400 mt-0.5">
            <CalendarIcon size={16} />
          </span>
        </div>
        
        <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3 flex-1">
          {sc.description}
        </p>

        <div className="space-y-1.5 pt-2.5 pb-1 text-xs text-neutral-600 border-t border-dashed border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Thời lượng:</span>
            <span className="font-semibold text-neutral-800 flex items-center gap-1">
              <ClockIcon size={12} /> {sc.durationMinutes} phút
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Chi phí:</span>
            <span className="font-bold text-chizuru-600 flex items-center gap-1 text-sm">
              <CoinIcon size={12} /> {sc.priceInCoin} Coin
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3.5">
        <Button
          variant="primary"
          size="md"
          onClick={() => onSelect(sc)}
          className="rounded-full w-full justify-center whitespace-nowrap text-xs font-semibold cursor-pointer"
        >
          Đặt hẹn với {companionName} ♡
        </Button>
      </div>
    </article>
  )
}

export interface ScenesSelectorClientProps {
  companionId: string
  companionName: string
  scenarios: CompanionScenario[]
}

export function ScenesSelectorClient({
  companionId,
  companionName,
  scenarios,
}: ScenesSelectorClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<CompanionScenario | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 mb-4">
        <span 
          className="bg-brand text-neutral-900 font-bold text-sm px-3 py-1 rounded-lg flex-none"
          style={{ transform: 'rotate(-2deg)' }}
        >
          02
        </span>
        <div>
          <h2 className="font-sans text-3xl text-neutral-900 font-bold">Kịch bản hẹn hò</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.filter(s => s.isActive).map((sc) => (
          <SceneCard 
            key={sc.id} 
            companionName={companionName}
            sc={sc} 
            onSelect={(selected) => {
              setSelectedScenario(selected)
              setIsBookingOpen(true)
            }}
          />
        ))}
      </div>

      {selectedScenario && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false)
            setSelectedScenario(null)
          }}
          companionId={companionId}
          companionName={companionName}
          scenario={selectedScenario}
        />
      )}
    </div>
  )
}
