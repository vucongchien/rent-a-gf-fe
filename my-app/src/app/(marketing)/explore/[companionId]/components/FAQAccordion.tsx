import React from 'react';
import { ChevronDownIcon } from '@/shared/components/atoms/Icons';

export interface FAQAccordionProps {
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  className = '',
}) => {
  return (
    <details className={`group pb-1 ${className}`}>
      <summary className="flex items-center justify-between font-sans font-black text-sm text-neutral-900 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
        <span>Câu hỏi thường gặp</span>
        <span className="transition-transform duration-200 group-open:rotate-180">
          <ChevronDownIcon size={16} strokeWidth={2.5} className="text-neutral-600" />
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
  );
};

FAQAccordion.displayName = 'FAQAccordion';
