import React from 'react';
import Link from 'next/link';
import type { CompanionScenario } from '@/shared/types';

export interface ScenarioSelectorProps {
  scenarios: CompanionScenario[];
  selectedScenarioId: string;
  companionId: string;
  className?: string;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarioId,
  companionId,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {scenarios.map((sc) => {
        const isSelected = sc.scenarioId === selectedScenarioId;
        return (
          <Link
            key={sc.scenarioId}
            href={`/explore/${companionId}?scenarioId=${sc.scenarioId}`}
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
                {sc.title}
              </div>
              <div className="text-[11px] text-neutral-500 line-clamp-1 font-medium">
                {sc.description}
              </div>
            </div>

            <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-dashed border-neutral-100">
              <span className="text-[10px] font-mono text-neutral-400">{sc.publicPlace}</span>
              <span className="font-sans font-black text-sm text-rose-600">
                {sc.price} C
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

ScenarioSelector.displayName = 'ScenarioSelector';
