import { ImageResponse } from 'next/og';
import { companionService } from '@/shared/services/companionService';
import { cityLabel } from '@/shared/constants/cities';

export const runtime = 'nodejs';
export const alt = 'Người đồng hành · Mỗi Bước Một Duyên';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: { companionId: string };
}

export default async function Image({ params }: Props) {
  const companion = await companionService.getCompanionDetail(params.companionId);

  const name = companion?.displayName ?? 'Người đồng hành';
  const bio = companion?.biography?.slice(0, 140) ?? 'Đặt lịch hẹn an toàn với Kano-Coin';
  const cities = companion?.availableCities?.map(cityLabel).join(' · ') ?? '';
  const avatar = companion?.avatarUrl || companion?.albumUrls?.[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background:
            'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {avatar && (
          <div
            style={{
              width: 480,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={name}
              width={384}
              height={480}
              style={{
                width: 384,
                height: 480,
                objectFit: 'cover',
                borderRadius: 32,
                boxShadow: '0 20px 60px rgba(131, 24, 67, 0.25)',
              }}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: avatar ? '80px 80px 80px 0' : 80,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#be185d',
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            Mỗi Bước Một Duyên
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: '#831843',
              lineHeight: 1.0,
              marginBottom: 24,
              letterSpacing: -2,
            }}
          >
            {name}
          </div>
          {cities && (
            <div
              style={{
                fontSize: 28,
                color: '#9d174d',
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              {cities}
            </div>
          )}
          <div
            style={{
              fontSize: 26,
              color: '#6b21a8',
              lineHeight: 1.4,
              maxWidth: 620,
            }}
          >
            {bio}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
