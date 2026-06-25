import React from 'react'
import { companionService } from '@/shared/services/companionService'
import { CompanionCard } from '@/shared/components/molecules/CompanionCard'
import { cityLabel } from '@/shared/constants/cities'
import type { Companion } from '@/shared/types'

interface RelatedCompanionsProps {
  currentId: string
  city: string
}

export async function RelatedCompanions({ currentId, city }: RelatedCompanionsProps) {
  // Lấy danh sách companion cùng thành phố (lấy limit 4 phòng trường hợp lọc bỏ companion hiện tại)
  const result = await companionService.getCompanions({ pageSize: 4, city })
  
  // Lọc bỏ chính companion đang xem
  const list = result.companions.filter((c: Companion) => c.companionId !== currentId).slice(0, 3)

  if (list.length === 0) return null

  return (
    <div className="space-y-6 pt-10 border-t border-neutral-200">
      <div className="flex items-start gap-4 mb-4">
        <span 
          className="bg-brand text-neutral-900 font-bold text-sm px-3 py-1 rounded-lg flex-none"
          style={{ transform: 'rotate(2deg)' }}
        >
          ✿
        </span>
        <div>
          <h2 className="font-sans text-3xl text-neutral-900 font-bold">Bạn đồng hành khác</h2>
          <p className="text-xs text-text-muted mt-1">Gợi ý những bạn gái đồng hành đáng mến cùng khu vực {city}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((c: Companion) => (
          <CompanionCard
            key={c.companionId}
            id={c.companionId}
            name={c.displayName}
            location={cityLabel(c.availableCities[0] ?? '')}
            price={`${c.minPrice || 150} Coin`}
            avatarUrl={c.avatarUrl}
            voiceUrl={c.voiceIntroUrl}
            metadata={c.averageRating > 0 ? [String(c.averageRating)] : c.availableCities.map(cityLabel)}
            traits={[]}
          />
        ))}
      </div>
    </div>
  )
}


export function RelatedCompanionsSkeleton() {
  return (
    <div className="space-y-6 pt-10 border-t border-neutral-200 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-8 h-8 bg-neutral-200 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-neutral-200 rounded w-1/4" />
          <div className="h-3 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-[24px] p-[12px] h-[340px] flex flex-col justify-between">
            <div className="aspect-square bg-neutral-200 rounded-xl" />
            <div className="h-4 bg-neutral-200 rounded w-1/2 mt-4" />
            <div className="h-3 bg-neutral-200 rounded w-1/3 mt-2" />
            <div className="h-8 bg-neutral-200 rounded w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
