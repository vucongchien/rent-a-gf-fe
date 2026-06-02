"use client";

import * as React from "react";

export interface ToastOptions {
  message: string | React.ReactNode;
  duration?: number;
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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState<string | React.ReactNode>("");
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const toast = React.useCallback(({ message: msg, duration = 2600 }: ToastOptions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage(msg);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, duration);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Safe helper to render <em> tags dynamically inside toast message strings
  const renderMessageContent = (content: string | React.ReactNode) => {
    if (typeof content !== "string") return content;

    const parts = content.split(/(<em>.*?<\/em>)/g);
    return parts.map((part, index) => {
      if (part.startsWith("<em>") && part.endsWith("</em>")) {
        const cleanText = part.substring(4, part.length - 5);
        return (
          <em key={index} className="not-italic text-brand font-bold mx-1">
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

      {/* Toast Notification Container */}
      <div
        className={`fixed left-1/2 bottom-[26px] -translate-x-1/2 z-50 px-6 py-3 rounded-[14px] bg-neutral-900 text-white text-sm font-medium shadow-[0_14px_30px_-12px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300 ease-out select-none ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-5 scale-95"
        }`}
        role="alert"
        aria-live="polite"
      >
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {renderMessageContent(message)}
        </span>
      </div>
    </ToastContext.Provider>
  );
};
