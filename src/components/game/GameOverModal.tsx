import React from "react";
import type { GameState } from "@/types";

export interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Modal component displayed when the game is over
 * Shows final score and provides restart functionality
 */
export const GameOverModal: React.FC<GameOverModalProps> = ({ gameState, onRestart, onClose, className = "" }) => {
  if (gameState.gameStatus !== "gameOver") {
    return null;
  }

  const handleRestart = () => {
    onRestart();
    onClose?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRestart();
    } else if (event.key === "Escape" && onClose) {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${className}`}
      data-testid='game-over-modal'
      role='dialog'
      aria-modal='true'
      aria-labelledby='game-over-title'
      aria-describedby='game-over-description'
    >
      <div
        className='bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border-2 border-gray-600 shadow-2xl'
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Game Over Title */}
        <h2 id='game-over-title' className='text-3xl font-bold text-red-400 text-center mb-6'>
          Game Over
        </h2>

        {/* Final Score Display */}
        <div id='game-over-description' className='text-white text-center space-y-4 mb-8'>
          <div className='text-xl'>
            <span className='text-gray-300'>Final Score:</span>
            <div className='text-3xl font-bold text-yellow-400 mt-2'>{gameState.score.toLocaleString()}</div>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='bg-gray-700 rounded p-3'>
              <div className='text-gray-300'>Level</div>
              <div className='text-xl font-semibold text-blue-400'>{gameState.level}</div>
            </div>
            <div className='bg-gray-700 rounded p-3'>
              <div className='text-gray-300'>Lines</div>
              <div className='text-xl font-semibold text-green-400'>{gameState.linesCleared}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col gap-3'>
          <button
            onClick={handleRestart}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'
            data-testid='restart-button'
            autoFocus
          >
            Play Again
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800'
              data-testid='close-button'
            >
              Close
            </button>
          )}
        </div>

        {/* Keyboard Instructions */}
        <div className='text-xs text-gray-400 text-center mt-4'>
          Press Enter or Space to play again
          {onClose && " • Press Escape to close"}
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
