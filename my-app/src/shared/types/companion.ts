/**
 * companion.ts — Types cho Companion domain.
 * Owned by frontend — đây là contract BFF trả về client.
 * Backend schema có thể khác, Route Handler transform về shape này.
 */

/** Companion trong danh sách (list view) */
export interface Companion {
  id: string
  displayName: string
  city: string
  ratingAvg: number
  reviewCount: number
  avatarUrl: string
  voiceIntroUrl: string | null
  featuredScenario: CompanionScenarioSummary | null
  metadata: string[]
  albumUrls: string[]
}

/** Scenario tóm tắt hiển thị trên card */
export interface CompanionScenarioSummary {
  name: string
  priceInCoin: number
}

/** Scenario đầy đủ cho trang detail */
export interface CompanionScenario {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceInCoin: number
  location: string
  isActive: boolean
  isFeatured: boolean
}

/** Review của khách hàng */
export interface CompanionReview {
  id: string
  authorName: string
  rating: number
  comment: string
  postedAt: string
}

/** Companion chi tiết (detail page) */
export interface CompanionDetail extends Companion {
  bio: string
  scenarios: CompanionScenario[]
  reviewCount: number
  recentReviews?: CompanionReview[]
}
