import React from 'react';
import Link from 'next/link';
import { MediaSlot } from '@/shared/components/atoms/MediaSlot';
import { VoiceButton } from '@/shared/components/atoms/VoiceButton';
import { FeaturedBadge } from '@/shared/components/atoms/FeaturedBadge';
// Type định nghĩa tại đây — không phụ thuộc vào ExploreContext
export interface FeaturedCompanion {
  id: string;
  name: string;
  location: string;
  price: string;
  avatarUrl?: string;
  voiceUrl?: string | null;
  metadata?: string[];
}

export interface HeroFeaturedProps {
  featuredCompanion: FeaturedCompanion;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ featuredCompanion }) => {
  const formattedMetadata = featuredCompanion.metadata?.map(m => 
    m === 'Nữ' ? 'Nữ ♀' : m === 'Nam' ? 'Nam ♂' : m
  ) || [];

  return (
    <div className="relative bg-white border border-neutral-200 rounded-[30px] p-[14px] md:shadow-hero md:rotate-[1.4deg] md:max-w-none max-w-[480px] mx-auto w-full font-sans">
      <FeaturedBadge />

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
            <div className="bg-white/92 backdrop-blur-[6px] border border-white rounded-[14px] p-[10px_14px] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.25)] flex flex-col min-w-0">
              <h3 className="font-sans font-semibold text-[22px] m-0 text-neutral-900 leading-none truncate">
                {featuredCompanion.name}
              </h3>
              <span className="text-[12.5px] text-neutral-500 mt-[5px] truncate">
                {featuredCompanion.location} {formattedMetadata.length > 0 ? `· ${formattedMetadata.join(' · ')}` : ''}
              </span>
            </div>

            {featuredCompanion.voiceUrl && (
              <VoiceButton 
                soundUrl={featuredCompanion.voiceUrl} 
                size="default" 
                label="Hi!" 
                className="shadow-[0_3px_0_var(--color-neutral-900)] flex-none h-[40px] px-[14px] text-[13.5px] rounded-full"
              />
            )}
          </div>
        </MediaSlot>
      </Link>
    </div>
  );
};
