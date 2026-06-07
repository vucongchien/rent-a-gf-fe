import React from 'react';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 36,
  className = '',
}) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-none border border-neutral-200 bg-chizuru-50 flex items-center justify-center text-[var(--color-chizuru-600)] font-sans font-semibold transition-colors duration-150 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.floor(size * 0.4))}px`,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <span>{firstLetter}</span>
      )}
    </div>
  );
};
