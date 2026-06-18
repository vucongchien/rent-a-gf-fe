"use client";

import * as React from "react";
import { SakuraIcon } from "./Icons";

export type WipeRevealVariant = "feathered" | "sharp";

export interface WipeRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: WipeRevealVariant;
  duration?: number; // tính bằng giây (seconds)
  delay?: number; // tính bằng giây (seconds)
  enableGlow?: boolean; // bật/tắt vệt sáng quét qua (tự động tắt khi showIcon=true)
  glowColor?: string; // màu sắc tùy chỉnh của vệt sáng
  showIcon?: boolean; // bật/tắt hiển thị icon hoa anh đào dẫn đường
  iconSize?: number; // kích thước icon (px)
  className?: string;
}

export const WipeReveal: React.FC<WipeRevealProps> = ({
  children,
  variant = "feathered",
  duration = 0.8,
  delay = 0,
  enableGlow = true,
  glowColor = "#FFB6C1", // Mặc định màu hồng pastel của Chizuru
  showIcon = false,
  iconSize = 28,
  className = "",
  style,
  ...props
}) => {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [isAnimFinished, setIsAnimFinished] = React.useState(false);

  // Khi có showIcon, chúng ta sẽ ưu tiên ẩn vệt sáng thẳng để tránh vướng víu
  const shouldShowGlowBar = enableGlow && !showIcon;

  React.useEffect(() => {
    // 1. Kích hoạt animation ngay sau khi mount
    const timerReveal = setTimeout(() => {
      setIsRevealed(true);
    }, 50);

    // 2. Kích hoạt timer ẩn vệt sáng & icon sau khi hoàn tất animation quét
    let timerFinish: NodeJS.Timeout;
    if (shouldShowGlowBar || showIcon) {
      const totalTimeMs = (duration + delay) * 1000;
      timerFinish = setTimeout(() => {
        setIsAnimFinished(true);
      }, totalTimeMs);
    }

    return () => {
      clearTimeout(timerReveal);
      if (timerFinish) clearTimeout(timerFinish);
    };
  }, [duration, delay, shouldShowGlowBar, showIcon]);

  // Thiết lập style hiển thị của nội dung (che/hiện bằng Mask hoặc ClipPath)
  const getRevealStyle = (): React.CSSProperties => {
    if (variant === "feathered") {
      return {
        WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 40%, transparent 60%, transparent 100%)",
        WebkitMaskSize: "250% 100%",
        WebkitMaskPosition: isRevealed ? "0% 0" : "150% 0",
        maskImage: "linear-gradient(to right, #000 0%, #000 40%, transparent 60%, transparent 100%)",
        maskSize: "250% 100%",
        maskPosition: isRevealed ? "0% 0" : "150% 0",
        transition: `mask-position ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1), -webkit-mask-position ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1)`,
        willChange: "mask-position, -webkit-mask-position",
      };
    } else {
      return {
        clipPath: isRevealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        transition: `clip-path ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1)`,
        willChange: "clip-path",
      };
    }
  };

  // Thiết lập style cho vệt sáng quét qua (chỉ dùng khi không có icon)
  const getGlowStyle = (): React.CSSProperties => {
    return {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: isRevealed ? "100%" : "0%",
      width: "3px",
      background: `linear-gradient(to bottom, transparent, ${glowColor} 20%, #ffffff 50%, ${glowColor} 80%, transparent)`,
      boxShadow: `0 0 15px 5px ${glowColor}, 0 0 6px 1px #ffffff`,
      transform: "translateX(-50%)",
      transition: `left ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out`,
      pointerEvents: "none",
      opacity: isRevealed && !isAnimFinished ? 1 : 0,
      zIndex: 10,
    };
  };

  // Thiết lập container cho icon Sakura trượt ngang và xoay tròn
  const getIconContainerStyle = (): React.CSSProperties => {
    const rotateDeg = isRevealed ? "360deg" : "0deg";
    return {
      position: "absolute",
      top: "50%",
      left: isRevealed ? "100%" : "0%",
      transform: `translate(-50%, -50%) rotate(${rotateDeg})`,
      transition: `left ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1), transform ${duration}s ${delay}s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out`,
      pointerEvents: "none",
      opacity: isRevealed && !isAnimFinished ? 1 : 0,
      zIndex: 11,
    };
  };

  return (
    <div
      className={`relative inline-block w-full overflow-hidden ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Container nội dung thực hiện ẩn hiện */}
      <div style={getRevealStyle()}>{children}</div>

      {/* Vệt sáng di chuyển đè lên trên (chỉ hiện khi không dùng icon) */}
      {shouldShowGlowBar && <div style={getGlowStyle()} />}

      {/* Icon Sakura di chuyển và xoay tròn, kết hợp animation nhún nhảy và tỏa sáng mượt mà */}
      {showIcon && (
        <div style={getIconContainerStyle()}>
          <div className="animate-sakura-glow" style={{ width: iconSize, height: iconSize }}>
            <SakuraIcon size={iconSize} />
          </div>
        </div>
      )}
    </div>
  );
};

WipeReveal.displayName = "WipeReveal";
