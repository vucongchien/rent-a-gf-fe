import * as React from "react";
import { HeartIcon } from "./Icons";

export interface LikeButtonProps {
  isLiked: boolean;
  onToggle: (liked: boolean) => void;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  onToggle,
  className = "",
}) => {
  const [isPopAnimating, setIsPopAnimating] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !isLiked;
    onToggle(nextLiked);

    // Trigger spring animation only when transitioning to liked state
    if (nextLiked) {
      setIsPopAnimating(true);
    }
  };

  // Reset animation flag once animation completes
  const handleAnimationEnd = () => {
    setIsPopAnimating(false);
  };

  // Dynamic label for Screen Readers: "Like profile" when not liked, "Unlike profile" when liked
  const ariaLabel = isLiked ? "Unlike profile" : "Like profile";

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      className={`btn-like ${
        isPopAnimating ? "animate-like-pop" : ""
      } ${className}`}
      aria-label={ariaLabel}
      aria-pressed={isLiked}
    >
      <HeartIcon
        fill={isLiked ? "var(--color-chizuru-600)" : "none"}
        size={18}
        className={`transition-all duration-200 ${
          isLiked
            ? "stroke-chizuru-600 scale-110"
            : "stroke-neutral-900"
        }`}
      />
    </button>
  );
};

LikeButton.displayName = "LikeButton";
