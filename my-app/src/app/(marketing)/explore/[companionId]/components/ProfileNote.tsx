import React from 'react'
import type { CompanionDetail } from '@/shared/types'
import { 
  StarIcon, 
  MapPinIcon, 
  NotebookIcon, 
  GraduationIcon, 
  CakeIcon, 
  GenderFemaleIcon, 
  GenderMaleIcon 
} from '@/shared/components/atoms/Icons'
import { VoiceButton } from '@/shared/components/atoms/VoiceButton'
import { cityLabel } from '@/shared/constants/cities'
import { ScrollToScenesButton } from './ScrollToScenesButton'

// Hàm helper phân loại màu pastel và icon tương ứng cho đặc điểm nổi bật
const getTagStyle = (meta: string) => {
  const normalized = meta.toLowerCase();
  if (normalized === 'nữ') {
    return {
      IconComponent: GenderFemaleIcon,
      className: 'bg-chizuru-50/70 text-chizuru-600 border-chizuru-200/40',
    };
  }
  if (normalized === 'nam') {
    return {
      IconComponent: GenderMaleIcon,
      className: 'bg-ruka-50/70 text-ruka-600 border-ruka-200/40',
    };
  }
  if (normalized.includes('tuổi')) {
    return {
      IconComponent: CakeIcon,
      className: 'bg-amber-50/70 text-amber-700 border-amber-200/40',
    };
  }
  if (normalized.includes('sinh viên') || normalized.includes('học')) {
    return {
      IconComponent: GraduationIcon,
      className: 'bg-ruka-50/70 text-ruka-600 border-ruka-200/40',
    };
  }
  return {
    IconComponent: StarIcon,
    className: 'bg-neutral-50/70 text-text-muted border-neutral-200/40',
  };
};

export function ProfileNote({ companion }: { companion: CompanionDetail }) {
  const ratingText = companion.averageRating > 0 ? companion.averageRating.toFixed(1) : 'New'
  const cityText = companion.availableCities.map(cityLabel).join(', ')

  return (
    <div className="bg-white/90 border border-neutral-200/30 rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card-info)] backdrop-blur-md space-y-6">
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-sans text-2xl md:text-3xl text-neutral-900 font-bold tracking-tight">
              {companion.displayName}
            </h2>
            
            {/* Rating and City Info */}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
              <div className="flex items-center gap-1 font-sans font-semibold text-neutral-700 bg-amber-50/80 border border-amber-200/40 px-2.5 py-0.5 rounded-full">
                <StarIcon size={14} className="text-amber-400 fill-amber-400" />
                <span>{ratingText}</span>
                <span className="text-neutral-500 font-normal">({companion.totalReviews} phản hồi)</span>
              </div>
              
              <div className="flex items-center gap-1 text-neutral-500 font-sans font-medium">
                <MapPinIcon size={14} className="text-neutral-400" />
                <span>{cityText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / Description */}
      <div className="space-y-3 pt-5 border-t border-neutral-100/50">
        <div className="flex items-center gap-2">
          <NotebookIcon size={20} className="text-brand" />
          <span className="font-sans text-xs text-text-muted uppercase tracking-wider font-semibold">Về tôi</span>
        </div>
        <p className="text-text leading-relaxed font-sans text-sm bg-cream/50 p-4 rounded-xl border border-neutral-200/40 relative pl-8 pr-6">
          <span className="absolute left-3 top-3 text-sketch-outline/55 font-sans font-extrabold text-2xl leading-none">“</span>
          {companion.biography}
          <span className="absolute right-3 bottom-1 text-sketch-outline/55 font-sans font-extrabold text-2xl leading-none">”</span>
        </p>
      </div>

      {/* Metadata Tags */}
      {companion.metadata && companion.metadata.length > 0 && (
        <div className="pt-1">
          <div className="flex flex-wrap gap-2">
            {companion.metadata.map((meta, index) => {
              const { IconComponent, className: tagClass } = getTagStyle(meta);
              return (
                <span
                  key={index}
                  className={`font-sans text-xs font-semibold px-3 py-1 rounded-full transition-all border flex items-center gap-1.5 hover:brightness-95 ${tagClass}`}
                >
                  <IconComponent size={14} className="opacity-85" />
                  <span>{meta}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-neutral-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {companion.voiceIntroUrl ? (
          <VoiceButton 
            soundUrl={companion.voiceIntroUrl} 
            label="Nghe giới thiệu" 
            size="default" 
          />
        ) : (
          <div className="text-xs text-neutral-400 font-sans text-center sm:text-left">
            Đảm bảo an toàn 100% · Kano-Coin
          </div>
        )}
        <ScrollToScenesButton />
      </div>
    </div>
  )
}
