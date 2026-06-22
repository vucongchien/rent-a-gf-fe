import React, { Suspense } from 'react';
import { companionService } from '@/shared/services/companionService';
import { ProfileStatusBanner } from '@/shared/components/molecules/ProfileStatusBanner';
import { ProfileSkeleton } from '@/shared/components/organisms/ProfileSkeleton';
import { ProfileBasicEditor } from '@/shared/components/organisms/ProfileBasicEditor';
import { MediaSection } from '@/shared/components/organisms/MediaSection';

async function ProfileContent() {
  const profile = await companionService.getMyProfile();

  return (
    <div className="space-y-4">
      <ProfileBasicEditor initial={profile} />
      <MediaSection initial={profile} />
    </div>
  );
}

export default function CompanionProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
