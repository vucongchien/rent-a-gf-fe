import React from 'react';
import { Button } from '@/shared/components/atoms/Button';
import type { CompanionScenario } from '@/shared/types/companion';

interface ScenarioItemProps {
  scenario: CompanionScenario;
  onEdit: () => void;
  onDelete: () => void;
  pending?: boolean;
}

export const ScenarioItem: React.FC<ScenarioItemProps> = ({ scenario, onEdit, onDelete, pending }) => {
  return (
    <article
      className="rounded-2xl border border-neutral-200 bg-surface p-4 space-y-2"
      data-pending={pending ? '' : undefined}
      style={{ opacity: pending ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans font-bold text-[14px] text-neutral-900 leading-snug">
          {scenario.title}
        </h3>
        <span className="font-sans font-bold text-[13px] text-brand whitespace-nowrap">
          {scenario.price} ₭
        </span>
      </div>
      {scenario.description && (
        <p className="font-sans text-[12.5px] text-neutral-600 leading-relaxed line-clamp-2">
          {scenario.description}
        </p>
      )}
      <div className="flex items-center gap-3 font-sans text-[11.5px] text-neutral-500">
        <span>{scenario.durationMinutes} phút</span>
        <span aria-hidden>•</span>
        <span className="truncate">{scenario.publicPlace}</span>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={pending}>
          Sửa
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} disabled={pending}>
          Xóa
        </Button>
      </div>
    </article>
  );
};
