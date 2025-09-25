import React, { useState, useRef, useEffect } from 'react';

interface HighScoreModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  linesCleared: number;
  rank?: number;
  onSubmit: (playerName: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function HighScoreModal({
  isOpen,
  score,
  level,
  linesCleared,
  rank,
  onSubmit,
  onClose,
  isSubmitting = false,
  error = null,
}: HighScoreModalProps) {
  const [playerName, setPlayerName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    const finalName = playerName.trim() || 'Anonymous';
    onSubmit(finalName);
  };

  const handleSkip = () => {
    onSubmit('Anonymous');
  };

  if (!isOpen) {
    return null;
  }

  const getRankMessage = () => {
    if (!rank) return 'New High Score!';

    switch (rank) {
      case 1:
        return '🥇 New #1 High Score!';
      case 2:
        return '🥈 2nd Place High Score!';
      case 3:
        return '🥉 3rd Place High Score!';
      default:
        return `🏆 #${rank} High Score!`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div
        className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl w-full max-w-md mx-auto transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="highscore-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-6 py-4 rounded-t-lg">
          <h2 id="highscore-title" className="text-xl font-bold text-center">
            {getRankMessage()}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Score Details */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400 font-mono">
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 uppercase">Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-400">
                  Level {level}
                </div>
                <div className="text-xs text-gray-400 uppercase">Final Level</div>
              </div>
            </div>
            <div className="text-center mt-2 pt-2 border-t border-gray-600">
              <div className="text-lg font-semibold text-green-400">
                {linesCleared} Lines
              </div>
              <div className="text-xs text-gray-400 uppercase">Total Cleared</div>
            </div>
          </div>

          {/* Name Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your name (optional):
              </label>
              <input
                ref={inputRef}
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))} // Limit to 20 chars
                placeholder="Anonymous"
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={20}
              />
              <div className="text-xs text-gray-400 mt-1">
                {playerName.length}/20 characters
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Skip'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Score'}
              </button>
            </div>
          </form>

          {/* Close instruction */}
          <div className="text-center mt-4">
            <span className="text-xs text-gray-400">Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}