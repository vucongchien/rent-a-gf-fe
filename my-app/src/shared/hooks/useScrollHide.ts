'use client';

import { useState, useEffect, useRef } from 'react';

export interface UseScrollHideProps {
  scrollHide: boolean;
}

export function useScrollHide({ scrollHide }: UseScrollHideProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(scrollHide ? (y > lastScroll.current && y > 90) : false);
      lastScroll.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollHide]);

  return { hidden, scrolled };
}
export default useScrollHide;
