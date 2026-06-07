'use client';

import React from 'react';
import Link from 'next/link';
import { CompanionBadge, CompanionTrait } from '../atoms/CompanionBadge';
import { LikeButton } from '../atoms/LikeButton';
import { VoiceButton } from '../atoms/VoiceButton';
import { MediaSlot } from '../atoms/MediaSlot';

export interface CompanionCardProps {
  id: string;
  name: string;
  location: string;
  price: string;
  avatarUrl?: string;
  voiceUrl?: string | null;
  traits?: CompanionTrait[];
  metadata?: string[]; // e.g., ["Sinh viên", "20 tuổi", "Nữ"]
  isLiked?: boolean;
  onLike?: (isLiked: boolean) => void;
  className?: string;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  id,
  name,
  location,
  price,
  avatarUrl,
  voiceUrl,
  traits = [],
  metadata = [],
  isLiked = false,
  onLike,
  className = '',
}) => {
  const detailHref = `/explore/${id}`;

  return (
    <article
      className={`
        companion-card-item group bg-white border border-neutral-200 rounded-[24px] p-[12px]
        md:shadow-[0_18px_40px_-30px_rgba(251,105,153,0.4)]
        transition-all duration-180 ease-out flex flex-col
        hover:-translate-y-[2px] hover:md:shadow-[0_28px_50px_-28px_rgba(251,105,153,0.5)]
        ${className}
      `}
      style={{ '--card-id': `card-${id}` } as React.CSSProperties}
    >
      {/* MEDIA SECTION — nhấn ảnh = điều hướng đến trang chi tiết */}
      <Link
        href={detailHref}
        className="block rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-chizuru-600)]"
        tabIndex={0}
        aria-label={`Xem hồ sơ ${name}`}
      >
        <MediaSlot
          src={avatarUrl}
          alt={name}
          aspectRatio="1/1"
          radius="xl"
          tint="pink"
          className="border border-neutral-200 relative overflow-hidden"
        >
          <CompanionBadge traits={traits} />

          {/* LikeButton — stopPropagation tránh trigger Link khi nhấn tim */}
          <div
            className="absolute top-[11px] right-[11px] z-10"
            onClick={(e) => e.preventDefault()}
          >
            <LikeButton isLiked={isLiked} onToggle={onLike || (() => {})} />
          </div>

          {voiceUrl && (
            <div
              className="absolute left-[11px] bottom-[11px] z-10"
              onClick={(e) => e.preventDefault()}
            >
              <VoiceButton
                soundUrl={voiceUrl}
                size="mini"
                label="Hi!"
              />
            </div>
          )}
        </MediaSlot>
      </Link>

      {/* BODY SECTION */}
      <div className="pt-3.5 px-2 pb-2 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-[8px]">
          <h3 className="font-sans font-semibold text-companion-title m-0 leading-none text-neutral-900">
            {name}
          </h3>
          <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-neutral-500">
            {location}
          </span>
        </div>

        {metadata.length > 0 && (
          <div className="text-[12.5px] text-neutral-500 mt-[5px] flex items-center flex-wrap gap-[7px]">
            {metadata.map((item, index) => {
              const displayVal = item === 'Nữ' ? 'Nữ ♀' : item === 'Nam' ? 'Nam ♂' : item;
              return (
                <React.Fragment key={index}>
                  <span>{displayVal}</span>
                  {index < metadata.length - 1 && (
                    <span className="w-1 h-1 rounded-full bg-neutral-500 inline-block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-2.5 mt-3.5 pt-3 border-t border-dashed border-border-card-dashed">
          <span className="font-sans font-semibold text-[18px] text-neutral-900">
            {price}
          </span>
          {/* Đổi thành Link để chuyển hướng và dùng group-hover tăng sáng khi hover card */}
          <Link
            href={detailHref}
            className="btn-base btn-primary btn-sm group-hover:brightness-110 transition-all duration-200"
          >
            Meet me
          </Link>
        </div>
      </div>
    </article>
  );
};
