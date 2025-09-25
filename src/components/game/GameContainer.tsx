import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { GameBoard } from "./GameBoard";
import { GameSidebar } from "./GameSidebar";
import { GameControls } from "./GameControls";
import { GameOverModal } from "./GameOverModal";
import { ActionFeedback } from "./ActionFeedback";
import { ScoreEffects } from "./ScoreEffects";
import { TouchControls } from "./TouchControls";
import { AudioControl } from "./MusicControl";
import { useGameState } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useResponsive } from "@/hooks/useResponsive";
import { useGameAudio } from "@/hooks/useAudio";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { usePerformanceMonitor, performanceMonitor } from "@/lib/performance";
import type { GameAction, GameStatus } from "@/types";

interface GameContainerProps {
  className?: string;
  onGameStart?: () => void;
  onGameEnd?: (gameEndData: { score: number; level: number; linesCleared: number }) => void;
  onPause?: () => void;
  onResume?: () => void;
  autoStart?: boolean;
  disableKeyboardInput?: boolean;
  onDebugInfoChange?: (debugInfo: {
    gameState: any;
    isGameLoopRunning: boolean;
    canMovePiece: boolean;
    metrics?: any;
    isPerformancePoor?: boolean;
    warnings?: string[];
  }) => void;
}

/**
 * Main game container component that orchestrates all game functionality
 * Integrates game state management, game loop, and keyboard input handling
 * Memoized to prevent unnecessary re-renders when props haven't changed
 */
