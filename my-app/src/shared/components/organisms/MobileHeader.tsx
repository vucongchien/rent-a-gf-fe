import React, { ReactNode } from 'react';

export interface MobileHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
  transparent?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  left,
  center,
  right,
  className = '',
  transparent = false
}) => {
  return (
    <>
      {/* Spacer để giữ không gian (tránh nội dung bị giật khi header fixed), chỉ dùng khi không transparent */}
      {!transparent && <div className="lg:hidden w-full h-[52px] flex-shrink-0" />}

      <header 
        className={`
          lg:hidden fixed top-0 left-0 w-full h-[52px] flex items-center px-2 z-50
          ${transparent 
            ? 'bg-transparent' 
            : 'bg-surface/90 backdrop-blur-md shadow-sm'
          }
          ${className}
        `}
      >
        <div className="flex-1 flex items-center justify-start min-w-0">
          {left}
        </div>
        
        {center && (
          <div className="flex-[2] flex items-center justify-center min-w-0 px-2">
            {center}
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-end min-w-0 gap-1">
          {right}
        </div>
      </header>
    </>
  );
};
