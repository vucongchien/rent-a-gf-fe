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
  status?: string
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
  status?: string
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

/** Request body khi Client submit review cho 1 booking đã COMPLETED.
 * SSOT: POST /interaction/reviews { bookingId, clientId, companionId, rating, comment }. */
export interface CreateReviewBody {
  bookingId: string
  clientId: string
  companionId: string
  rating: number
  comment: string
}

/** Phản hồi khi submit review thành công */
export type CreateReviewResponse = CompanionReview


/** Body khi tạo/cập nhật scenario (SSOT: title, description, price, durationMinutes, publicPlace). */
export interface CreateScenarioBody {
  title: string
  description: string
  price: number
  durationMinutes: number
}

/**
 * Body khi cập nhật scenario — PUT yêu cầu `status` bắt buộc.
 * SSOT: PUT /api/v1/profile/me/scenarios/{scenarioId}.
 */
export interface UpdateScenarioBody extends CreateScenarioBody {
  status: 'ACTIVE' | 'INACTIVE'
}

/** Phản hồi danh sách companion có phân trang */
import type { PaginatedMeta } from './api'
export interface CompanionsResponse extends PaginatedMeta {
  companions: Companion[]
}
