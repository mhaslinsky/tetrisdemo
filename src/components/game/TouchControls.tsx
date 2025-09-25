import React, { useCallback, useRef, useEffect } from "react";
import type { GameAction } from "@/types";

interface TouchControlsProps {
  onAction: (action: GameAction) => void;
  isGameActive: boolean;
  className?: string;
}

interface TouchButtonProps {
  onPress: () => void;
  onRelease?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label": string;
}

/**
 * Touch-friendly button component with proper touch event handling
 */
const TouchButton: React.FC<TouchButtonProps> = ({
  onPress,
  onRelease,
  children,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPressingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (disabled) return;

      isPressingRef.current = true;
      onPress();

      // For movement buttons, enable repeat
      if (onRelease) {
        pressTimerRef.current = setInterval(() => {
          if (isPressingRef.current) {
            onPress();
          }
        }, 100); // Repeat every 100ms
      }
    },
    [onPress, onRelease, disabled]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      isPressingRef.current = false;

      if (pressTimerRef.current) {
        clearInterval(pressTimerRef.current);
        pressTimerRef.current = null;
      }

      onRelease?.();
    },
    [onRelease]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (disabled) return;

      isPressingRef.current = true;
      onPress();

      if (onRelease) {
        pressTimerRef.current = setInterval(() => {
          if (isPressingRef.current) {
            onPress();
          }
        }, 100);
      }
    },
    [onPress, onRelease, disabled]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isPressingRef.current = false;

      if (pressTimerRef.current) {
        clearInterval(pressTimerRef.current);
        pressTimerRef.current = null;
      }

      onRelease?.();
    },
    [onRelease]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearInterval(pressTimerRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`
        select-none touch-manipulation
        bg-gray-700 hover:bg-gray-600 active:bg-gray-500
        border-2 border-gray-600 hover:border-gray-500
        text-white font-semibold
        rounded-lg shadow-lg
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={`touch-button-${ariaLabel.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {children}
    </button>
  );
};

/**
 * Touch controls component for mobile devices
 * Provides touch-friendly buttons for all game actions
 */
export const TouchControls: React.FC<TouchControlsProps> = ({ onAction, isGameActive, className = "" }) => {
  const handleMoveLeft = useCallback(() => {
    onAction({ type: "MOVE_LEFT" });
  }, [onAction]);

  const handleMoveRight = useCallback(() => {
    onAction({ type: "MOVE_RIGHT" });
  }, [onAction]);

  const handleMoveDown = useCallback(() => {
    onAction({ type: "MOVE_DOWN" });
  }, [onAction]);

  const handleRotate = useCallback(() => {
    onAction({ type: "ROTATE" });
  }, [onAction]);

  const handleHardDrop = useCallback(() => {
    onAction({ type: "HARD_DROP" });
  }, [onAction]);

  const handleHold = useCallback(() => {
    onAction({ type: "HOLD_PIECE" });
  }, [onAction]);

  const handlePause = useCallback(() => {
    onAction({ type: "PAUSE_GAME" });
  }, [onAction]);

  return (
    <div
      className={`
        touch-controls
        bg-gray-800 rounded-lg p-4 border-2 border-gray-600
        ${className}
      `}
      data-testid='touch-controls'
      role='region'
      aria-label='Touch game controls'
    >
      {/* Movement Controls */}
      <div className='grid grid-cols-3 gap-2 mb-4'>
        {/* Left */}
        <TouchButton
          onPress={handleMoveLeft}
          onRelease={() => {}} // Enable repeat for movement
          disabled={!isGameActive}
          aria-label='Move left'
          className='h-12 flex items-center justify-center'
        >
          <span className='text-xl'>←</span>
        </TouchButton>

        {/* Rotate */}
        <TouchButton
          onPress={handleRotate}
          disabled={!isGameActive}
          aria-label='Rotate piece'
          className='h-12 flex items-center justify-center'
        >
          <span className='text-xl'>↻</span>
        </TouchButton>

        {/* Right */}
        <TouchButton
          onPress={handleMoveRight}
          onRelease={() => {}} // Enable repeat for movement
          disabled={!isGameActive}
          aria-label='Move right'
          className='h-12 flex items-center justify-center'
        >
          <span className='text-xl'>→</span>
        </TouchButton>
      </div>

      {/* Action Controls */}
      <div className='grid grid-cols-3 gap-2 mb-4'>
        {/* Soft Drop */}
        <TouchButton
          onPress={handleMoveDown}
          onRelease={() => {}} // Enable repeat for soft drop
          disabled={!isGameActive}
          aria-label='Soft drop'
          className='h-12 flex items-center justify-center'
        >
          <span className='text-xl'>↓</span>
        </TouchButton>

        {/* Hard Drop */}
        <TouchButton
          onPress={handleHardDrop}
          disabled={!isGameActive}
          aria-label='Hard drop'
          className='h-12 flex items-center justify-center bg-red-700 hover:bg-red-600 active:bg-red-500'
        >
          <span className='text-xl'>⇓</span>
        </TouchButton>

        {/* Hold */}
        <TouchButton
          onPress={handleHold}
          disabled={!isGameActive}
          aria-label='Hold piece'
          className='h-12 flex items-center justify-center'
        >
          <span className='text-sm font-bold'>HOLD</span>
        </TouchButton>
      </div>

      {/* Game Controls */}
      <div className='flex gap-2'>
        <TouchButton
          onPress={handlePause}
          disabled={false} // Pause should always be available
          aria-label='Pause game'
          className='flex-1 h-10 flex items-center justify-center bg-blue-700 hover:bg-blue-600 active:bg-blue-500'
        >
          <span className='text-sm font-bold'>PAUSE</span>
        </TouchButton>
      </div>

      {/* Instructions */}
      <div className='mt-4 text-xs text-gray-400 text-center'>
        <p>Touch and hold movement buttons for continuous action</p>
      </div>
    </div>
  );
};

export default TouchControls;
