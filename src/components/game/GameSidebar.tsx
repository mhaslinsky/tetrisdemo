import React from "react";
import type { GameState, Tetromino } from "@/types";
import { NextPiecePreview } from "./NextPiecePreview";
import { HoldPiecePreview } from "./HoldPiecePreview";

interface GameSidebarProps {
  gameState: GameState;
  className?: string;
}

/**
 * Component for displaying current score with formatting
 * Memoized to prevent re-renders when score hasn't changed
 */
const ScoreDisplay: React.FC<{ score: number }> = React.memo(({ score }) => (
  <div
    className='bg-gray-800 rounded-lg p-4 border-2 border-gray-600'
    role='region'
    aria-labelledby='score-heading'
  >
    <h3 id='score-heading' className='text-sm font-semibold text-gray-300 mb-1'>
      SCORE
    </h3>
    <div
      className='text-2xl font-bold text-white font-mono'
      data-testid='score-value'
      aria-live='polite'
      aria-label={`Current score: ${score.toLocaleString()}`}
    >
      {score.toLocaleString()}
    </div>
  </div>
));

/**
 * Component for displaying current level
 * Memoized to prevent re-renders when level hasn't changed
 */
const LevelDisplay: React.FC<{ level: number }> = React.memo(({ level }) => (
  <div
    className='bg-gray-800 rounded-lg p-4 border-2 border-gray-600'
    role='region'
    aria-labelledby='level-heading'
  >
    <h3 id='level-heading' className='text-sm font-semibold text-gray-300 mb-1'>
      LEVEL
    </h3>
    <div
      className='text-2xl font-bold text-white font-mono'
      data-testid='level-value'
      aria-live='polite'
      aria-label={`Current level: ${level}`}
    >
      {level}
    </div>
  </div>
));

/**
 * Component for displaying lines cleared
 * Memoized to prevent re-renders when lines count hasn't changed
 */
const LinesDisplay: React.FC<{ lines: number }> = React.memo(({ lines }) => (
  <div
    className='bg-gray-800 rounded-lg p-4 border-2 border-gray-600'
    role='region'
    aria-labelledby='lines-heading'
  >
    <h3 id='lines-heading' className='text-sm font-semibold text-gray-300 mb-1'>
      LINES
    </h3>
    <div
      className='text-2xl font-bold text-white font-mono'
      data-testid='lines-value'
      aria-live='polite'
      aria-label={`Lines cleared: ${lines}`}
    >
      {lines}
    </div>
  </div>
));

/**
 * Main sidebar component that displays game statistics and piece previews
 * Memoized to prevent unnecessary re-renders
 */
export const GameSidebar: React.FC<GameSidebarProps> = React.memo(({ gameState, className = "" }) => {
  const { score, level, linesCleared, nextPiece, heldPiece, canHold } = gameState;

  return (
    <div
      className={`flex flex-col gap-4 ${className}`}
      data-testid='game-sidebar'
      role='region'
      aria-label='Game information and statistics'
    >
      {/* Game Statistics - Responsive layout */}
      <div
        className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3'
        role='region'
        aria-label='Game statistics'
      >
        <ScoreDisplay score={score} />
        <LevelDisplay level={level} />
        <LinesDisplay lines={linesCleared} />
      </div>

      {/* Piece Previews - Responsive layout */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4'>
        {/* Next Piece Preview */}
        <div
          className='bg-gray-800 rounded-lg p-4 border-2 border-gray-600'
          role='region'
          aria-labelledby='next-piece-heading'
        >
          <h3 id='next-piece-heading' className='text-sm font-semibold text-gray-300 mb-2'>
            NEXT
          </h3>
          <NextPiecePreview piece={nextPiece} />
        </div>

        {/* Hold Piece Preview */}
        <div
          className='bg-gray-800 rounded-lg p-4 border-2 border-gray-600'
          role='region'
          aria-labelledby='hold-piece-heading'
        >
          <h3 id='hold-piece-heading' className='text-sm font-semibold text-gray-300 mb-2'>
            HOLD
          </h3>
          <HoldPiecePreview piece={heldPiece} canHold={canHold} />
        </div>
      </div>
    </div>
  );
});

GameSidebar.displayName = "GameSidebar";

export default GameSidebar;
