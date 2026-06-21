import React from 'react';
import Link from 'next/link';

interface QuickActionCardProps {
  href: string;
  bgClass: string;
  bgHoverClass: string;
  borderClass: string;
  textClass: string;
  title: string;
  countText?: string;
  icon: React.ReactNode;
  shadowClass?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  href,
  bgClass,
  bgHoverClass,
  borderClass, // Vẫn nhận để tương thích ngược nhưng sẽ được custom phẳng hơn
  textClass,
  title,
  countText,
  icon,
  shadowClass = '',
}) => {
  const isAnchor = href.startsWith('#');
  
  // Style phẳng kiểu iOS: bo góc tròn 20px (height/4), viền nhạt border-neutral-200/80
  const cardClassName = `flex flex-col justify-between w-full rounded-[20px] p-3.5 border border-neutral-200/80 active:scale-95 transition-all duration-200 shadow-sm group ${bgClass} ${bgHoverClass} ${shadowClass}`;

  const cleanCount = countText ? countText.replace(/[()]/g, '').trim() : '0';

  const content = (
    <>
      {/* Header: Icon (Trái) & Số lượng to đậm (Phải) */}
      <div className="flex justify-between items-center w-full">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 shadow-sm border border-neutral-100/30">
          {icon}
        </div>
        
        <span className="font-sans font-bold text-[24px] leading-none tracking-tight text-neutral-800">
          {cleanCount}
        </span>
      </div>

      {/* Footer: Nhãn & mũi tên định hướng */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12.5px] font-sans font-bold leading-none text-neutral-800">
          {title}
        </p>
        <span className={`text-[12px] font-bold group-hover:translate-x-0.5 transition-transform ${textClass}`}>
          →
        </span>
      </div>
    </>
  );

  if (isAnchor) {
    return (
      <a href={href} className={cardClassName}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cardClassName}>
      {content}
    </Link>
  );
};

