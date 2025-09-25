import React from "react";

interface AudioControlProps {
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function AudioControl({ isPlaying, isMuted, onToggleMute }: AudioControlProps) {
  return (
    <button
      onClick={onToggleMute}
      className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg flex items-center justify-center text-white transition-colors duration-200 border border-gray-600/50"
      aria-label={isMuted ? "Unmute audio (music & SFX)" : "Mute audio (music & SFX)"}
      title={isMuted ? "Unmute audio (music & SFX)" : "Mute audio (music & SFX)"}
    >
      {isMuted ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
}