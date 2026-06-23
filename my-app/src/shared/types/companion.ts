/**
 * companion.ts — Types cho Companion domain.
 */

export interface Companion {
  companionId: string
  displayName: string
  avatarUrl: string
  averageRating: number
  totalReviews: number
  availableCities: string[]
  minPrice: number
  voiceIntroUrl: string | null
  metadata?: string[]
}

export interface CompanionScenario {
  scenarioId: string
  title: string
  description: string
  price: number
  durationMinutes: number
  publicPlace: string
}

export interface CompanionDetail {
  companionId: string
  displayName: string
  biography: string
  avatarUrl: string
  albumUrls: string[]
  voiceIntroUrl: string | null
  availableCities: string[]
  averageRating: number
  totalReviews: number
  scenarios: CompanionScenario[]
  recentReviews?: CompanionReview[]
  metadata?: string[]
}


export interface CompanionProfileMe {
  companionId: string
  displayName: string
  biography: string
  avatarUrl: string
  albumUrls: string[]
  voiceIntroUrl: string | null
  availableCities: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface CompanionReview {
  reviewId: string
  bookingId: string
  clientId: string
  companionId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  authorName?: string
  authorAvatarUrl?: string
}

/** Request body khi Client submit review cho 1 booking đã COMPLETED */
export interface CreateReviewBody {
  rating: number
  comment: string
}

/** Phản hồi khi submit review thành công */
export type CreateReviewResponse = CompanionReview


export interface CreateScenarioBody {
  title: string
  description: string
  price: number
  durationMinutes: number
  publicPlace: string
}

export type UpdateScenarioBody = Partial<CreateScenarioBody>

/** Phản hồi danh sách companion có phân trang */
import type { PaginatedMeta } from './api'
export interface CompanionsResponse extends PaginatedMeta {
  companions: Companion[]
}
