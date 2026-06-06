import * as React from "react";
import { useSoundEngine } from "../../lib/useSoundEngine";
import { VoiceEqualizer } from "./VoiceEqualizer";

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

  const sizeClass = size === "mini" ? "btn-voice-mini" : "btn-voice-default";

  return (
    <button
      onClick={handleClick}
      className={`btn-voice-base ${sizeClass} ${className}`}
      aria-label={isPlaying ? "Stop audio" : `Play audio: ${label}`}
    >
      <VoiceEqualizer isPlaying={isPlaying} />
      {label && <span>{label}</span>}
    </button>
  );
};

VoiceButton.displayName = "VoiceButton";
