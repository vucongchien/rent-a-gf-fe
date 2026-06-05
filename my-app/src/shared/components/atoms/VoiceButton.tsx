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
  const sizeClass = isMini ? "btn-voice-mini" : "btn-voice-default";

  return (
    <button
      onClick={handleClick}
      className={`btn-voice-base ${sizeClass} ${className}`}
      aria-label={isPlaying ? "Stop audio" : `Play audio: ${label}`}
    >
      {/* Visual EQ Audio Wave Indicator - Hidden from screen readers */}
      <span className="flex-none flex items-center justify-center w-6 h-6" aria-hidden="true">
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
