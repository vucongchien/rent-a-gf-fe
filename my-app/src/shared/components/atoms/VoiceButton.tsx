import * as React from "react";
import { useSoundEngine } from "../../lib/useSoundEngine";

export interface VoiceButtonProps {
  soundUrl: string;
  label?: string;
  size?: "default" | "mini";
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  soundUrl,
  label = "Listen",
  size = "default",
  className = "",
}) => {
  const { play, stop, isPlaying } = useSoundEngine();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      stop();
    } else {
      play(soundUrl);
    }
  };

  const isMini = size === "mini";

  // Base sizing and typography
  const sizeClasses = isMini
    ? "h-10 px-3.5 pl-3 text-xs shadow-[0_3px_0_theme(colors.neutral.900)] hover:translate-y-[1px] hover:shadow-[0_2px_0_theme(colors.neutral.900)] active:translate-y-[3px] active:shadow-none"
    : "h-12 px-[18px] pl-3.5 text-sm shadow-[0_4px_0_theme(colors.neutral.900)] hover:translate-y-[2px] hover:shadow-[0_2px_0_theme(colors.neutral.900)] active:translate-y-[4px] active:shadow-none";

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 border-2 border-neutral-900 bg-white font-bold select-none cursor-pointer text-neutral-900 rounded-full font-sans transition-all duration-100 ease-out hover:bg-[var(--color-cream)] ${sizeClasses} ${className}`}
      aria-label={isPlaying ? "Stop audio" : `Play audio: ${label}`}
    >
      {/* Visual EQ Audio Wave Indicator */}
      <span className="flex-none flex items-center justify-center w-6 h-6">
        <span className="flex items-center gap-[2px] h-4">
          <b
            className={`w-[3px] h-[5px] rounded-[2px] bg-neutral-900 block ${
              isPlaying ? "animate-voice-eq" : "h-[5px]"
            }`}
          />
          <b
            className={`w-[3px] h-[5px] rounded-[2px] bg-neutral-900 block [animation-delay:0.12s] ${
              isPlaying ? "animate-voice-eq" : "h-[5px]"
            }`}
          />
          <b
            className={`w-[3px] h-[5px] rounded-[2px] bg-neutral-900 block [animation-delay:0.24s] ${
              isPlaying ? "animate-voice-eq" : "h-[5px]"
            }`}
          />
          <b
            className={`w-[3px] h-[5px] rounded-[2px] bg-neutral-900 block [animation-delay:0.36s] ${
              isPlaying ? "animate-voice-eq" : "h-[5px]"
            }`}
          />
        </span>
      </span>
      <span>{label}</span>
    </button>
  );
};

VoiceButton.displayName = "VoiceButton";
