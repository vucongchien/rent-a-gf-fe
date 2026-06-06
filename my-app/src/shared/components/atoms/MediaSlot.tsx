import * as React from "react";
import Image from "next/image";

// Pixel base64 dùng làm blur placeholder — tránh flash trắng khi ảnh lazy-load
// Đây là 1x1 neutral-100 (#f5f5f5)
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OdPPQAIpgNlpFMqGwAAAABJRU5ErkJggg==";

export interface MediaSlotProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  aspectRatio?: "1/1" | "4/3.4" | "4/3" | "auto";
  radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  tint?: "pink" | "blue" | "lime" | "neutral";
  /**
   * Hint kích thước ảnh cho srcset — giúp Next.js tối ưu bandwidth.
   * Mặc định phù hợp với card 3 cột trên desktop.
   * @example "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
   */
  sizes?: string;
  /**
   * Ưu tiên tải sớm (LCP). Bật cho ảnh "above the fold" (ví dụ: HeroFeatured).
   * Khi priority=true sẽ tắt lazy-load và thêm <link rel="preload">.
   */
  priority?: boolean;
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
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px",
  priority = false,
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
      case "xs":   return "rounded-xs";
      case "sm":   return "rounded-sm";
      case "md":   return "rounded-md";
      case "lg":   return "rounded-lg";
      case "xl":   return "rounded-xl";
      case "2xl":  return "rounded-2xl";
      case "full": return "rounded-full";
      default:     return "rounded-xl";
    }
  };

  const getTintClass = () => {
    // Khi có src: không cần checkerboard, bg-neutral-100 được xử lý
    // bởi blurDataURL của Next.js Image (hiện ra trong lúc chờ ảnh load)
    if (src) return "";
    switch (tint) {
      case "pink":    return "bg-checkerboard-pink";
      case "blue":    return "bg-checkerboard-blue";
      case "lime":    return "bg-checkerboard-lime";
      case "neutral":
      default:        return "bg-checkerboard-neutral";
    }
  };

  return (
    <div
      className={`relative overflow-hidden w-full select-none ${getAspectClass()} ${getRadiusClass()} ${getTintClass()} ${className}`}
    >
      {src ? (
        /**
         * Dùng fill thay vì width/height cứng vì:
         * - Container đã có aspect-ratio + position:relative → Image tự fill đúng tỉ lệ
         * - Không cần biết kích thước ảnh thực tế từ server
         * - blurDataURL giữ màu nền trong lúc ảnh load → tránh CLS
         */
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center p-4 text-center"
          role="img"
          aria-label={placeholder}
        >
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
