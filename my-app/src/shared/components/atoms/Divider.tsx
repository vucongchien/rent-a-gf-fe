import React from 'react';

export interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <div className={`h-px bg-neutral-100 my-2.5 mx-1 ${className}`} />;
};