export const GameContainer: React.FC<GameContainerProps> = React.memo(
  ({
    className = "",
    onGameStart,
    onGameEnd,
    onPause,
    onResume,
    autoStart = true,
    disableKeyboardInput = false,
    onDebugInfoChange
  }) => {
    // Initialize game state management
    const {
      gameState,
      dispatch,
      isGameActive,
      canMovePiece,
      moveLeft,
      moveRight,
      moveDown,
      rotate,
      hardDrop,
      holdPiece,
      pauseGame,
      resumeGame,
      restartGame,
      gameTick,
      lockPiece,
      spawnPiece,
    } = useGameState();

    // Initialize game loop with stable refs to avoid constant reinitialization
    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    const dispatchRef = useRef(dispatch);
    dispatchRef.current = dispatch;

    const lockPieceRef = useRef(lockPiece);
    lockPieceRef.current = lockPiece;

    const spawnPieceRef = useRef(spawnPiece);
    spawnPieceRef.current = spawnPiece;

    // Use stable callbacks that don't change on every render
    const stableHandlePieceLock = useCallback(() => {
      lockPieceRef.current();
    }, []);

    const stableHandlePieceSpawn = useCallback(() => {
      spawnPieceRef.current();
    }, []);

    const stableDispatch = useCallback((action: GameAction) => {
      dispatchRef.current(action);
    }, []);

    // Initialize game loop with stable dependencies
    const { startGameLoop, stopGameLoop, isRunning } = useGameLoop({
      gameStateRef,
      dispatch: stableDispatch,
      onPieceLock: stableHandlePieceLock,
      onPieceSpawn: stableHandlePieceSpawn,
    });

    // Handle keyboard input actions
    const handleKeyboardAction = useCallback(
      (action: GameAction) => {
        // Track action for sound effects
        lastActionRef.current = action;

        switch (action.type) {
          case "MOVE_LEFT":
            moveLeft();
            break;
          case "MOVE_RIGHT":
            moveRight();
            break;
          case "MOVE_DOWN":
            moveDown();
            break;
          case "ROTATE":
            rotate();
            break;
          case "HARD_DROP":
            hardDrop();
            break;
          case "HOLD_PIECE":
            holdPiece();
            break;
          case "PAUSE_GAME":
            if (gameState.gameStatus === "playing") {
              pauseGame();
              onPause?.();
            } else if (gameState.gameStatus === "paused") {
              resumeGame();
              onResume?.();
            }
            break;
          case "RESTART_GAME":
            restartGame();
            break;
          default:
            // Handle other actions through dispatch
            dispatch(action);
            break;
        }
      },
      [
        moveLeft,
        moveRight,
        moveDown,
        rotate,
        hardDrop,
        holdPiece,
        pauseGame,
        resumeGame,
        restartGame,
        dispatch,
        gameState.gameStatus,
        onPause,
        onResume,
      ]
    );

    // Handle spacebar for pause when game is ready or paused (to avoid conflicts with rotation/hard drop)
    const handleSpacebarPause = useCallback(
      (event: KeyboardEvent) => {
        if (event.code === "Space") {
          if (gameState.gameStatus === "paused") {
            event.preventDefault();
            resumeGame();
            onResume?.();
          } else if (gameState.gameStatus === "ready") {
            event.preventDefault();
            // Start the game
            dispatch({ type: "SPAWN_PIECE" });
          }
        }
      },
      [gameState.gameStatus, resumeGame, onResume, dispatch]
    );

      // Add spacebar pause listener (only when keyboard input is enabled)
    useEffect(() => {
      if (!disableKeyboardInput) {
        document.addEventListener("keydown", handleSpacebarPause);
        return () => {
          document.removeEventListener("keydown", handleSpacebarPause);
        };
      }
    }, [handleSpacebarPause, disableKeyboardInput]);

    // Initialize keyboard input handling
    useKeyboardInput(handleKeyboardAction, {
      enabled: !disableKeyboardInput,
      repeatDelay: 150,
      repeatInterval: 50,
    });

    // Initialize accessibility features
    const { getGameStateDescription, getControlsDescription } = useAccessibility(gameState, {
      announceGameStateChanges: true,
      announceScoreChanges: true,
      announceLevelChanges: true,
      announceLineClears: true,
      announcePieceActions: false, // Avoid too many announcements during gameplay
    });

    // Initialize responsive design features
    const { isMobile, isTablet, canUseTouchControls, shouldOptimizePerformance, isSmallScreen } = useResponsive();

    // Track last action for sound effects
    const lastActionRef = useRef<GameAction | null>(null);

    // Initialize audio system (music and SFX)
    const audio = useGameAudio(gameState.gameStatus);
    const soundEffects = useSoundEffects(gameState, lastActionRef);

    // Initialize performance monitoring
    const { metrics, isPerformancePoor, warnings } = usePerformanceMonitor(
      process.env.NODE_ENV === "development" || shouldOptimizePerformance
    );

    // Track previous game status for lifecycle callbacks
    const prevGameStatusRef = useRef<GameStatus>(gameState.gameStatus);
    const prevLevelRef = useRef<number>(gameState.level);
    const [justLeveledUp, setJustLeveledUp] = useState(false);

    // Handle game status changes
    useEffect(() => {
      const previousStatus = prevGameStatusRef.current;
      const currentStatus = gameState.gameStatus;

      if (previousStatus !== "playing" && currentStatus === "playing") {
        onGameStart?.();
      }

      if (previousStatus !== "gameOver" && currentStatus === "gameOver") {
        onGameEnd?.({
          score: gameState.score,
          level: gameState.level,
          linesCleared: gameState.linesCleared,
        });
      }

      // Update the ref for next comparison
      prevGameStatusRef.current = currentStatus;
    }, [gameState.gameStatus, gameState.score, gameState.level, gameState.linesCleared, onGameStart, onGameEnd]);

    // Handle level up detection
    useEffect(() => {
      const previousLevel = prevLevelRef.current;
      const currentLevel = gameState.level;

      if (currentLevel > previousLevel) {
        setJustLeveledUp(true);
        const timer = setTimeout(() => {
          setJustLeveledUp(false);
        }, 2000);

        return () => clearTimeout(timer);
      }

      prevLevelRef.current = currentLevel;
    }, [gameState.level]);

    // Auto-start game if enabled
    useEffect(() => {
      if (autoStart && gameState.gameStatus === "ready") {
        // Start the game by spawning the first piece
        dispatch({ type: "SPAWN_PIECE" });
      }
    }, [autoStart, gameState.gameStatus, dispatch]);

    // Performance monitoring effect
    useEffect(() => {
      if (isGameActive) {
        performanceMonitor.startRender();
        return () => {
          performanceMonitor.endRender();
        };
      }
    });

    // Send debug info to parent component (only in development)
    useEffect(() => {
      if (process.env.NODE_ENV === "development" && onDebugInfoChange) {
        onDebugInfoChange({
          gameState,
          isGameLoopRunning: isRunning,
          canMovePiece,
          metrics,
          isPerformancePoor,
          warnings,
        });
      }
    }, [gameState, isRunning, canMovePiece, metrics, isPerformancePoor, warnings, onDebugInfoChange]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        stopGameLoop();
      };
    }, [stopGameLoop]);

    // Memoize game status display (excluding game over since we have a modal for that)
    const gameStatusDisplay = useMemo(() => {
      switch (gameState.gameStatus) {
        case "ready":
          return {
            title: "TETRIS",
            subtitle: "Press any key to start",
            showOverlay: true,
          };
        case "playing":
          return null;
        case "paused":
          return {
            title: "PAUSED",
            subtitle: "Press P or ESC to resume",
            showOverlay: true,
          };
        case "gameOver":
          return null; // Game over is handled by the modal
        default:
          return null;
      }
    }, [gameState.gameStatus]);

    // Memoize container classes with responsive layout
    const containerClasses = useMemo(() => {
      const baseClasses = "flex items-start relative";
      const responsiveClasses = isMobile
        ? "flex-col gap-4"
        : isTablet
        ? "flex-col lg:flex-row gap-4"
        : "flex-row gap-6";

      return `${baseClasses} ${responsiveClasses} ${className}`;
    }, [className, isMobile, isTablet]);

    return (
      <div
        className={containerClasses}
        data-testid='game-container'
        role='application'
        aria-label='Tetris Game'
        aria-describedby='game-description game-controls-description'
      >
        {/* Screen reader only descriptions */}
        <div id='game-description' className='sr-only'>
          {getGameStateDescription()}
        </div>
        <div id='game-controls-description' className='sr-only'>
          {getControlsDescription()}
        </div>

        {/* Game Board */}
        <div className={`relative ${isMobile ? "w-full flex justify-center" : ""}`}>
          <GameBoard
            board={gameState.board}
            currentPiece={gameState.currentPiece}
            clearingLines={gameState.animation.clearingLines}
            lastAction={gameState.animation.lastAction}
            onLineClearAnimationComplete={() => dispatch({ type: "END_LINE_CLEAR_ANIMATION" })}
            isGameOver={gameState.gameStatus === "gameOver"}
            justLeveledUp={justLeveledUp}
            className={`
            transition-all duration-300 
            ${gameState.gameStatus === "paused" ? "opacity-50 blur-sm" : ""}
            ${isSmallScreen ? "scale-75" : isMobile && !isSmallScreen ? "scale-90" : ""}
          `}
          />

          {/* Score Effects */}
          <ScoreEffects
            currentLevel={gameState.level}
            justLeveledUp={justLeveledUp}
            linesCleared={gameState.animation.clearingLines.length}
          />

          {/* Action Feedback */}
          <ActionFeedback lastAction={gameState.animation.lastAction} />

          {/* Game Status Overlay */}
          {gameStatusDisplay && gameStatusDisplay.showOverlay && (
            <div
              className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg backdrop-blur-sm'
              data-testid='game-status-overlay'
              role='dialog'
              aria-modal='true'
              aria-labelledby='game-status-title'
              aria-describedby='game-status-subtitle'
            >
              <div
                className='text-white text-center px-6 py-4 bg-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl'
                tabIndex={0}
                id='game-status-dialog'
              >
                <div id='game-status-title' className='text-3xl font-bold mb-2 text-blue-400'>
                  {gameStatusDisplay.title}
                </div>
                <div id='game-status-subtitle' className='text-lg text-gray-300'>
                  {gameStatusDisplay.subtitle}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with Game Info and Controls */}
        <div
          className={`
        flex gap-4 
        ${isMobile ? "flex-row w-full justify-between" : "flex-col min-w-[200px]"}
        ${isTablet ? "lg:flex-col lg:min-w-[200px]" : ""}
      `}
        >
          <GameSidebar gameState={gameState} className={isMobile ? "flex-1" : ""} />

          {/* Desktop Controls */}
          {!canUseTouchControls && (
            <GameControls
              gameState={gameState}
              onPause={pauseGame}
              onResume={resumeGame}
              onRestart={restartGame}
            />
          )}

          {/* Touch Controls for Mobile/Touch Devices */}
          {canUseTouchControls && (
            <div className={isMobile ? "flex-1" : ""}>
              <TouchControls onAction={handleKeyboardAction} isGameActive={isGameActive} />
            </div>
          )}
        </div>

        {/* Audio Control (Music & SFX) */}
        <AudioControl
          isPlaying={audio.isPlaying}
          isMuted={audio.globalMuted}
          onToggleMute={() => {
            const newMuted = audio.toggleGlobalMute();
            soundEffects.setMuted(newMuted);
          }}
        />

        {/* Game Over Modal */}
        <GameOverModal gameState={gameState} onRestart={restartGame} />
      </div>
    );
  }
);

GameContainer.displayName = "GameContainer";

export default GameContainer;
