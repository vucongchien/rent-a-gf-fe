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
  // Khi có showIcon, chúng ta sẽ ưu tiên ẩn vệt sáng thẳng để tránh vướng víu
  const shouldShowGlowBar = enableGlow && !showIcon;

  // CSS variables truyền xuống inline style để các animation class trong CSS sử dụng
  const styleVariables = {
    "--reveal-duration": `${duration}s`,
    "--reveal-delay": `${delay}s`,
    "--glow-color": glowColor,
    ...style,
  } as React.CSSProperties;

  // Lấy class animation tương ứng cho nội dung
  const revealClass = variant === "feathered" ? "animate-reveal-feathered" : "animate-reveal-sharp";

  // Style phụ trợ cho vệt sáng
  const glowStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "3px",
    background: `linear-gradient(to bottom, transparent, var(--glow-color) 20%, #ffffff 50%, var(--glow-color) 80%, transparent)`,
    boxShadow: `0 0 15px 5px var(--glow-color), 0 0 6px 1px #ffffff`,
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 10,
  };

  // Style phụ trợ cho container bọc icon
  const iconContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    pointerEvents: "none",
    zIndex: 11,
  };

  return (
    <div
      className={`relative inline-block w-full overflow-hidden ${className}`}
      style={styleVariables}
      {...props}
    >
      {/* Container nội dung thực hiện ẩn hiện bằng thuần CSS animation */}
      <div className={revealClass}>{children}</div>

      {/* Vệt sáng di chuyển đè lên trên bằng CSS animation */}
      {shouldShowGlowBar && (
        <div style={glowStyle} className="animate-glow-bar" />
      )}

      {/* Icon Sakura di chuyển, xoay tròn và nhấp nháy phát sáng bằng CSS animation */}
      {showIcon && (
        <div style={iconContainerStyle} className="animate-sakura-container">
          <div className="animate-sakura-glow" style={{ width: iconSize, height: iconSize }}>
            <SakuraIcon size={iconSize} />
          </div>
        </div>
      )}
    </div>
  );
};

WipeReveal.displayName = "WipeReveal";
