import * as React from "react";

export interface VoiceEqualizerProps {
  isPlaying: boolean;
}

export const VoiceEqualizer: React.FC<VoiceEqualizerProps> = ({ isPlaying }) => {
  const bars = [
    { delay: "" },
    { delay: "[animation-delay:0.12s]" },
    { delay: "[animation-delay:0.24s]" },
    { delay: "[animation-delay:0.36s]" },
  ];

  return (
    <span className="flex-none flex items-center justify-center w-6 h-6" aria-hidden="true">
      <span className="flex items-center gap-[2px] h-4">
        {bars.map((bar, index) => (
          <b
            key={index}
            className={`w-[3px] h-[5px] rounded-[2px] bg-current block ${bar.delay} ${
              isPlaying ? "animate-voice-eq" : ""
            }`}
          />
        ))}
      </span>
    </span>
  );
};

VoiceEqualizer.displayName = "VoiceEqualizer";
