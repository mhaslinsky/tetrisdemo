import { useEffect, useRef, useState, useCallback } from "react";
import type { GameStatus } from "@/types/game";

interface UseAudioOptions {
  volume?: number;
  loop?: boolean;
}

export function useAudio(src: string, options: UseAudioOptions = {}) {
  const { volume = 0.5, loop = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, [src, loop, volume]);

  const play = async () => {
    if (audioRef.current && !isMuted) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.warn("Audio play failed:", error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
        if (newMuted && isPlaying) {
          audioRef.current.pause();
        } else if (!newMuted && isPlaying) {
          audioRef.current.play();
        }
      }
      return newMuted;
    });
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    isPlaying,
    isMuted,
    play,
    pause,
    toggleMute,
    setVolume,
  };
}

export function useGameMusic(gameStatus: GameStatus) {
  const audio = useAudio("/Tetris 99 - Main Theme.mp3", { volume: 0.3, loop: true });

  useEffect(() => {
    if (gameStatus === "playing") {
      audio.play();
    } else {
      audio.pause();
    }
  }, [gameStatus]); // Remove audio from dependencies to prevent conflicts

  return audio;
}

export function useGameAudio(gameStatus: GameStatus) {
  const audio = useAudio("/Tetris 99 - Main Theme.mp3", { volume: 0.3, loop: true });
  const [globalMuted, setGlobalMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const wasMusicPlayingBeforeGameOver = useRef(false);

  // Enable audio after first user interaction (browser requirement)
  useEffect(() => {
    const enableAudio = () => {
      setHasUserInteracted(true);
    };

    // Listen for any user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
    };
  }, []);

  // Handle automatic music based on game status and mute state
  useEffect(() => {
    // Don't try to play music until user has interacted with the page
    if (!hasUserInteracted) return;

    if (globalMuted) {
      // If globally muted, always pause
      audio.pause();
    } else if (gameStatus === "playing") {
      // If not muted and playing, play music
      audio.play();
    } else if (gameStatus === "gameOver") {
      // If game over, pause music (will resume when new game starts if not muted)
      wasMusicPlayingBeforeGameOver.current = audio.isPlaying;
      audio.pause();
    } else {
      // For other states (paused, ready), pause music
      audio.pause();
    }
  }, [gameStatus, globalMuted, hasUserInteracted, audio.play, audio.pause, audio.isPlaying]);

  const toggleGlobalMute = useCallback(() => {
    const newMuted = !globalMuted;
    setGlobalMuted(newMuted);

    // If unmuting, try to enable audio interaction
    if (!newMuted && !hasUserInteracted) {
      setHasUserInteracted(true);
    }

    return newMuted;
  }, [globalMuted, hasUserInteracted]);

  return {
    ...audio,
    globalMuted,
    toggleGlobalMute,
  };
}