import * as React from "react";
import Link from "next/link";
import { StarIcon, MapPinIcon, CheckIcon } from "@/shared/components/atoms/Icons";
import { Button } from "@/shared/components/atoms/Button";
import type { CompanionDetail } from "@/shared/types";

interface CompanionInfoCardProps {
  companion: CompanionDetail;
  selectedScenarioId: string;
}

export const CompanionInfoCard: React.FC<CompanionInfoCardProps> = ({
  companion,
  selectedScenarioId,
}) => {
  const selectedScenario =
    companion.scenarios.find((sc) => sc.id === selectedScenarioId) || companion.scenarios[0];

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-[28px] p-6 shadow-[8px_8px_0_var(--color-neutral-900)] space-y-6">
      {/* Header: Tên, Đánh giá, Vị trí */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="font-sans text-3xl font-black text-neutral-900 tracking-tight leading-none">
            {companion.displayName}
          </h1>
          <span className="font-mono text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1 shrink-0">
            <MapPinIcon size={12} className="stroke-[2.5px]" />
            {companion.city}
          </span>
        </div>

        {/* Rating & Metadata Tags */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 font-sans font-bold text-sm text-neutral-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shadow-[1px_2px_0_var(--color-neutral-900)]">
            <StarIcon size={14} className="text-amber-400 fill-amber-400" />
            {companion.ratingAvg > 0 ? companion.ratingAvg.toFixed(1) : "New"}
          </div>
          {companion.metadata.map((meta, index) => (
            <span
              key={index}
              className="font-sans font-bold text-xs text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full shadow-[1px_2px_0_var(--color-neutral-900)]"
            >
              {meta === "Nữ" ? "Nữ ♀" : meta === "Nam" ? "Nam ♂" : meta}
            </span>
          ))}
        </div>
      </div>

      {/* Bio / Giới thiệu */}
      <div className="border-t-2 border-dashed border-neutral-200 pt-5 space-y-2">
        <h2 className="font-sans font-black text-lg text-neutral-900">Về mình...</h2>
        <p className="text-neutral-600 leading-relaxed text-sm italic font-medium">
          "{companion.bio}"
        </p>
      </div>

      {/* Scenarios / Lựa chọn Kịch bản (Giống Size Selector của Nike) */}
      <div className="border-t-2 border-dashed border-neutral-200 pt-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <h2 className="font-sans font-black text-lg text-neutral-900">Lựa chọn kịch bản</h2>
          {selectedScenario && (
            <span className="font-mono text-[10px] font-bold text-neutral-400">
              Thời lượng: {selectedScenario.durationMinutes} phút
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {companion.scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <Link
                key={sc.id}
                href={`/explore/${companion.id}?scenarioId=${sc.id}`}
                scroll={false}
                className={`
                  p-3.5 border-2 rounded-xl text-left transition-all duration-150 relative flex flex-col justify-between min-h-[92px]
                  ${
                    isSelected
                      ? "border-neutral-900 bg-[var(--color-cream)] shadow-[3px_3px_0_var(--color-neutral-900)] translate-x-[-1px] translate-y-[-1px]"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }
                `}
              >
                <div className="space-y-1">
                  <div className="font-sans font-black text-sm text-neutral-900 leading-tight">
                    {sc.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 line-clamp-1 font-medium">
                    {sc.description}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-dashed border-neutral-100">
                  <span className="text-[10px] font-mono text-neutral-400">{sc.location}</span>
                  <span className="font-sans font-black text-sm text-rose-600">
                    {sc.priceInCoin} C
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Booking */}
      <div className="pt-2">
        <Link
          href={`/explore/${companion.id}/booking?scenarioId=${selectedScenario.id}`}
          className="block w-full"
        >
          <Button variant="primary" size="lg" className="w-full justify-center">
            Đặt Lịch Ngay →
          </Button>
        </Link>
      </div>

      {/* Accordions (Giống Product Accordions ở đáy của Nike PDP) */}
      <div className="border-t-2 border-dashed border-neutral-200 pt-5">
        <div className="space-y-2.5">
          {/* Accordion 1: Cam kết an toàn & bảo mật */}
          <details className="group border-b border-neutral-200 pb-3" open>
            <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
              <span>Cam kết an toàn & bảo mật</span>
              <span className="transition-transform duration-200 group-open:rotate-180">
                <svg
                  className="w-4 h-4 text-neutral-600 stroke-[2.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 text-xs text-neutral-600 space-y-2.5 leading-relaxed font-medium">
              <div className="flex items-start gap-2 pt-1">
                <CheckIcon size={14} className="text-emerald-500 stroke-[3px] shrink-0 mt-0.5" />
                <span>
                  <b>An toàn 100%</b> — Kano-Coin chỉ giải ngân sau cuộc hẹn thành công.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon size={14} className="text-emerald-500 stroke-[3px] shrink-0 mt-0.5" />
                <span>
                  <b>Dịch vụ uy tín</b> — Bạn gái đã được xác minh hồ sơ và phong cách.
                </span>
              </div>
            </div>
          </details>

          {/* Accordion 2: Đánh giá gần đây */}
          <details className="group border-b border-neutral-200 pb-3">
            <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
              <span>Đánh giá khách hàng ({companion.reviewCount})</span>
              <span className="transition-transform duration-200 group-open:rotate-180">
                <svg
                  className="w-4 h-4 text-neutral-600 stroke-[2.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
              {companion.recentReviews && companion.recentReviews.length > 0 ? (
                companion.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 border-2 border-neutral-900 rounded-xl bg-neutral-50 shadow-[2px_2px_0_var(--color-neutral-900)] space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-neutral-900 overflow-hidden flex items-center justify-center bg-amber-100 font-mono text-[9px] font-bold">
                          {rev.authorName.charAt(0)}
                        </span>
                        <span className="font-bold text-neutral-800">{rev.authorName}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{rev.postedAt}</span>
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

          {/* Accordion 3: Câu hỏi thường gặp */}
          <details className="group pb-1">
            <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
              <span>Câu hỏi thường gặp</span>
              <span className="transition-transform duration-200 group-open:rotate-180">
                <svg
                  className="w-4 h-4 text-neutral-600 stroke-[2.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 text-xs text-neutral-600 space-y-3.5 leading-relaxed font-medium">
              <div className="space-y-1">
                <h4 className="font-sans font-black text-neutral-900 text-xs">
                  Mình có thể hủy lịch hẹn không?
                </h4>
                <p className="text-neutral-500">
                  Có. Bạn được hủy lịch miễn phí trước 24 giờ. Coin sẽ được tự động hoàn trả 100%
                  vào ví của bạn.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-black text-neutral-900 text-xs">
                  Làm thế nào để liên lạc với bạn gái?
                </h4>
                <p className="text-neutral-500">
                  Sau khi yêu cầu đặt lịch được chấp nhận, kênh chat riêng giữa hai bạn sẽ tự động
                  kích hoạt.
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

CompanionInfoCard.displayName = "CompanionInfoCard";
