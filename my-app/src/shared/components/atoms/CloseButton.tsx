import React from 'react';
import { XIcon } from './Icons';

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose: () => void;
  size?: number;
  variant?: 'ghost' | 'outline';
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  size = 18,
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const baseClasses = 'w-9 h-9 flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
  
  const variantClasses = {
    ghost: 'rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
    outline: 'rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100',
  };

  return (
    <button
      type="button"
      onClick={onClose}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <XIcon size={size} />
    </button>
  );
};
