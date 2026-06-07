'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavLinkProps {
  href: string;
  label: string;
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/explore' && pathname === '/');

  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center px-3.5 py-2 rounded-md font-sans text-sm font-medium transition-all duration-150 select-none cursor-pointer border border-transparent
        ${isActive
          ? 'text-neutral-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-neutral-100 font-bold'
          : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
        }
        ${className}
      `}
    >
      {label}
    </Link>
  );
};
