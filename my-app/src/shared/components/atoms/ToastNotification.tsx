"use client";

import * as React from "react";
import { Button } from "./Button";
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoCircleIcon,
  HeartFilledIcon,
  XIcon,
} from "./Icons";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastOptions {
  message: string | React.ReactNode;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "message" | "duration">> {
  id: number;
  title?: string;
  variant: ToastVariant;
  leaving: boolean;
}

export interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const VARIANT_STYLES: Record<
  ToastVariant,
  { accent: string; iconBg: string; iconColor: string; titleColor: string }
> = {
  default: {
    accent: "before:bg-brand",
    iconBg: "bg-brand-muted",
    iconColor: "text-brand-hover",
    titleColor: "text-neutral-900",
  },
  success: {
    accent: "before:bg-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-700",
  },
  error: {
    accent: "before:bg-rose-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    titleColor: "text-rose-700",
  },
  warning: {
    accent: "before:bg-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700",
  },
  info: {
    accent: "before:bg-sky-400",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    titleColor: "text-sky-700",
  },
};

const ToastIcon: React.FC<{ variant: ToastVariant; className?: string }> = ({ variant, className }) => {
  const cls = `w-4 h-4 ${className ?? ""}`;
  switch (variant) {
    case "success":
      return <CheckCircleIcon size={16} className={cls} aria-hidden="true" />;
    case "error":
      return <XCircleIcon size={16} className={cls} aria-hidden="true" />;
    case "warning":
      return <AlertTriangleIcon size={16} className={cls} aria-hidden="true" />;
    case "info":
      return <InfoCircleIcon size={16} className={cls} aria-hidden="true" />;
    default:
      return <HeartFilledIcon size={16} className={cls} aria-hidden="true" />;
  }
};

const ANIMATION_OUT_MS = 220;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const [enteredIds, setEnteredIds] = React.useState<Set<number>>(new Set());
  const timersRef = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, leaving: true } : it)));
    const t = setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
      setEnteredIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    }, ANIMATION_OUT_MS);
    timersRef.current.set(id, t);
  }, []);

  const toast = React.useCallback(
    ({ message, title, variant = "default", duration = 2800 }: ToastOptions) => {
      const id = Date.now() + Math.random();
      const item: ToastItem = { id, message, title, variant, duration, leaving: false };
      setItems((prev) => [...prev, item]);

      // next frame: mark as entered so transition runs from initial → final
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnteredIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        });
      });

      const t = setTimeout(() => remove(id), duration);
      timersRef.current.set(id, t);
    },
    [remove]
  );

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const renderMessageContent = (content: string | React.ReactNode) => {
    if (typeof content !== "string") return content;
    const parts = content.split(/(<em>.*?<\/em>)/g);
    return parts.map((part, index) => {
      if (part.startsWith("<em>") && part.endsWith("</em>")) {
        const cleanText = part.substring(4, part.length - 5);
        return (
          <em key={index} className="not-italic text-brand-hover font-semibold">
            {cleanText}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div
        className="fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2.5 px-4 pointer-events-none sm:bottom-8"
        role="region"
        aria-label="Notifications"
      >
        {items.map((item) => {
          const styles = VARIANT_STYLES[item.variant];
          const entered = enteredIds.has(item.id) && !item.leaving;
          return (
            <div
              key={item.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 min-w-[280px] max-w-[420px] pl-4 pr-3.5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-100 shadow-[0_14px_40px_-12px_rgba(251,105,153,0.28),0_4px_12px_-4px_rgba(0,0,0,0.06)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${styles.accent} transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                entered
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-[0.94]"
              }`}
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full ${styles.iconBg} ${styles.iconColor}`}
              >
                <ToastIcon variant={item.variant} />
              </span>

              <div className="flex-1 min-w-0 pt-0.5">
                {item.title && (
                  <div className={`text-[13px] font-semibold leading-snug ${styles.titleColor}`}>
                    {item.title}
                  </div>
                )}
                <div className="text-sm text-neutral-800 leading-snug break-words">
                  {renderMessageContent(item.message)}
                </div>
              </div>

              <Button
                variant="unstyled"
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Đóng thông báo"
                className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <XIcon size={14} aria-hidden="true" />
              </Button>
            </div>
          );
        })}
      </div>

    </ToastContext.Provider>
  );
};
