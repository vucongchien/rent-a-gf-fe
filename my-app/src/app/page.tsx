import type { Metadata } from 'next';
import { companionService } from '@/shared/services/companionService';
import type { CompanionCardProps } from '@/shared/components/molecules/CompanionCard';
import { cityLabel } from '@/shared/constants/cities';
import RentAGirlfriendLanding from './_landing/RentAGirlfriendLanding';

const HOME_TITLE = 'Mỗi Bước Một Duyên · Đặt lịch hẹn hò cùng người đồng hành';
const HOME_DESCRIPTION =
  'Khám phá những người bạn đồng hành thú vị — đặt lịch hẹn cà phê, dạo phố, dự sự kiện. Thanh toán an toàn bằng Kano-Coin, hoàn tiền 100% khi hủy trước 24 giờ.';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
    type: 'website',
  },
  twitter: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default async function LandingPage() {
  const { companions } = await companionService.getCompanions({ pageSize: 6 });

  const cards: CompanionCardProps[] = companions.map((c) => ({
    id: c.companionId,
    name: c.displayName,
    location: c.availableCities.map(cityLabel).join(', '),
    price: c.minPrice ? `${c.minPrice} KC` : 'Free to meet',
    avatarUrl: c.avatarUrl,
    voiceUrl: c.voiceIntroUrl,
    traits: c.totalReviews === 0 ? ['new'] : undefined,
    metadata: c.averageRating > 0 ? [String(c.averageRating)] : c.availableCities.map(cityLabel),
  }));

  return <RentAGirlfriendLanding companions={cards} />;
}
