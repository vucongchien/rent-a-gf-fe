import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CompassIcon,
  ChatIcon,
  HistoryIcon,
  SoundsIcon,
  CompanionsIcon,
} from '../atoms/Icons';

const NAV_ITEMS = [
  { href: '/explore',     label: 'Explore',     icon: CompassIcon,    live: true },
  { href: '/companions',  label: 'Companions',  icon: CompanionsIcon, live: true },
  { href: '/sounds',      label: 'Sounds',      icon: SoundsIcon,     live: true },
  { href: '#',            label: 'Chat',        icon: ChatIcon,       live: false },
  { href: '#',            label: 'Lịch sử đặt', icon: HistoryIcon,   live: false },
];

export interface SidebarNavListProps {
  onItemClick: () => void;
}

export const SidebarNavList: React.FC<SidebarNavListProps> = ({ onItemClick }) => {
  const pathname = usePathname();

  return (
    <div className="mb-1">
      {NAV_ITEMS.filter((i) => i.live).map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            onClick={onItemClick}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              font-sans text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-chizuru-50 text-chizuru-600'
                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
              }
            `}
          >
            <Icon size={18} className={isActive ? 'text-chizuru-600' : 'text-neutral-400'} />
            {label}
          </Link>
        );
      })}
    </div>
  );
};
