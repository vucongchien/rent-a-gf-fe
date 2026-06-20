'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

export interface UseNavIndicatorProps {
  active: string | undefined;
  mobile: boolean;
  showLabels: boolean;
  effect: 'pill' | 'underline' | 'dot' | 'blob' | 'bounce';
  accent: string;
  spring: number;
}

export function useNavIndicator({
  active,
  mobile,
  showLabels,
  effect,
  accent,
  spring,
}: UseNavIndicatorProps) {
  const [ind, setInd] = useState({ x: 0, y: 0, w: 0, h: 0, cx: 0, bottom: 0, ready: false });
  const [wobble, setWobble] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | HTMLAnchorElement | null>>({});
  
  const [indId] = useState(() => `nbi-${Math.random().toString(36).slice(2, 8)}`);

  const s = spring / 100;
  const bezier = `cubic-bezier(0.34, ${(1 + s * 0.85).toFixed(3)}, 0.5, 1)`;
  const dur = Math.round(260 + s * 240);
  const wobbleAmt = (0.08 + s * 0.18).toFixed(3);

  // Đo đạc tọa độ indicator
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!active) return;
    const btn = btnRefs.current[active];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setInd({
      x: br.left - lr.left,
      y: br.top - lr.top,
      w: br.width,
      h: br.height,
      cx: br.left - lr.left + br.width / 2,
      bottom: br.top - lr.top + br.height,
      ready: true,
    });
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const r = requestAnimationFrame(measure);
    const t = setTimeout(measure, 240);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
    };
  }, [active, mobile, showLabels, effect, accent, measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const ro = new ResizeObserver(measure);
    ro.observe(list);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Kích hoạt wobble animation khi bấm
  const triggerWobble = useCallback(() => {
    setWobble((w) => w + 1);
  }, []);

  // Áp dụng animation cho element chỉ mục
  useEffect(() => {
    if (wobble === 0) return;
    const el = document.getElementById(indId);
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth; // Trigger reflow
    el.style.animation = `nb-gummy ${dur}ms ${bezier}`;
  }, [wobble, dur, bezier, indId]);

  return {
    ind,
    indId,
    listRef,
    btnRefs,
    wobble,
    triggerWobble,
    dur,
    bezier,
    wobbleAmt,
  };
}
