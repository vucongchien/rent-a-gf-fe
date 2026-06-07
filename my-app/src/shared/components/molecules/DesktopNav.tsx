import React from 'react';
import { NavLink } from '../atoms/NavLink';

export const DesktopNav: React.FC = () => {
  return (
    <nav className="hidden md:flex gap-[2px] ml-[10px]">
      {['Explore', 'Companions', 'Sounds'].map((label) => (
        <NavLink
          key={label}
          href={label === 'Explore' ? '/explore' : `/${label.toLowerCase()}`}
          label={label}
        />
      ))}
    </nav>
  );
};
