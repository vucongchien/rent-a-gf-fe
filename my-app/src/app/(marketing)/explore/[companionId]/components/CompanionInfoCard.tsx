import * as React from "react";
import Link from "next/link";
import { StarIcon, MapPinIcon } from "@/shared/components/atoms/Icons";
import { Button } from "@/shared/components/atoms/Button";
import type { CompanionDetail } from "@/shared/types";
import { ScenarioSelector } from "./ScenarioSelector";
import { CommitmentAccordion } from "./CommitmentAccordion";
import { ReviewsAccordion } from "./ReviewsAccordion";
import { FAQAccordion } from "./FAQAccordion";

interface CompanionInfoCardProps {
  companion: CompanionDetail;
  selectedScenarioId: string;
}

export const CompanionInfoCard: React.FC<CompanionInfoCardProps> = ({
  companion,
  selectedScenarioId,
}) => {
  const selectedScenario =
    companion.scenarios.find((sc) => sc.scenarioId === selectedScenarioId) || companion.scenarios[0];

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
            {companion.availableCities.join(', ')}
          </span>
        </div>

        {/* Rating & Metadata Tags */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 font-sans font-bold text-sm text-neutral-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shadow-[1px_2px_0_var(--color-neutral-900)]">
            <StarIcon size={14} className="text-amber-400 fill-amber-400" />
            {companion.averageRating > 0 ? companion.averageRating.toFixed(1) : "New"}
          </div>
          {companion.availableCities.map((city, index) => (
            <span
              key={index}
              className="font-sans font-bold text-xs text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full shadow-[1px_2px_0_var(--color-neutral-900)]"
            >
              {city}
            </span>
          ))}
        </div>
      </div>

      {/* Bio / Giới thiệu */}
      <div className="border-t-2 border-dashed border-neutral-200 pt-5 space-y-2">
        <h2 className="font-sans font-black text-lg text-neutral-900">Về mình...</h2>
        <p className="text-neutral-600 leading-relaxed text-sm italic font-medium">
          {"\""}{companion.introText}{"\""}
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

        <ScenarioSelector
          scenarios={companion.scenarios}
          selectedScenarioId={selectedScenarioId}
          companionId={companion.companionId}
        />
      </div>

      {/* CTA Booking */}
      <div className="pt-2">
        <Link
          href={`/explore/${companion.companionId}/booking?scenarioId=${selectedScenario.scenarioId}`}
          className="block w-full"
        >
          <Button variant="primary" size="lg" className="w-full justify-center">
            Đặt Lịch Ngay →
          </Button>
        </Link>
      </div>

      {/* Accordions (Giống Product Accordions ở đáy của Nike PDP) */}
      <div className="border-t-2 border-dashed border-neutral-200 pt-5 space-y-2.5">
        <CommitmentAccordion />
        
        <ReviewsAccordion
          reviews={companion.recentReviews}
          totalReviews={companion.totalReviews}
        />

        <FAQAccordion />
      </div>
    </div>
  );
};

CompanionInfoCard.displayName = "CompanionInfoCard";
