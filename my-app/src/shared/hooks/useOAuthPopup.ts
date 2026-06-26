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
 * Tên channel đồng bộ với bridge HTML trong /api/auth/callback.
 * Phải dùng cùng 1 tên ở cả 2 phía.
 */
const BROADCAST_CHANNEL_NAME = 'rentagf_oauth';

/**
 * useOAuthPopup — Mở popup OAuth, lắng nghe message từ BFF bridge.
 *
 * Pattern (COOP-safe):
 *   - Click button → open popup trỏ tới /api/auth/google
 *   - Popup → IdP login → BFF /api/auth/callback (bridge)
 *   - Bridge gửi BroadcastChannel({type:'oauth', status:'success'|'error'})
 *   - Hook nhận qua BroadcastChannel (không bị block bởi COOP của Google)
 *   - Fallback: window.postMessage nếu BroadcastChannel không hỗ trợ
 *
 * Lý do dùng BroadcastChannel thay vì postMessage:
 *   - Google OAuth page set header Cross-Origin-Opener-Policy: same-origin
 *   - COOP cắt đứt window.opener → postMessage về parent bị block
 *   - BroadcastChannel không cần window.opener, hoạt động xuyên tab/popup cùng origin
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
  const bcRef = useRef<BroadcastChannel | null>(null);

  const cleanup = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (bcRef.current) {
      bcRef.current.close();
      bcRef.current = null;
    }
    popupRef.current = null;
    resolvedRef.current = false;
    setIsLoading(false);
  }, []);

  const handleOAuthMessage = useCallback(
    (data: OAuthMessage) => {
      if (!popupRef.current && !resolvedRef.current) return;
      if (resolvedRef.current) return; // Tránh xử lý 2 lần

      resolvedRef.current = true;
      console.log('[useOAuthPopup] Nhận message OAuth:', data.status);

      if (data.status === 'success') {
        Promise.resolve(onSuccess?.()).finally(cleanup);
      } else {
        onError?.({ code: data.code, message: data.message });
        cleanup();
      }
    },
    [onSuccess, onError, cleanup],
  );

  // Lắng nghe BroadcastChannel (primary — COOP-safe)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bcRef.current = bc;

    bc.onmessage = (event: MessageEvent<OAuthMessage>) => {
      if (!event.data || event.data.type !== 'oauth') return;
      handleOAuthMessage(event.data);
    };

    return () => {
      bc.close();
      bcRef.current = null;
    };
  }, [handleOAuthMessage]);

  // Lắng nghe window.postMessage (fallback — bị block bởi COOP nhưng giữ cho local dev)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Strict origin check — chỉ chấp nhận message từ chính origin của FE
      if (event.origin !== window.location.origin) return;

      const data = event.data as OAuthMessage | undefined;
      if (!data || data.type !== 'oauth') return;

      handleOAuthMessage(data);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleOAuthMessage]);

  // Cleanup khi unmount
  useEffect(() => () => cleanup(), [cleanup]);

  const login = useCallback((): boolean => {
    // Nếu popup cũ còn mở thì focus lại, không mở thêm
    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.focus();
        return true;
      }
    } catch {
      // COOP có thể block p.closed — bỏ qua, mở popup mới
      cleanup();
    }

    const left =
      typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
    const top =
      typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
    const features = `width=${width},height=${height},left=${left},top=${top},popup=1,noopener=0`;

    const popup = window.open(initPath, popupName, features);

    if (!popup) {
      // Browser chặn popup → fallback full-page redirect
      console.warn('[useOAuthPopup] Popup bị chặn, fallback redirect');
      window.location.href = initPath;
      return false;
    }

    popupRef.current = popup;
    resolvedRef.current = false;
    setIsLoading(true);

    // Poll detect popup bị đóng mà chưa nhận message → user huỷ
    // Bọc try/catch vì COOP có thể block p.closed khi popup ở Google domain
    pollTimerRef.current = setInterval(() => {
      try {
        const p = popupRef.current;
        if (!p || p.closed) {
          if (!resolvedRef.current) {
            // User đóng popup trước khi flow hoàn tất → không báo lỗi
            console.log('[useOAuthPopup] Popup đóng trước khi hoàn tất (user huỷ)');
          }
          cleanup();
        }
      } catch {
        // COOP block truy cập p.closed — không làm gì, đợi BroadcastChannel message
        // Không cleanup ở đây vì flow vẫn đang tiếp diễn trong popup
      }
    }, POLL_INTERVAL_MS);

    return true;
  }, [initPath, popupName, width, height, cleanup]);

  return { login, isLoading };
}
