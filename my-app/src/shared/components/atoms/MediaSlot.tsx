import * as React from "react";

export interface MediaSlotProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  aspectRatio?: "1/1" | "4/3.4" | "4/3" | "auto";
  radius?: number; // border radius in px
  tint?: "pink" | "blue" | "lime" | "neutral";
  className?: string;
  children?: React.ReactNode;
}

export const MediaSlot: React.FC<MediaSlotProps> = ({
  src,
  alt = "Media Slot",
  placeholder = "No Image Available",
  aspectRatio = "1/1",
  radius = 17,
  tint = "neutral",
  className = "",
  children,
}) => {
  // Map tint properties to repeating checkerboard background gradients
  const getPlaceholderStyle = (): React.CSSProperties => {
    switch (tint) {
      case "pink":
        return {
          background: "repeating-linear-gradient(135deg, #fdeef4 0 14px, #fbe6ef 14px 28px)",
        };
      case "blue":
        return {
          background: "repeating-linear-gradient(135deg, #eef6f9 0 14px, #e7f1f6 14px 28px)",
        };
      case "lime":
        return {
          background: "repeating-linear-gradient(135deg, #f4f7e6 0 14px, #eef3da 14px 28px)",
        };
      case "neutral":
      default:
        return {
          background: "repeating-linear-gradient(135deg, #f5f5f5 0 14px, #e5e5e5 14px 28px)",
        };
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1/1":
        return "aspect-square";
      case "4/3.4":
        return "aspect-[4/3.4]";
      case "4/3":
        return "aspect-[4/3]";
      case "auto":
      default:
        return "";
    }
  };

  const containerStyle: React.CSSProperties = {
    borderRadius: `${radius}px`,
  };

  return (
    <div
      className={`relative overflow-hidden w-full select-none ${getAspectClass()} ${className}`}
      style={{
        ...containerStyle,
        ...(!src ? getPlaceholderStyle() : {}),
      }}
    >
      {src ? (
        // Using native <img> to avoid SSR domain whitelist limitations for external third-party URLs.
        // Can be easily migrated to next/image once domains are finalized.
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-medium">
            {placeholder}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

MediaSlot.displayName = "MediaSlot";
