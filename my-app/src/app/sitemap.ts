import type { MetadataRoute } from 'next';
import { companionService } from '@/shared/services/companionService';
import { CITIES } from '@/shared/constants/cities';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE_URL}/explore?city=${c.code}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  let companionRoutes: MetadataRoute.Sitemap = [];
  try {
    const { companions } = await companionService.getCompanions({ page: 1, pageSize: 100 });
    companionRoutes = companions.map((c) => ({
      url: `${SITE_URL}/explore/${c.companionId}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Nếu API lỗi, vẫn trả sitemap với route tĩnh — tránh build/serve fail.
  }

  return [...staticRoutes, ...cityRoutes, ...companionRoutes];
}
