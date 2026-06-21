import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SearchIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
    <circle cx="11" cy="11" r="7"/>
    <path d="m20 20-3.2-3.2"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} {...props}>
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} {...props}>
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} {...props}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} {...props}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);

export const SoundsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const CompanionsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export const LogOutIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const HeartIcon: React.FC<IconProps & { fill?: string }> = ({ size = 20, fill = 'none', className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" className={className} {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const SpinnerIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`animate-spin ${className}`} {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const CoinIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M15 9H11.5a2.5 2.5 0 0 0 0 5H15" />
  </svg>
);

export const StarIcon: React.FC<IconProps & { fill?: string }> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`starGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-star-stop-1)" />
          <stop offset="60%" stopColor="var(--color-icon-star-stop-2)" />
          <stop offset="100%" stopColor="var(--color-chizuru-500)" />
        </linearGradient>
      </defs>
      {/* Watercolor color wash */}
      <path
        d="M12 3.3c.5 2 2 3.8 4.6 4.2-2 1.2-2.3 3.5-2.8 5.8-.7-2-1.8-2.6-4.2-3.1 2.1-.8 2.5-3.5 2.8-5.4z"
        fill={`url(#starGrad-${gradId})`}
        opacity="0.95"
      />
      {/* Sketchy brown ink outline */}
      <path
        d="M12 2.5 C12.8 5.5 15.5 6.5 19 7 C16 9 15.5 12.5 17 16 C14 14.5 10 14.5 7 16 C8.5 12.5 8 9 5 7 C8.5 6.5 11.2 5.5 12 2.5 Z"
        fill="none"
        stroke="var(--color-sketch-outline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* White painted highlight */}
      <ellipse cx="10" cy="7.5" rx="0.8" ry="1.2" transform="rotate(-30 10 7.5)" fill="#ffffff" opacity="0.85" />
    </svg>
  );
};

