/**
 * cacheTags.ts — Single source of truth cho Next.js cache tags.
 *
 * Phạm vi: CHỈ public data (theo AGENTS.md 2026-06 — `'use cache'` cấm cho
 * user-specific). User data dùng dynamic fetch hoặc React `cache()` per-request,
 * không tag.
 */
export const CACHE_TAGS = {
  // ─── Companions (public) ────────────────────────────────────────────────────
  /** Nuke toàn bộ companion cache (list + mọi detail) */
  COMPANIONS: 'companions',
  /** Tag chung khi muốn invalidate mọi list scope */
  COMPANIONS_LIST: 'companions-list',
  /** List scope theo page + city để invalidate granular */
  companionsList: (scopeKey: string) => `companions-list-${scopeKey}`,
  /** Cache riêng cho từng companion profile (public) */
  companion: (id: string) => `companion-${id}`,

  // ─── App Config (Vercel Edge Config — public) ───────────────────────────────
  APP_CONFIG: 'app-config',
} as const

export type CacheTag =
  | typeof CACHE_TAGS.COMPANIONS
  | typeof CACHE_TAGS.COMPANIONS_LIST
  | typeof CACHE_TAGS.APP_CONFIG
  | string
