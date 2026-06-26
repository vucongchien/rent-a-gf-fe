import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Khám phá người đồng hành';
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
            'linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #ddd6fe 100%)',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#7c3aed',
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          /explore
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: '#3b0764',
            textAlign: 'center',
            lineHeight: 1.05,
            marginBottom: 28,
            letterSpacing: -2,
          }}
        >
          Khám phá người đồng hành
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#5b21b6',
            textAlign: 'center',
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          Hà Nội · TP. Hồ Chí Minh · Đà Nẵng — chọn người phù hợp, đặt lịch hẹn ngay
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 24,
            color: '#7c3aed',
            fontWeight: 600,
          }}
        >
          Mỗi Bước Một Duyên
        </div>
      </div>
    ),
    { ...size },
  );
}
