/**
 * cacheTags.ts — Single source of truth cho tất cả Next.js cache tags.
 *
 * WHY tập trung ở đây:
 * - Tránh magic string rải rác
 * - Dễ audit khi cần revalidate
 * - Route Handler và Server Action dùng chung 1 nguồn
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
  // ─── Companions ─────────────────────────────────────────────────────────────
  /** Nuke toàn bộ companion cache (list + mọi detail) */
  COMPANIONS: 'companions',
  /** Chỉ invalidate danh sách — giữ nguyên cache detail từng companion */
  COMPANIONS_LIST: 'companions-list',
  /** Cache riêng cho từng companion profile */
  companion: (id: string) => `companion-${id}`,

  // ─── Notifications ───────────────────────────────────────────────────────────
  /** Invalidate toàn bộ danh sách notification */
  NOTIFICATIONS: 'notifications',
} as const

export type CacheTag =
  | typeof CACHE_TAGS.COMPANIONS
  | typeof CACHE_TAGS.COMPANIONS_LIST
  | typeof CACHE_TAGS.NOTIFICATIONS
  | string // companion-{id} là dynamic
