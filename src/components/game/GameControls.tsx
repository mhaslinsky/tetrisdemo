import React from "react";
import type { GameState } from "@/types";

interface GameControlsProps {
  gameState: GameState;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  className?: string;
}

/**
 * Button component with consistent styling
 */
const ControlButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  "data-testid"?: string;
  "aria-label"?: string;
}> = ({
  onClick,
  disabled = false,
  variant = "primary",
  children,
  "data-testid": testId,
  "aria-label": ariaLabel,
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border-2";
  const variantClasses = {
    primary: disabled
      ? "bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed"
      : "bg-blue-600 border-blue-500 text-white hover:bg-blue-700 hover:border-blue-400 active:bg-blue-800",
    secondary: disabled
      ? "bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed"
      : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 active:bg-gray-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

/**
 * Game controls component with pause, resume, and restart functionality
 */
export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onPause,
  onResume,
  onRestart,
  className = "",
}) => {
  const { gameStatus } = gameState;

  const canPause = gameStatus === "playing";
  const canResume = gameStatus === "paused";
  const canRestart = gameStatus !== "ready";

  const handlePauseResume = () => {
    if (canPause) {
      onPause();
    } else if (canResume) {
      onResume();
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border-2 border-gray-600 ${className}`}
      data-testid='game-controls'
      role='region'
      aria-labelledby='controls-heading'
    >
      <h3 id='controls-heading' className='text-sm font-semibold text-gray-300 mb-3'>
        CONTROLS
      </h3>

      <div className='space-y-2' role='group' aria-label='Game control buttons'>
        {/* Pause/Resume Button */}
        <ControlButton
          onClick={handlePauseResume}
          disabled={!canPause && !canResume}
          variant='primary'
          data-testid='pause-resume-button'
          aria-label={canResume ? "Resume game (keyboard shortcut: P)" : "Pause game (keyboard shortcut: P)"}
        >
          {canResume ? "Resume (P)" : "Pause (P)"}
        </ControlButton>

        {/* Restart Button */}
        <ControlButton
          onClick={onRestart}
          disabled={!canRestart}
          variant='secondary'
          data-testid='controls-restart-button'
          aria-label='Restart game (keyboard shortcut: R)'
        >
          Restart (R)
        </ControlButton>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className='mt-4 pt-3 border-t border-gray-600' role='region' aria-labelledby='shortcuts-heading'>
        <h4 id='shortcuts-heading' className='text-xs font-semibold text-gray-400 mb-2'>
          KEYBOARD SHORTCUTS
        </h4>
        <div className='text-xs text-gray-400 space-y-1' role='list'>
          <div className='flex justify-between' role='listitem'>
            <span>Move:</span>
            <span>Arrow Keys</span>
          </div>
          <div className='flex justify-between' role='listitem'>
            <span>Rotate:</span>
            <span>↑ / Space</span>
          </div>
          <div className='flex justify-between' role='listitem'>
            <span>Hard Drop:</span>
            <span>Space</span>
          </div>
          <div className='flex justify-between' role='listitem'>
            <span>Hold:</span>
            <span>C / Shift</span>
          </div>
          <div className='flex justify-between' role='listitem'>
            <span>Pause:</span>
            <span>P / Esc</span>
          </div>
          <div className='flex justify-between' role='listitem'>
            <span>Restart:</span>
            <span>R</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
