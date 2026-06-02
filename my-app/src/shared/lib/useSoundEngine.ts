import { useState, useCallback, useEffect, useRef } from "react";

// Module-level variables for global audio state sharing
let _ac: AudioContext | null = null;
let _currentSource: AudioBufferSourceNode | null = null;
let _currentStopCallback: (() => void) | null = null;
const _bufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ac) {
    _ac = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_ac.state === "suspended") {
    _ac.resume();
  }
  return _ac;
}

export interface UseSoundEngineResult {
  play: (url: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
}

export function useSoundEngine(): UseSoundEngineResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const stopCallbackRef = useRef<(() => void) | null>(null);

  // Local stop logic for this instance
  const stop = useCallback(() => {
    if (_currentSource) {
      try {
        _currentSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      _currentSource = null;
    }
    if (_currentStopCallback) {
      _currentStopCallback();
      _currentStopCallback = null;
    }
  }, []);

  const play = useCallback(async (url: string) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Stop any globally running sound and notify its instance to update UI
    if (_currentStopCallback) {
      _currentStopCallback();
    }

    // 2. Setup stop callback for the current playing instance
    stopCallbackRef.current = () => {
      setIsPlaying(false);
    };
    _currentStopCallback = stopCallbackRef.current;
    setIsPlaying(true);

    try {
      let buffer: AudioBuffer;

      // 3. Fetch and decode audio or use cache
      if (_bufferCache.has(url)) {
        buffer = _bufferCache.get(url)!;
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        
        // Use non-deprecated decodeAudioData returning a Promise
        buffer = await ctx.decodeAudioData(arrayBuffer);
        _bufferCache.set(url, buffer);
      }

      // If another sound was started while fetching, abort this play session
      if (_currentStopCallback !== stopCallbackRef.current) {
        return;
      }

      // 4. Create and start source node
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      _currentSource = source;
      
      source.onended = () => {
        // Only clear state if this is still the active playing source
        if (_currentStopCallback === stopCallbackRef.current) {
          setIsPlaying(false);
          _currentStopCallback = null;
        }
      };

      source.start(0);
    } catch (error) {
      console.error("useSoundEngine: Failed to play audio", error);
      // Reset state on error
      if (_currentStopCallback === stopCallbackRef.current) {
        setIsPlaying(false);
        _currentStopCallback = null;
      }
    }
  }, [stop]);

  // Cleanup on unmount if this instance is the one currently playing
  useEffect(() => {
    return () => {
      if (_currentStopCallback === stopCallbackRef.current) {
        stop();
      }
    };
  }, [stop]);

  return {
    play,
    stop,
    isPlaying,
  };
}
