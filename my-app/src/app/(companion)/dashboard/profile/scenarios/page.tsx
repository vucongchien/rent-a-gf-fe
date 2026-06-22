import React, { Suspense } from 'react';
import { companionService } from '@/shared/services/companionService';
import { ScenarioManager } from '@/shared/components/organisms/ScenarioManager';
import { ProfileSkeleton } from '@/shared/components/organisms/ProfileSkeleton';
import type { CompanionScenario } from '@/shared/types/companion';

async function ScenariosContent() {
  const me = await companionService.getMyProfile();
  // SSOT chia tách: /profile/me không trả scenarios → lấy từ detail.
  const detail = await companionService.getCompanionDetail(me.companionId);
  const scenarios: CompanionScenario[] = detail?.scenarios ?? [];
  return <ScenarioManager initial={scenarios} />;
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ScenariosContent />
    </Suspense>
  );
}
