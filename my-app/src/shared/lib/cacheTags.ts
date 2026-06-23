/**
 * cacheTags.ts — Single source of truth cho Next.js cache tags.
 *
 * Phạm vi: CHỈ public data (theo AGENTS.md 2026-06 — `'use cache'` cấm cho
 * user-specific). User data dùng dynamic fetch hoặc React `cache()` per-request,
 * không tag.
 *
 * USAGE:
 *   // Gán tag khi fetch:
 *   fetch(url, { next: { tags: [CACHE_TAGS.COMPANIONS_LIST] } })
 *
 *   // Xóa cache on-demand:
 *   import { revalidateTag } from 'next/cache'
 *   revalidateTag(CACHE_TAGS.companion('comp-123'))
 */
export const CACHE_TAGS = {
  // ─── Companions (public) ────────────────────────────────────────────────────
  /** Nuke toàn bộ companion cache (list + mọi detail) */
  COMPANIONS: 'companions',
  /** Chỉ invalidate danh sách — giữ nguyên cache detail từng companion */
  COMPANIONS_LIST: 'companions-list',
  /** Cache riêng cho từng companion profile (public) */
  companion: (id: string) => `companion-${id}`,
} as const

export type CacheTag =
  | typeof CACHE_TAGS.COMPANIONS
  | typeof CACHE_TAGS.COMPANIONS_LIST
  | string // companion-{id} là dynamic
