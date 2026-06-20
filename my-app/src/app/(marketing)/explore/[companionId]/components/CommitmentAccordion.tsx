import React from 'react';
import { ChevronDownIcon, CheckIcon } from '@/shared/components/atoms/Icons';

export interface CommitmentAccordionProps {
  className?: string;
}

export const CommitmentAccordion: React.FC<CommitmentAccordionProps> = ({
  className = '',
}) => {
  return (
    <details className={`group border-b border-neutral-200 pb-3 ${className}`} open>
      <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
        <span>Cam kết an toàn & bảo mật</span>
        <span className="transition-transform duration-200 group-open:rotate-180">
          <ChevronDownIcon size={16} strokeWidth={2.5} className="text-neutral-600" />
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
  );
};

CommitmentAccordion.displayName = 'CommitmentAccordion';
