'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook giúp tạo hiệu ứng số chạy tăng/giảm dần mượt mà sử dụng requestAnimationFrame.
 * @param targetValue Giá trị đích cần đạt tới.
 * @param duration Thời gian diễn ra animation (mili giây). Mặc định là 800ms.
 */
export function useAnimatedNumber(targetValue: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValueRef = useRef(targetValue);

  useEffect(() => {
    const start = previousValueRef.current;
    const end = targetValue;
    if (start === end) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuad (giúp số chạy chậm dần về cuối)
      const easeProgress = progress * (2 - progress);
      const current = Math.round(easeProgress * (end - start) + start);
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        previousValueRef.current = end;
      }
    };

    const animFrameId = window.requestAnimationFrame(step);
    
    return () => {
      window.cancelAnimationFrame(animFrameId);
    };
  }, [targetValue, duration]);

  return displayValue;
}
