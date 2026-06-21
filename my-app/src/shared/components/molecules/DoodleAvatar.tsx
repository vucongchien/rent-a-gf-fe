import React from 'react';

interface DoodleAvatarProps {
  name: string;
  index: number;
  className?: string;
}

export const DoodleAvatar: React.FC<DoodleAvatarProps> = ({ name, index, className = '' }) => {
  const firstLetter = name ? name.trim().charAt(0).toUpperCase() : '?';

  // Chọn màu nền pastel dựa trên index
  const bgClasses = [
    'bg-ruka-100',      // Mint
    'bg-mami-100',      // Vàng
    'bg-chizuru-100',   // Hồng
  ];
  const bgClass = bgClasses[index % bgClasses.length];

  // Tạo góc nghiêng nhẹ ngẫu hứng kiểu vẽ tay
  const rotateClasses = [
    'rotate-2',
    '-rotate-3',
    'rotate-1',
    '-rotate-2',
  ];
  const rotateClass = rotateClasses[index % rotateClasses.length];

  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center border-[1.8px] border-sketch-outline shrink-0 select-none shadow-[0_3px_6px_rgba(74,54,30,0.08)] ${bgClass} ${rotateClass} ${className}`}
      data-testid="doodle-avatar"
    >
      <span className="font-display font-black text-lg text-sketch-outline leading-none mt-0.5">
        {firstLetter}
      </span>
    </div>
  );
};
