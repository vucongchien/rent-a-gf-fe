import * as React from "react";

export interface LikeButtonProps {
  isLiked?: boolean;
  defaultLiked?: boolean;
  onToggle?: (liked: boolean) => void;
  size?: number; // width and height of button in px
  "aria-label"?: string;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  defaultLiked = false,
  onToggle,
  size = 38,
  "aria-label": ariaLabel = "Like profile",
  className = "",
}) => {
  const isControlled = isLiked !== undefined;
  const [localLiked, setLocalLiked] = React.useState(defaultLiked);
  const [isPopAnimating, setIsPopAnimating] = React.useState(false);

  const liked = isControlled ? isLiked : localLiked;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !liked;

    if (!isControlled) {
      setLocalLiked(nextLiked);
    }

    if (onToggle) {
      onToggle(nextLiked);
    }

    // Trigger spring animation only when transitioning to liked state
    if (nextLiked) {
      setIsPopAnimating(true);
    }
  };

  // Reset animation flag once animation completes
  const handleAnimationEnd = () => {
    setIsPopAnimating(false);
  };

  const buttonStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const svgStyle: React.CSSProperties = {
    width: `${Math.round(size * 0.47)}px`,
    height: `${Math.round(size * 0.47)}px`,
  };

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      style={buttonStyle}
      className={`inline-flex items-center justify-center rounded-full border border-neutral-900 bg-white/92 backdrop-blur-sm cursor-pointer select-none transition-all duration-100 ease-out 
        
        
        
        shadow-[1px_2px_0_var(--color-neutral-900)] hover:translate-y-px hover:shadow-[1px_1px_0_var(--color-neutral-900)] active:translate-y-3px active:shadow-none ${
        isPopAnimating ? "animate-like-pop" : ""
      } ${className}`}
      aria-label={ariaLabel}
      aria-pressed={liked}
    >
      <svg
        viewBox="0 0 24 24"
        style={svgStyle}
        className={`transition-all duration-200 ${
          liked
            ? "fill-chizuru-600 stroke-chizuru-600 scale-110"
            : "fill-none stroke-neutral-900 stroke-2"
        }`}
      >
        <path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.3 5c2 0 3.3 1.2 4.2 2.4C10.4 6.2 11.7 5 13.7 5 17 5 18.6 8.5 17 11.8 14.5 16.4 12 21 12 21Z" />
      </svg>
    </button>
  );
};

LikeButton.displayName = "LikeButton";
