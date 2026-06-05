import * as React from "react";

export interface MediaSlotProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  aspectRatio?: "1/1" | "4/3.4" | "4/3" | "auto";
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  tint?: "pink" | "blue" | "lime" | "neutral";
  className?: string;
  children?: React.ReactNode;
}

export const MediaSlot: React.FC<MediaSlotProps> = ({
  src,
  alt = "Media Slot",
  placeholder = "No Image Available",
  aspectRatio = "1/1",
  radius = "xl",
  tint = "neutral",
  className = "",
  children,
}) => {
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

  const getRadiusClass = () => {
    switch (radius) {
      case "none": return "rounded-none";
      case "xs": return "rounded-xs";
      case "sm": return "rounded-sm";
      case "md": return "rounded-md";
      case "lg": return "rounded-lg";
      case "xl": return "rounded-xl";
      case "2xl": return "rounded-2xl";
      case "full": return "rounded-full";
      default: return "rounded-xl";
    }
  };

  const getTintClass = () => {
    if (src) return "";
    switch (tint) {
      case "pink": return "bg-checkerboard-pink";
      case "blue": return "bg-checkerboard-blue";
      case "lime": return "bg-checkerboard-lime";
      case "neutral":
      default:
        return "bg-checkerboard-neutral";
    }
  };

  return (
    <div
      className={`relative overflow-hidden w-full select-none ${getAspectClass()} ${getRadiusClass()} ${getTintClass()} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center" role="img" aria-label={placeholder}>
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
