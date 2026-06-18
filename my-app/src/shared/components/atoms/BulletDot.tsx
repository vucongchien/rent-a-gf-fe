import React from 'react';

export interface BulletDotProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const BulletDot: React.FC<BulletDotProps> = ({ size = 6, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 6 6"
      fill="currentColor"
      className={`text-neutral-300 flex-shrink-0 ${className}`}
      {...props}
    >
      <circle cx="3" cy="3" r="2" />
    </svg>
  );
};
