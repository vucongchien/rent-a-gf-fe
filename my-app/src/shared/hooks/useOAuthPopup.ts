'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type OAuthMessage =
  | { type: 'oauth'; status: 'success' }
  | { type: 'oauth'; status: 'error'; code?: string; message?: string };

export interface UseOAuthPopupOptions {
  /** Path init trên BFF, mặc định /api/auth/google */
  initPath?: string;
  /** Callback chạy khi nhận status: 'success' (sau khi cookie đã set) */
  onSuccess?: () => void | Promise<void>;
  /** Callback chạy khi nhận status: 'error' */
  onError?: (err: { code?: string; message?: string }) => void;
  /** Tên popup window (reuse 1 popup nếu trùng tên) */
  popupName?: string;
  /** Width/height popup */
  width?: number;
  height?: number;
}

export interface UseOAuthPopupReturn {
  /** Mở popup login. Trả về true nếu popup mở thành công. */
  login: () => boolean;
  /** Có đang xử lý OAuth không (popup đang mở hoặc đang refresh /me) */
  isLoading: boolean;
}

const POLL_INTERVAL_MS = 500;

/**
 * useOAuthPopup — Mở popup OAuth, lắng nghe postMessage từ BFF bridge.
 *
 * Pattern:
 *   - Click button → open popup trỏ tới /api/auth/google
 *   - Popup → BE init → IdP login → BE callback → BFF /api/auth/callback (bridge)
 *   - Bridge postMessage({type:'oauth', status:'success'|'error'}) về window.opener
 *   - Hook check event.origin === window.location.origin nghiêm ngặt
 *   - success → onSuccess() (caller thường gọi refresh /api/auth/me)
 *   - error → onError(toast)
 *   - popup bị đóng trước khi nhận message → coi là user huỷ (không lỗi)
 *   - popup === null (browser chặn) → fallback full-page redirect tới initPath
 */
export function useOAuthPopup(options: UseOAuthPopupOptions = {}): UseOAuthPopupReturn {
  const {
    initPath = '/api/auth/google',
    onSuccess,
    onError,
    popupName = 'rentagf_oauth',
    width = 520,
    height = 640,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    popupRef.current = null;
    resolvedRef.current = false;
    setIsLoading(false);
  }, []);

  // Listen message một lần, dùng ref-based handlers để không gắn/gỡ liên tục
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Strict origin check — chỉ chấp nhận message từ chính origin của FE
      if (event.origin !== window.location.origin) return;

      const data = event.data as OAuthMessage | undefined;
      if (!data || data.type !== 'oauth') return;
      if (!popupRef.current) return;

      resolvedRef.current = true;

      if (data.status === 'success') {
        Promise.resolve(onSuccess?.()).finally(cleanup);
      } else {
        onError?.({ code: data.code, message: data.message });
        cleanup();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError, cleanup]);

  // Cleanup khi unmount
  useEffect(() => () => cleanup(), [cleanup]);

  const login = useCallback((): boolean => {
    // Nếu popup cũ còn mở thì focus lại, không mở thêm
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return true;
    }

    const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
    const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
    const features = `width=${width},height=${height},left=${left},top=${top},popup=1,noopener=0`;

    const popup = window.open(initPath, popupName, features);

    if (!popup) {
      // Browser chặn popup → fallback full-page redirect
      window.location.href = initPath;
      return false;
    }

    popupRef.current = popup;
    resolvedRef.current = false;
    setIsLoading(true);

    // Poll detect popup bị đóng mà chưa nhận message → user huỷ
    pollTimerRef.current = setInterval(() => {
      const p = popupRef.current;
      if (!p || p.closed) {
        if (!resolvedRef.current) {
          // User đóng popup trước khi flow hoàn tất → không báo lỗi
        }
        cleanup();
      }
    }, POLL_INTERVAL_MS);

    return true;
  }, [initPath, popupName, width, height, cleanup]);

  return { login, isLoading };
}
