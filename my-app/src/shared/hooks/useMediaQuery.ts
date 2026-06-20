'use client';

import { useSyncExternalStore } from 'react';

/**
 * Custom hook to detect media query matches (e.g. mobile/desktop breakpoints).
 * Safe for SSR (returns false on server initially).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
