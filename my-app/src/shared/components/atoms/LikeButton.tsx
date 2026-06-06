import * as React from "react";

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
      <svg
        viewBox="0 0 24 24"
        className={`w-[18px] h-[18px] transition-all duration-200 ${
          isLiked
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
