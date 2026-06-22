'use client';

import React from 'react';
import { CITIES } from '@/shared/constants/cities';
import { FilterChip } from '@/shared/components/atoms/FilterChip';

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
        {CITIES.map((c) => (
          <FilterChip
            key={c.code}
            label={c.label}
            active={value.includes(c.code)}
            onClick={() => toggle(c.code)}
          />
        ))}
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