export const MapPinIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`pinGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-pin-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-pin-stop-2)" />
        </linearGradient>
      </defs>
      {/* Color Wash */}
      <path
        d="M11.8 3.2 C7.2 3.2 3.8 6.8 3.8 11.2 C3.8 15 7.5 18.5 11.8 20.2 C16 18.5 19.5 15 19.5 11.2 C19.5 6.8 16.2 3.2 11.8 3.2 Z"
        fill={`url(#pinGrad-${gradId})`}
        opacity="0.9"
      />
      {/* Outline */}
      <path
        d="M12 2.5 C6.8 2.5 3 6.3 3 11.5 C3 16 7.5 19.8 12 21.8 C16.5 19.8 21 16 21 11.5 C21 6.3 17.2 2.5 12 2.5 Z"
        fill="none"
        stroke="var(--color-sketch-outline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center dot */}
      <circle cx="12" cy="11" r="2.8" fill="var(--color-sketch-outline)" opacity="0.85" />
      {/* Glossy highlight */}
      <circle cx="9" cy="7.2" r="1" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const ClockIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`clockGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-clock-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-clock-stop-2)" />
        </linearGradient>
      </defs>
      {/* Color Wash */}
      <circle cx="12.2" cy="12.2" r="8.2" fill={`url(#clockGrad-${gradId})`} opacity="0.9" />
      {/* Outline */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Hands */}
      <circle cx="12" cy="12" r="1.8" fill="var(--color-sketch-outline)" />
      <path d="M12 12 L12 7.5" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12 L15 14" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      {/* Highlight */}
      <ellipse cx="8.5" cy="8.5" rx="0.8" ry="1.2" transform="rotate(-30 8.5 8.5)" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`calGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-cal-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-cal-stop-2)" />
        </linearGradient>
      </defs>
      {/* Color Wash */}
      <rect x="3.2" y="5.2" width="17.6" height="14.6" rx="3.5" ry="3.5" fill={`url(#calGrad-${gradId})`} opacity="0.9" />
      {/* Outline */}
      <rect x="3" y="5" width="18" height="15" rx="4" ry="4" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10 L21 10" stroke="var(--color-sketch-outline)" strokeWidth="1.8" />
      {/* Binders */}
      <path d="M8 2.5 L8 6.5" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2.5 L16 6.5" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      {/* Days */}
      <circle cx="8" cy="14" r="1" fill="var(--color-sketch-outline)" />
      <circle cx="12" cy="14" r="1" fill="var(--color-sketch-outline)" />
      <circle cx="16" cy="14" r="1" fill="var(--color-sketch-outline)" />
      <circle cx="8" cy="17" r="1" fill="var(--color-sketch-outline)" />
      <circle cx="12" cy="17" r="1" fill="var(--color-sketch-outline)" />
      <circle cx="16" cy="17" r="1" fill="var(--color-sketch-outline)" />
      {/* Highlight */}
      <ellipse cx="6" cy="7.5" rx="0.6" ry="1" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const InfoIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`infoGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-info-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-info-stop-2)" />
        </linearGradient>
      </defs>
      {/* Color Wash */}
      <circle cx="12.2" cy="12.2" r="8.2" fill={`url(#infoGrad-${gradId})`} opacity="0.9" />
      {/* Outline */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Letter i */}
      <path d="M12 11.5 L12 16" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill="var(--color-sketch-outline)" />
      {/* Highlight */}
      <ellipse cx="8.5" cy="8.5" rx="0.8" ry="1.2" transform="rotate(-30 8.5 8.5)" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`checkGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-check-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-check-stop-2)" />
        </linearGradient>
      </defs>
      {/* Color wash */}
      <path
        d="M4 12.5 C6.5 14.5 9 17.5 9 17.5 C9 17.5 15.5 10.5 19 6.5"
        fill="none"
        stroke={`url(#checkGrad-${gradId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Ink Outline */}
      <path
        d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
        fill="none"
        stroke="var(--color-sketch-outline)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight */}
      <circle cx="17.2" cy="8" r="0.8" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const NotebookIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`noteGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-note-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-note-stop-2)" />
        </linearGradient>
      </defs>
      <rect x="4.5" y="3.5" width="15" height="17" rx="3" fill={`url(#noteGrad-${gradId})`} opacity="0.9" />
      <rect x="4" y="3" width="16" height="18" rx="3" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6.5 h-2 M4 11.5 h-2 M4 16.5 h-2" stroke="var(--color-sketch-outline)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7 h8 M8 11 h8 M8 15 h8" stroke="var(--color-sketch-outline)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M12 12c.5-.5 1-.2 1 .3 0 .5-.7.9-1 .9-.3 0-1-.4-1-.9 0-.5.5-.8 1-.3z" fill="var(--color-chizuru-500)" stroke="var(--color-sketch-outline)" strokeWidth="1" />
      <ellipse cx="7" cy="5.5" rx="0.6" ry="1" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

export const GraduationIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`gradIcon-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-grad-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-grad-stop-2)" />
        </linearGradient>
      </defs>
      <path d="M12 4 L21 8 L12 12 L3 8 Z" fill={`url(#gradIcon-${gradId})`} opacity="0.9" />
      <path d="M12 4 L21 8 L12 12 L3 8 Z" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5 V15.5 C6 17.5 8.7 19 12 19 C15.3 19 18 17.5 18 15.5 V10.5" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8.5 V14.5" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="21" cy="14.5" r="1.5" fill="var(--color-icon-pin-stop-2)" stroke="var(--color-sketch-outline)" strokeWidth="1" />
    </svg>
  );
};

export const CakeIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`cakeGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-cake-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-cake-stop-2)" />
        </linearGradient>
      </defs>
      <rect x="4.2" y="11.2" width="15.6" height="8.6" rx="2" fill={`url(#cakeGrad-${gradId})`} opacity="0.9" />
      <rect x="4" y="11" width="16" height="9" rx="2" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7 V11 M12 6 V11 M16 7 V11" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="5.5" r="1" fill="var(--color-icon-cake-candle)" />
      <circle cx="12" cy="4.5" r="1" fill="var(--color-icon-cake-candle)" />
      <circle cx="16" cy="5.5" r="1" fill="var(--color-icon-cake-candle)" />
    </svg>
  );
};

export const GenderFemaleIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`femGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-fem-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-fem-stop-2)" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="8.2" r="5.2" fill={`url(#femGrad-${gradId})`} opacity="0.9" />
      <circle cx="12" cy="8" r="5.5" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13.5 V21.5 M8.5 17.5 H15.5" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const GenderMaleIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
      <defs>
        <linearGradient id={`maleGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-icon-male-stop-1)" />
          <stop offset="100%" stopColor="var(--color-icon-male-stop-2)" />
        </linearGradient>
      </defs>
      <circle cx="9.2" cy="14.8" r="5.2" fill={`url(#maleGrad-${gradId})`} opacity="0.9" />
      <circle cx="9" cy="15" r="5.5" fill="none" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 10.5 L19.5 4.5 M15 4.5 H19.5 V9" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const UserIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

export const SakuraIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => {
  const gradId = React.useId().replace(/:/g, "-");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={`sakuraGrad1-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-chizuru-50)" />
          <stop offset="40%" stopColor="var(--color-chizuru-500)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-chizuru-600)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`sakuraGrad2-${gradId}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
          <stop offset="60%" stopColor="var(--color-chizuru-500)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-sumi-600)" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      
      {/* Các đốm màu nước loang xung quanh */}
      <circle cx="28" cy="22" r="3" fill="var(--color-chizuru-500)" opacity="0.6" />
      <circle cx="78" cy="32" r="2" fill="var(--color-sumi-500)" opacity="0.5" />
      <circle cx="70" cy="76" r="3" fill="var(--color-sumi-100)" opacity="0.6" />
      <circle cx="32" cy="74" r="2.5" fill="var(--color-chizuru-500)" opacity="0.5" />
      
      {/* Các tia sáng lấp lánh (sparkles) */}
      <path d="M 20,40 Q 20,45 25,45 Q 20,45 20,50 Q 20,45 15,45 Q 20,45 20,40" fill="var(--color-mami-500)" opacity="0.8" />
      <path d="M 80,55 Q 80,60 85,60 Q 80,60 80,65 Q 80,60 75,60 Q 80,60 80,55" fill="var(--color-mami-500)" opacity="0.8" />

      {/* Lớp màu nước nền thứ nhất */}
      <path 
        d="M50 25 C45 10, 25 12, 32 30 C15 32, 10 52, 28 58 C18 73, 35 88, 48 76 C55 90, 75 88, 68 70 C85 68, 90 48, 72 42 C82 27, 65 12, 50 25 Z" 
        fill={`url(#sakuraGrad1-${gradId})`} 
        opacity="0.85" 
      />
      
      {/* Lớp màu nước nền thứ hai */}
      <path 
        d="M50 28 C46 14, 28 16, 34 32 C18 34, 14 53, 30 59 C20 74, 37 87, 49 76 C56 89, 74 87, 68 71 C84 69, 88 50, 72 44 C80 30, 64 16, 50 28 Z" 
        fill={`url(#sakuraGrad2-${gradId})`} 
        opacity="0.75" 
      />

      {/* Đường viền vẽ tay nguệch ngoạc */}
      <path 
        d="M50 25 
           C46 15, 30 14, 33 29 
           C16 30, 11 48, 26 55 
           C17 68, 32 82, 46 72 
           C52 84, 69 82, 64 67 
           C79 65, 84 48, 69 41 
           C77 28, 62 15, 50 25 Z" 
        stroke="var(--color-sketch-outline)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.8"
      />
      
      {/* Các gân cánh hoa vẽ tay */}
      <path d="M50 50 Q45 38 48 30" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M50 50 Q38 42 32 40" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M50 50 Q42 58 38 68" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M50 50 Q58 58 62 68" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M50 50 Q58 42 66 38" stroke="var(--color-sketch-outline)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

      {/* Nhụy hoa */}
      <circle cx="50" cy="50" r="4" fill="var(--color-accent)" stroke="var(--color-sketch-outline)" strokeWidth="1.5" />
      <circle cx="47" cy="46" r="1.5" fill="var(--color-chizuru-600)" />
      <circle cx="53" cy="47" r="1.5" fill="var(--color-chizuru-600)" />
      <circle cx="51" cy="53" r="1.5" fill="var(--color-chizuru-600)" />
      <circle cx="46" cy="52" r="1.5" fill="var(--color-chizuru-600)" />

      {/* Điểm nhấn highlight trắng */}
      <path d="M 40,28 A 6,6 0 0,1 46,34" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M 68,36 A 6,6 0 0,1 72,42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
};

export const CalendarXIcon: React.FC<IconProps> = ({ size = 28, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
    <line x1="10" x2="14" y1="14" y2="18"/>
    <line x1="14" x2="10" y1="14" y2="18"/>
  </svg>
);

export const OfflineIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18.364 5.636a9 9 0 0 1 0 12.728m0-12.728l-1.286 1.286m1.286-1.286a9 9 0 0 0-12.728 0M12 2v2m-9 9H2m20 0h-1m-1.114-6.364l-1.414 1.414M6.364 17.636l-1.414 1.414m11.536 0l-1.414-1.414M6.364 6.364l-1.414-1.414" />
  </svg>
);

/**
 * BriefcaseIcon — Icon túi xách làm việc, style stroke đồng bộ với nav icons
 * Dùng cho nút CompanionModeToggle
 */
export const BriefcaseIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
    <path d="M2 13h20"/>
  </svg>
);

/**
 * CalendarLineIcon — Icon lịch biểu dạng stroke-only đồng bộ trên NavBar
 */
export const CalendarLineIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/**
 * CheckLineIcon — Icon dấu check dạng stroke-only đồng bộ trên NavBar
 */
export const CheckLineIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/**
 * SwitchIcon — Icon hai mũi tên đảo chiều dùng cho nút chuyển đổi không gian trên NavBar
 */
export const SwitchIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m21 9-4-4-4 4"/>
    <path d="M3 9h18"/>
    <path d="m3 15 4 4 4-4"/>
    <path d="M21 15H3"/>
  </svg>
);

/**
 * DashboardIcon — Icon dạng lưới đại diện cho trang tổng quan Dashboard của Companion
 */
export const DashboardIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1"/>
    <rect x="14" y="3" width="7" height="5" rx="1"/>
    <rect x="14" y="12" width="7" height="9" rx="1"/>
    <rect x="3" y="16" width="7" height="5" rx="1"/>
  </svg>
);

/**
 * SmileLickDoodle — Nét vẽ tay mặt cười lè lưỡi lớn trên thẻ stats
 */
export const SmileLickDoodle: React.FC<IconProps> = ({ size = 80, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`stroke-emerald-700 stroke-[4.5] stroke-linecap-round stroke-linejoin-round opacity-80 ${className}`} {...props}>
    <circle cx="50" cy="50" r="38" strokeDasharray="5 5" className="opacity-25" />
    <circle cx="36" cy="40" r="3.5" fill="currentColor" className="text-emerald-700" />
    <circle cx="64" cy="40" r="3.5" fill="currentColor" className="text-emerald-700" />
    <path d="M 40 59 Q 45 74 54 74 Q 59 70 56 59" fill="var(--color-chizuru-100)" className="stroke-emerald-700 stroke-[3.5]" />
    <path d="M 30 55 Q 50 63 70 55" />
  </svg>
);

/**
 * SmileDoodleBlue — Nét vẽ mặt cười xanh trên quick actions card
 */
export const SmileDoodleBlue: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={`stroke-blue-700 stroke-[3] stroke-linecap-round stroke-linejoin-round ${className}`} {...props}>
    <circle cx="22" cy="25" r="2" fill="currentColor" className="text-blue-800" />
    <circle cx="38" cy="25" r="2" fill="currentColor" className="text-blue-800" />
    <path d="M 18 35 Q 30 45 42 35" />
    <path d="M 26 12 Q 28 8 32 10" />
    <path d="M 28 11 Q 33 5 36 11" />
  </svg>
);

/**
 * SmileDoodleYellow — Nét vẽ mặt cười vàng trên quick actions card
 */
export const SmileDoodleYellow: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={`stroke-amber-800 stroke-[3] stroke-linecap-round stroke-linejoin-round ${className}`} {...props}>
    <circle cx="22" cy="25" r="2" fill="currentColor" className="text-amber-800" />
    <circle cx="38" cy="25" r="2" fill="currentColor" className="text-amber-800" />
    <path d="M 20 38 Q 30 32 40 38" />
    <path d="M 42 20 Q 48 22 45 26 T 46 32" />
    <path d="M 18 20 Q 12 22 15 26 T 14 32" />
  </svg>
);

/**
 * SmileDoodlePurple — Nét vẽ mặt cười tím trên quick actions card
 */
export const SmileDoodlePurple: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={`stroke-purple-700 stroke-[3] stroke-linecap-round stroke-linejoin-round ${className}`} {...props}>
    <path d="M 18 25 L 24 23 L 18 21" />
    <path d="M 42 25 L 36 23 L 42 21" />
    <path d="M 22 36 Q 30 46 38 36" />
    <path d="M 12 14 Q 10 10 13 8 Q 15 8 16 11 Q 17 8 19 8 Q 22 10 20 14 L 16 18 Z" fill="var(--color-chizuru-50)" className="stroke-purple-700 stroke-[2]" />
  </svg>
);

/**
 * AvatarGreenDoodle — Avatar xanh lá cho danh sách booking
 */
export const AvatarGreenDoodle: React.FC<IconProps> = ({ size = 28, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`stroke-emerald-700 stroke-[3.5] stroke-linecap-round ${className}`} {...props}>
    <circle cx="15" cy="18" r="1.5" fill="currentColor" className="text-emerald-700" />
    <circle cx="25" cy="18" r="1.5" fill="currentColor" className="text-emerald-700" />
    <path d="M 13 26 Q 20 31 27 26" />
    <path d="M 14 11 Q 17 6 20 11 T 26 11" />
  </svg>
);

/**
 * AvatarOrangeDoodle — Avatar cam cho danh sách booking
 */
export const AvatarOrangeDoodle: React.FC<IconProps> = ({ size = 28, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`stroke-orange-600 stroke-[3.5] stroke-linecap-round ${className}`} {...props}>
    <path d="M 12 17 Q 15 14 17 17" />
    <path d="M 23 17 Q 25 14 28 17" />
    <path d="M 15 25 Q 20 20 25 25" />
    <path d="M 18 24 Q 20 31 22 30 Q 23 28 22 24" fill="var(--color-mami-100)" className="stroke-orange-600 stroke-[2.5]" />
  </svg>
);

/**
 * AvatarPinkDoodle — Avatar hồng cho danh sách booking
 */
export const AvatarPinkDoodle: React.FC<IconProps> = ({ size = 28, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`stroke-rose-600 stroke-[3.5] stroke-linecap-round ${className}`} {...props}>
    <circle cx="15" cy="18" r="1.5" fill="currentColor" className="text-rose-600" />
    <circle cx="25" cy="18" r="1.5" fill="currentColor" className="text-rose-600" />
    <path d="M 14 25 Q 20 31 26 24" />
    <path d="M 8 13 Q 6 10 9 8 Q 11 8 12 11 Q 13 8 15 8 Q 18 10 16 13 L 12 17 Z" fill="var(--color-chizuru-100)" stroke="none" />
  </svg>
);


/**
 * TrendingUpIcon — Icon biểu diễn xu hướng tăng, stroke-only đồng bộ
 */
export const TrendingUpIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);


