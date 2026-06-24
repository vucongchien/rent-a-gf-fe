import { companionService } from '@/shared/services/companionService';
import type { CompanionCardProps } from '@/shared/components/molecules/CompanionCard';
import RentAGirlfriendLanding from './_landing/RentAGirlfriendLanding';

export default async function LandingPage() {
  const { companions } = await companionService.getCompanions({ pageSize: 6 });

  const cards: CompanionCardProps[] = companions.map((c) => ({
    id: c.companionId,
    name: c.displayName,
    location: c.availableCities.join(', '),
    price: c.minPrice ? `${c.minPrice} KC` : 'Free to meet',
    avatarUrl: c.avatarUrl,
    voiceUrl: c.voiceIntroUrl,
    traits: c.totalReviews === 0 ? ['new'] : undefined,
    metadata: c.availableCities,
  }));

  return <RentAGirlfriendLanding companions={cards} />;
}
