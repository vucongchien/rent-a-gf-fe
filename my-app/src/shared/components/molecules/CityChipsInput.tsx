'use client';

import React from 'react';
import { CITIES } from '@/shared/constants/cities';

interface CityChipsInputProps {
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}

export const CityChipsInput: React.FC<CityChipsInputProps> = ({ name, value, onChange, error }) => {
  const toggle = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CITIES.map((c) => {
          const active = value.includes(c.code);
          return (
            <button
              type="button"
              key={c.code}
              onClick={() => toggle(c.code)}
              data-active={active}
              className="px-3 py-1.5 rounded-full font-sans text-[12.5px] border transition-colors data-[active=true]:bg-neutral-900 data-[active=true]:text-white data-[active=true]:border-neutral-900 data-[active=false]:bg-white data-[active=false]:text-neutral-700 data-[active=false]:border-neutral-300 data-[active=false]:hover:border-neutral-500"
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {value.map((code) => (
        <input key={code} type="hidden" name={name} value={code} />
      ))}
      {error && (
        <p className="mt-1 font-sans text-[11.5px] text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
