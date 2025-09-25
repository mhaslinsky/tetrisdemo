import React from 'react';
import { HighScore } from '@/types/highscore';

interface HighScoreListProps {
  highScores: HighScore[];
  isLoading?: boolean;
  error?: string | null;
  currentPlayerScoreId?: string;
  className?: string;
}

export function HighScoreList({
  highScores,
  isLoading = false,
  error = null,
  currentPlayerScoreId,
  className = '',
}: HighScoreListProps) {
  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${className}`}>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">🏆</span>
          High Scores
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-4 bg-gray-600 rounded"></div>
                  <div className="w-20 h-4 bg-gray-600 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-red-500 ${className}`}>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">🏆</span>
          High Scores
        </h3>
        <div className="text-red-400 text-sm text-center py-4">
          <span className="block mb-2">⚠️</span>
          <span>Unable to load high scores</span>
          <br />
          <span className="text-xs text-gray-400">{error}</span>
        </div>
      </div>
    );
  }

  if (highScores.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${className}`}>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">🏆</span>
          High Scores
        </h3>
        <div className="text-gray-400 text-sm text-center py-4">
          <span className="block mb-2">🎮</span>
          <span>No high scores yet!</span>
          <br />
          <span className="text-xs">Be the first to set a record!</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}.`;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${className}`}>
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <span className="mr-2">🏆</span>
        High Scores
      </h3>

      <div className="space-y-1">
        {highScores.map((score, index) => {
          const rank = index + 1;
          const isCurrentPlayer = score.id === currentPlayerScoreId;

          return (
            <div
              key={score.id}
              className={`
                flex items-center justify-between py-2 px-2 rounded transition-colors
                ${
                  isCurrentPlayer
                    ? 'bg-blue-900/30 border border-blue-500/50 shadow-sm'
                    : 'hover:bg-gray-700/50'
                }
              `}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span className="flex-shrink-0 w-8 text-left font-mono text-sm">
                  {typeof getRankEmoji(rank) === 'string' && getRankEmoji(rank).includes('.')
                    ? getRankEmoji(rank)
                    : getRankEmoji(rank)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`truncate text-sm font-medium ${
                        isCurrentPlayer ? 'text-blue-300' : 'text-gray-300'
                      }`}
                      title={score.playerName}
                    >
                      {score.playerName}
                    </span>
                    {isCurrentPlayer && (
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded text-center">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>Lv.{score.level}</span>
                    <span>•</span>
                    <span>{score.linesCleared} lines</span>
                    <span>•</span>
                    <span>{formatDate(score.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span
                  className={`font-mono text-sm font-semibold ${
                    isCurrentPlayer ? 'text-blue-300' : 'text-yellow-400'
                  }`}
                >
                  {score.score.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {highScores.length < 10 && (
        <div className="text-xs text-gray-500 text-center mt-3">
          {10 - highScores.length} more spots available
        </div>
      )}
    </div>
  );
}