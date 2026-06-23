'use client';

import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  max?: number;
  size?: number;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled = false,
  max = 5,
  size = 40,
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Đánh giá sao"
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(null)}
      >
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;
          const active = star <= display;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} sao`}
              disabled={disabled}
              onMouseEnter={() => !disabled && setHover(star)}
              onFocus={() => !disabled && setHover(star)}
              onBlur={() => setHover(null)}
              onClick={() => !disabled && onChange(star)}
              className={`p-1 rounded-md transition-transform ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-chizuru-400`}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`transition-colors ${
                  active ? 'text-chizuru-500' : 'text-neutral-200'
                }`}
              >
                <path
                  d="M12 2.5 C12.8 5.5 15.5 6.5 19 7 C16 9 15.5 12.5 17 16 C14 14.5 10 14.5 7 16 C8.5 12.5 8 9 5 7 C8.5 6.5 11.2 5.5 12 2.5 Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className={`font-sans text-[13.5px] font-semibold transition-colors ${
          display > 0 ? 'text-chizuru-600' : 'text-neutral-400'
        }`}
      >
        {display > 0 ? RATING_LABELS[display] : 'Chọn số sao'}
      </p>
    </div>
  );
};
