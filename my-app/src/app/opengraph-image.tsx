import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mỗi Bước Một Duyên · Sổ tay hẹn hò';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: '#be185d',
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          Mỗi Bước Một Duyên
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#831843',
            textAlign: 'center',
            lineHeight: 1.05,
            marginBottom: 32,
            letterSpacing: -2,
          }}
        >
          Sổ tay hẹn hò
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#9d174d',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Đặt lịch hẹn cùng người đồng hành — an toàn, minh bạch với Kano-Coin
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            color: '#be185d',
            fontWeight: 600,
          }}
        >
          moibuocmotduyen · rent-a-girlfriend
        </div>
      </div>
    ),
    { ...size },
  );
}
