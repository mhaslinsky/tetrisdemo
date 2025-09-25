import { useState, useEffect, useCallback } from 'react';
import {
  HighScore,
  SubmitHighScoreRequest,
  GetHighScoresResponse,
  SubmitHighScoreResponse,
} from '@/types/highscore';

interface UseHighScoresReturn {
  highScores: HighScore[];
  isLoading: boolean;
  error: string | null;
  fetchHighScores: () => Promise<void>;
  submitScore: (scoreData: SubmitHighScoreRequest) => Promise<{
    success: boolean;
    isNewHighScore?: boolean;
    rank?: number;
    error?: string;
  }>;
  clearError: () => void;
}

export function useHighScores(): UseHighScoresReturn {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/highscores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GetHighScoresResponse = await response.json();

      if (result.success && result.data) {
        setHighScores(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch high scores');
      }
    } catch (err) {
      console.error('Failed to fetch high scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch high scores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitScore = useCallback(async (scoreData: SubmitHighScoreRequest) => {
    try {
      setError(null);

      const response = await fetch('/api/highscores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SubmitHighScoreResponse = await response.json();

      if (result.success && result.data) {
        // Update local high scores list
        setHighScores(result.data.highScores);

        return {
          success: true,
          isNewHighScore: result.data.isNewHighScore,
          rank: result.data.rank,
        };
      } else {
        throw new Error(result.error || 'Failed to submit high score');
      }
    } catch (err) {
      console.error('Failed to submit high score:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit high score';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch high scores on mount
  useEffect(() => {
    fetchHighScores();
  }, [fetchHighScores]);

  return {
    highScores,
    isLoading,
    error,
    fetchHighScores,
    submitScore,
    clearError,
  };
}