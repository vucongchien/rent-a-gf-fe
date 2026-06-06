'use client';

import React from 'react';
import Link from 'next/link';
import { VoiceButton } from '@/shared/components/atoms/VoiceButton';
import { Button } from '@/shared/components/atoms/Button';
import { MediaSlot } from '@/shared/components/atoms/MediaSlot';
import { useExplore } from '../contexts/ExploreContext';

export const HeroContent: React.FC<{
  totalCount: number;
  onExploreClick?: () => void;
}> = ({ totalCount, onExploreClick }) => {
  return (
    <div>
      <div className="inline-flex items-center gap-[9px] font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-500 bg-white border border-neutral-200 py-[7px] px-[13px] rounded-full mb-[22px]">
        <span className="w-[8px] h-[8px] rounded-full bg-[var(--color-chizuru-600)] shadow-[0_0_0_0_rgba(251,105,153,0.7)] animate-pulse" />
        {totalCount} companions ready to meet
      </div>
      
      <h1 className="font-sans font-semibold text-[40px] md:text-[62px] leading-[0.98] m-0 tracking-[-0.03em] text-neutral-900">
        Find a companion<br/>who <em className="not-italic italic text-[var(--color-chizuru-600)]">truly listens.</em>
      </h1>
      
      <p className="text-[16.5px] text-neutral-500 leading-[1.55] my-[18px] mb-[28px] max-w-[440px]">
        Browse our curated list of companions looking to share a coffee, a walk, or simply a good conversation — and tap the speaker to hear their voice.
      </p>
      
      <div className="flex gap-[13px] items-center flex-nowrap">
        <Button
          variant="primary"
          size="lg"
          onClick={onExploreClick}
          className="h-[54px] px-[24px] rounded-[15px] text-[15.5px] shrink-0"
        >
          Meet →
        </Button>

        <VoiceButton soundUrl="/demo-voice.mp3" size="default" label="Hear a greeting" className="shrink-0" />
      </div>

      <div className="flex gap-[6px] mt-[30px]">
        <span className="w-[10px] h-[10px] rounded-full block bg-[var(--color-ruka-500)]" />
        <span className="w-[10px] h-[10px] rounded-full block bg-[var(--color-mami-500)]" />
        <span className="w-[10px] h-[10px] rounded-full block bg-[var(--color-chizuru-600)]" />
        <span className="w-[10px] h-[10px] rounded-full block bg-[var(--color-neutral-200)]" />
      </div>
    </div>
  );
};

export const HeroFeatured: React.FC<{
  featuredCompanion: NonNullable<ReturnType<typeof useExplore>['featuredCompanion']>;
}> = ({ featuredCompanion }) => {
  const formattedMetadata = featuredCompanion.metadata?.map(m => 
    m === 'Nữ' ? 'Nữ ♀' : m === 'Nam' ? 'Nam ♂' : m
  ) || [];

  return (
    <div className="relative bg-white border border-neutral-200 rounded-[30px] p-[14px] md:shadow-hero md:rotate-[1.4deg] md:max-w-none max-w-[480px] mx-auto w-full font-sans">
      {/* Tag Companion of the day */}
      <span className="absolute top-[24px] left-[24px] z-20 bg-[var(--color-mami-500)] border-[1.5px] border-neutral-900 rounded-full py-[6px] px-[13px] font-sans font-semibold text-[12px] leading-none shadow-[0_3px_0_var(--color-neutral-900)] text-neutral-900">
        ★ Companion of the day
      </span>

      {/* MediaSlot bọc bằng Link để click vào ảnh cũng chuyển hướng */}
      <Link
        href={`/explore/${featuredCompanion.id}`}
        className="block relative rounded-[24px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-chizuru-600)]"
      >
        <MediaSlot
          src={featuredCompanion.avatarUrl}
          alt={featuredCompanion.name}
          aspectRatio="4/3.4"
          radius="2xl"
          tint="pink"
          // Hero là LCP element → priority=true để browser preload ngay, không lazy-load
          priority
          // Ảnh hero chiếm ~50vw trên md+, 100vw trên mobile
          sizes="(max-width: 768px) 100vw, 50vw"
          className="border border-neutral-200 relative overflow-hidden"
        >
          {/* Floating panel at the bottom */}
          <div className="absolute left-[14px] right-[14px] bottom-[14px] flex items-end justify-between gap-[10px] z-10">
            <div className="bg-white/92 backdrop-blur-[6px] border border-white rounded-[14px] p-[10px_14px] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.25)] flex flex-col">
              <h3 className="font-sans font-semibold text-[22px] m-0 text-neutral-900 leading-none">
                {featuredCompanion.name}
              </h3>
              <span className="text-[12.5px] text-neutral-500 mt-[5px] whitespace-nowrap">
                {featuredCompanion.location} {formattedMetadata.length > 0 ? `· ${formattedMetadata.join(' · ')}` : ''}
              </span>
            </div>

            {featuredCompanion.voiceUrl && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <VoiceButton 
                  soundUrl={featuredCompanion.voiceUrl} 
                  size="default" 
                  label="Hi!" 
                  className="shadow-[0_3px_0_var(--color-neutral-900)] flex-none h-[40px] px-[14px] text-[13.5px] rounded-full"
                />
              </div>
            )}
          </div>
        </MediaSlot>
      </Link>
    </div>
  );
};

export const HeroFeaturedSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white border border-neutral-200 rounded-[30px] p-[14px] md:shadow-hero md:rotate-[1.4deg] md:max-w-none max-w-[480px] mx-auto w-full animate-pulse font-sans">
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3.4] bg-neutral-100 border border-neutral-200">
        <div className="absolute left-[14px] right-[14px] bottom-[14px] flex items-end justify-between gap-[10px] z-10">
          <div className="bg-white/80 backdrop-blur-[6px] border border-white rounded-[14px] p-[10px_14px] shadow-sm flex flex-col w-[160px]">
            <div className="h-[20px] bg-neutral-200 rounded-md w-3/4 mb-[6px]" />
            <div className="h-[12px] bg-neutral-100 rounded-md w-full" />
          </div>
          <div className="h-[40px] w-[54px] bg-neutral-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export interface HeroSectionProps {
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  const { totalCount, featuredCompanion, isLoading } = useExplore();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-[36px] items-center mb-[54px]">
      <HeroContent totalCount={totalCount} onExploreClick={onExploreClick} />
      {isLoading ? (
        <HeroFeaturedSkeleton />
      ) : featuredCompanion ? (
        <HeroFeatured featuredCompanion={featuredCompanion} />
      ) : (
        // Giữ chiều cao cột 2 ổn định khi không có featured companion
        // tránh layout shift: hero grid vẫn là 2 cột
        <div className="hidden md:block" aria-hidden="true" />
      )}
    </section>
  );
};
