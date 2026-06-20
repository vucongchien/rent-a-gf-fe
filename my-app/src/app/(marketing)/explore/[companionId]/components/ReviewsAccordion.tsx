import React from 'react';
import { StarIcon, ChevronDownIcon } from '@/shared/components/atoms/Icons';

export interface ReviewItem {
  reviewId: string;
  authorName?: string;
  createdAt?: string;
  rating: number;
  comment: string;
}

export interface ReviewsAccordionProps {
  reviews?: ReviewItem[];
  totalReviews: number;
  className?: string;
}

export const ReviewsAccordion: React.FC<ReviewsAccordionProps> = ({
  reviews,
  totalReviews,
  className = '',
}) => {
  return (
    <details className={`group border-b border-neutral-200 pb-3 ${className}`}>
      <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
        <span>Đánh giá khách hàng ({totalReviews})</span>
        <span className="transition-transform duration-200 group-open:rotate-180">
          <ChevronDownIcon size={16} strokeWidth={2.5} className="text-neutral-600" />
        </span>
      </summary>
      <div className="mt-4 space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.reviewId}
              className="p-3 border-2 border-neutral-900 rounded-xl bg-neutral-50 shadow-[2px_2px_0_var(--color-neutral-900)] space-y-1.5"
            >
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full border border-neutral-900 overflow-hidden flex items-center justify-center bg-amber-100 font-mono text-[9px] font-bold">
                    {rev.authorName ? rev.authorName.charAt(0) : 'A'}
                  </span>
                  <span className="font-bold text-neutral-800">{rev.authorName || 'Ẩn danh'}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={10}
                    className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200"}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-neutral-500 italic py-2">
            Chưa có đánh giá nào. Hãy là người đầu tiên đặt lịch và để lại đánh giá nhé!
          </p>
        )}
      </div>
    </details>
  );
};

ReviewsAccordion.displayName = 'ReviewsAccordion';
