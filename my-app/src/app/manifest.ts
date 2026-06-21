import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rent a Girlfriend Mobile',
    short_name: 'RentGF',
    description: 'Trải nghiệm tìm kiếm và trò chuyện cùng Companion',
    start_url: '/',
    display: 'standalone',
    background_color: 'rgb(255, 240, 245)', // Chizuru 50 (Trắng ánh hồng)
    theme_color: 'rgb(255, 182, 193)', // Chizuru 500 (Hồng pastel chủ đạo)
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Trò chuyện',
        url: '/messages'
      },
      {
        name: 'Khám phá',
        url: '/explore'
      }
    ]
  };
}
