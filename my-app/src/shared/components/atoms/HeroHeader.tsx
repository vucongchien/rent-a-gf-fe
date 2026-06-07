import React from 'react';

export interface HeroHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-[18px]  sm:pt-0 mb-[28px] ${className}`}>
      <h1 className="font-sans font-semibold text-[40px] md:text-[62px] leading-[1.15] md:leading-[0.98] m-0 tracking-[-0.03em] text-neutral-900">
        {title || (
          <>
            Find a companion<br />who <em className="not-italic italic text-chizuru-600">truly listens.</em>
          </>
        )}
      </h1>
      <p className="text-[16.5px] text-neutral-500 leading-[1.55] max-w-[440px] m-0">
        {subtitle || "Browse our curated list of companions looking to share a coffee, a walk, or simply a good conversation — and tap the speaker to hear their voice."}
      </p>
    </div>
  );
};
