'use client';

import React from 'react';
import { VoiceButton } from '@/shared/components/atoms/VoiceButton';
import { Button } from '@/shared/components/atoms/Button';
import { HeroHeader } from '@/shared/components/atoms/HeroHeader';
import { CompanionsCount } from '@/shared/components/atoms/CompanionsCount';
import { CharacterDots } from '@/shared/components/atoms/CharacterDots';

export interface HeroContentProps {
  totalCount: number;
}

export const HeroContent: React.FC<HeroContentProps> = ({ totalCount }) => {
  const handleScroll = () => {
    document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <CompanionsCount count={totalCount} />
      
      <HeroHeader />
      <div className="flex gap-[13px] items-center flex-nowrap">
        <Button
          variant="primary"
          onClick={handleScroll}
          className="shrink-0"
        >
          Meet →
        </Button>

        <VoiceButton soundUrl="/demo-voice.mp3" size="default" label="Hear a greeting" className="shrink-0" />
      </div>

      <CharacterDots />
    </div>
  );
};
