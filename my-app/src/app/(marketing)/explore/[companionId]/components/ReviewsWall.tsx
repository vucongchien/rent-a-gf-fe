import React from 'react'
import type { CompanionReview } from '@/shared/types'
import { Avatar } from '@/shared/components/atoms/Avatar'
import { StarIcon } from '@/shared/components/atoms/Icons'

interface ReviewsWallProps {
  reviews: CompanionReview[]
  ratingAvg: number
  reviewCount: number
  companionName: string
}

function ReviewCard({ review }: { review: CompanionReview }) {
  return (
    <article 
      className="bg-white/90 border border-neutral-100 rounded-2xl p-5 shadow-[var(--shadow-card-info)] 
                 break-inside-avoid mb-6 inline-block w-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-info-hover)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={null} name={review.authorName} size={40} />
        <div>
          <h4 className="font-sans font-bold text-neutral-800 text-sm">{review.authorName}</h4>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon 
                key={i} 
                size={12} 
                className={i <= review.rating ? 'opacity-100' : 'opacity-20'} 
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed italic font-medium">
        "{review.comment}"
      </p>
      <div className="text-xs text-neutral-400 font-mono mt-3 pt-2.5 border-t border-neutral-100/60 flex justify-between items-center">
        <span>Đã xác thực hẹn hò</span>
        <span>{review.postedAt}</span>
      </div>
    </article>
  )
}

export function ReviewsWall({ reviews, ratingAvg, reviewCount, companionName }: ReviewsWallProps) {
  const displayRating = ratingAvg > 0 ? ratingAvg.toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-start gap-4 mb-6">
        <span 
          className="bg-brand text-neutral-900 font-bold text-sm px-3 py-1 rounded-lg flex-none"
          style={{ transform: 'rotate(-3deg)' }}
        >
          03
        </span>
        <div>
          <h2 className="font-sans text-3xl text-neutral-900 font-bold">Cảm nhận cuộc hẹn</h2>
        </div>
      </div>

      <p className="text-sm text-neutral-500 font-medium">
        ★ <span className="text-neutral-800 font-bold">{displayRating}/5</span> điểm trung bình từ {reviewCount} phản hồi lịch hẹn với {companionName} ♡
      </p>

      {/* Reviews masonry grid */}
      {reviews.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 pt-2">
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))}
        </div>
      ) : (
        <div className="bg-white/90 border border-neutral-100 rounded-2xl p-8 text-center text-neutral-400 italic text-sm shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          Chưa có phản hồi nào từ cuộc hẹn với {companionName}. Hãy là người đầu tiên đặt lịch hẹn và chia sẻ trải nghiệm nhé!
        </div>
      )}
    </div>
  )
}
