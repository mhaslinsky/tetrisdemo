"use client";

import { GameContainer } from "@/components/game";
import { ErrorBoundary, GameInstructions, HelpModal } from "@/components/ui";
import { DebugInfo } from "@/components/debug";
import { HighScoreList, HighScoreModal } from "@/components/game";
import { useHighScores } from "@/hooks/useHighScores";
import { useState, useCallback, useEffect } from "react";

export default function Home() {
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    totalLinesCleared: 0,
    errors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    gameState: any;
    isGameLoopRunning: boolean;
    canMovePiece: boolean;
    metrics?: any;
    isPerformancePoor?: boolean;
    warnings?: string[];
  } | null>(null);

  // High score state
  const [showHighScoreModal, setShowHighScoreModal] = useState(false);
  const [pendingScore, setPendingScore] = useState<{
    score: number;
    level: number;
    linesCleared: number;
    rank?: number;
  } | null>(null);
  const [submittedScoreId, setSubmittedScoreId] = useState<string | null>(null);

  // High score functionality
  const { highScores, isLoading: highScoresLoading, error: highScoresError, submitScore } = useHighScores();

  // Simulate initial loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      // F11 for fullscreen
      if (event.key === "F11") {
        event.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(console.error);
        } else {
          document.exitFullscreen().catch(console.error);
        }
      }

      // F1 or Ctrl+H for help
      if (event.key === "F1" || (event.key === "h" && event.ctrlKey)) {
        event.preventDefault();
        setShowHelp(true);
      }

      // Escape to close help
      if (event.key === "Escape" && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyPress);
    return () => window.removeEventListener("keydown", handleGlobalKeyPress);
  }, [showHelp]);

  const handleGameStart = useCallback(() => {
    console.log("Game started!");
  }, []);

  const handleGameEnd = useCallback(
    (gameEndData: { score: number; level: number; linesCleared: number }) => {
      const { score, level, linesCleared } = gameEndData;

      // Update game statistics
      setGameStats((prev) => ({
        gamesPlayed: prev.gamesPlayed + 1,
        highScore: Math.max(prev.highScore, score),
        totalLinesCleared: prev.totalLinesCleared + linesCleared,
        errors: prev.errors,
      }));

      // Check if score qualifies for high scores
      const currentHighScores = highScores || [];
      const lowestHighScore = currentHighScores.length === 10 ? currentHighScores[9].score : 0;
      const qualifiesForHighScore = currentHighScores.length < 10 || score > lowestHighScore;

      if (qualifiesForHighScore) {
        // Calculate rank
        const rank = currentHighScores.filter((hs) => hs.score > score).length + 1;

        // Show high score modal
        setPendingScore({ score, level, linesCleared, rank });
        setShowHighScoreModal(true);
      }
    },
    [highScores]
  );

  const handlePause = useCallback(() => {
    // Game paused - could add analytics or other side effects here
  }, []);

  const handleResume = useCallback(() => {
    // Game resumed - could add analytics or other side effects here
  }, []);

  const handleGameError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    console.error("Game error:", error, errorInfo);

    // In a real app, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });

    // Update error statistics
    setGameStats((prev) => ({ ...prev, errors: (prev.errors || 0) + 1 }));
  }, []);

  const handleDebugInfoChange = useCallback((newDebugInfo: typeof debugInfo) => {
    setDebugInfo(newDebugInfo);
  }, []);

  // High score modal handlers
  const handleHighScoreSubmit = useCallback(
    async (playerName: string) => {
      if (!pendingScore) return;

      const result = await submitScore({
        playerName,
        score: pendingScore.score,
        level: pendingScore.level,
        linesCleared: pendingScore.linesCleared,
      });

      if (result.success) {
        // Find the submitted score ID for highlighting
        const newSubmittedScore = highScores.find(
          (score) => score.score === pendingScore.score && score.playerName === (playerName.trim() || "Anonymous")
        );

        if (newSubmittedScore) {
          setSubmittedScoreId(newSubmittedScore.id);
        }

        setShowHighScoreModal(false);
        setPendingScore(null);
      }
    },
    [pendingScore, submitScore, highScores]
  );

  const handleHighScoreClose = useCallback(() => {
    setShowHighScoreModal(false);
    setPendingScore(null);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4 animate-pulse'>🎮</div>
          <h1 className='text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent'>
            TETRIS
          </h1>
          <div className='flex items-center justify-center space-x-2'>
            <div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
            <div
              className='w-3 h-3 bg-purple-500 rounded-full animate-bounce'
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className='w-3 h-3 bg-cyan-500 rounded-full animate-bounce'
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className='text-gray-400 mt-4'>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={handleGameError}
      fallback={
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-8'>
          <div className='bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-red-500'>
            <div className='text-red-400 text-6xl mb-4'>🎮</div>
            <h1 className='text-2xl font-bold text-white mb-4'>Game Error</h1>
            <p className='text-gray-300 mb-6'>
              The Tetris game encountered an error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold'
            >
              Reload Game
            </button>
          </div>
        </div>
      }
    >
      <main className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 md:p-8'>
        {/* Header */}
        <header className='flex items-center justify-center gap-4 mb-8'>
          <h1 className='text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent'>
            TETRIS
          </h1>
          <button
            onClick={() => setShowHelp(true)}
            className='text-gray-400 hover:text-white transition-colors'
            aria-label='Show help and instructions'
            title='Help (F1)'
          >
            <span className='text-2xl'>❓</span>
          </button>
        </header>

        {/* Game Container with Error Boundary */}
        <ErrorBoundary onError={handleGameError}>
          <div className='flex flex-col xl:flex-row gap-6 items-start justify-center w-full max-w-7xl px-4'>
            {/* Game Area */}
            <div className='flex-shrink-0 w-full xl:w-auto flex justify-center'>
              <GameContainer
                onGameStart={handleGameStart}
                onGameEnd={handleGameEnd}
                onPause={handlePause}
                onResume={handleResume}
                autoStart={true}
                disableKeyboardInput={showHighScoreModal || showHelp}
                onDebugInfoChange={handleDebugInfoChange}
                className='animate-fade-in'
              />
            </div>

            {/* Instructions and Stats - Hidden on mobile to save space */}
            <div className='hidden md:block w-full xl:w-80 space-y-6'>
              {/* Game Instructions */}
              <GameInstructions className='animate-fade-in' />

              {/* Game Statistics */}
              <div className='bg-gray-800 rounded-lg p-4 border border-gray-600 animate-fade-in'>
                <h3 className='text-white font-semibold mb-3 flex items-center'>
                  <span className='mr-2'>📊</span>
                  Statistics
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>Games Played:</span>
                    <span className='text-white font-mono bg-gray-700 px-2 py-1 rounded'>
                      {gameStats.gamesPlayed}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>High Score:</span>
                    <span className='text-yellow-400 font-mono bg-gray-700 px-2 py-1 rounded'>
                      {gameStats.highScore.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>Total Lines:</span>
                    <span className='text-blue-400 font-mono bg-gray-700 px-2 py-1 rounded'>
                      {gameStats.totalLinesCleared}
                    </span>
                  </div>
                  {gameStats.gamesPlayed > 0 && (
                    <div className='flex justify-between items-center pt-2 border-t border-gray-600'>
                      <span className='text-gray-300'>Avg Score:</span>
                      <span className='text-green-400 font-mono bg-gray-700 px-2 py-1 rounded'>
                        {Math.round(gameStats.highScore / gameStats.gamesPlayed).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* High Scores */}
              <HighScoreList
                highScores={highScores}
                isLoading={highScoresLoading}
                error={highScoresError}
                currentPlayerScoreId={submittedScoreId || undefined}
                className='animate-fade-in'
              />

              {/* Quick Tips */}
              <div className='bg-gray-800 rounded-lg p-4 border border-gray-600 animate-fade-in'>
                <h3 className='text-white font-semibold mb-3'>Quick Start</h3>
                <div className='space-y-2 text-sm text-gray-300'>
                  <p>• Use arrow keys to move and rotate pieces</p>
                  <p>
                    • Press <kbd className='px-1 py-0.5 bg-gray-700 rounded text-xs'>Space</kbd> for hard drop
                  </p>
                  <p>
                    • Press <kbd className='px-1 py-0.5 bg-gray-700 rounded text-xs'>C</kbd> to hold pieces
                  </p>
                  <p>• Clear multiple lines for bonus points!</p>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Footer */}
        <footer className='mt-12 text-center text-gray-500 text-xs space-y-2'>
          <div className='flex justify-center items-center space-x-4 text-xs'>
            <span>Built with Next.js, React, and TypeScript</span>
            <span>•</span>
            <span>Optimized for 60fps gameplay</span>
            <span>•</span>
            <span>Fully accessible</span>
          </div>
          <div className='flex justify-center items-center space-x-4'>
            <span>© 2024 Tetris Web Game</span>
            <span>•</span>
            <span>Press F11 for fullscreen</span>
          </div>
        </footer>
      </main>

      {/* Debug Info - positioned at top right of viewport */}
      {debugInfo && (
        <DebugInfo
          gameState={debugInfo.gameState}
          isGameLoopRunning={debugInfo.isGameLoopRunning}
          canMovePiece={debugInfo.canMovePiece}
          metrics={debugInfo.metrics}
          isPerformancePoor={debugInfo.isPerformancePoor}
          warnings={debugInfo.warnings}
        />
      )}

      {/* High Score Modal */}
      {pendingScore && (
        <HighScoreModal
          isOpen={showHighScoreModal}
          score={pendingScore.score}
          level={pendingScore.level}
          linesCleared={pendingScore.linesCleared}
          rank={pendingScore.rank}
          onSubmit={handleHighScoreSubmit}
          onClose={handleHighScoreClose}
          isSubmitting={false} // We could track this if needed
          error={highScoresError}
        />
      )}

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </ErrorBoundary>
  );
}
