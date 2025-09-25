import { useEffect, useRef, useCallback, useMemo } from "react";
import type { GameState, GameAction } from "@/types";
import { calculateDropSpeed } from "@/lib/scoring";
import { shouldLockPiece } from "@/lib/movement";

export interface UseGameLoopReturn {
  startGameLoop: () => void;
  stopGameLoop: () => void;
  isRunning: boolean;
}

export interface UseGameLoopOptions {
  gameStateRef: React.RefObject<GameState>;
  dispatch: React.Dispatch<GameAction>;
  onPieceLock?: () => void;
  onPieceSpawn?: () => void;
}

/**
 * Custom hook for managing the main game loop with requestAnimationFrame
 * Handles automatic piece dropping, timing controls, and game state updates
 * @param options - Configuration object with game state and dispatch function
 * @returns Game loop control functions
 */
export function useGameLoop({
  gameStateRef,
  dispatch,
  onPieceLock,
  onPieceSpawn,
}: UseGameLoopOptions): UseGameLoopReturn {
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const dropTimerRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  // Remove the memoized dropSpeed calculation since gameState is now a ref

  // gameStateRef is now passed in from the component

  // Main game loop function
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const currentGameState = gameStateRef.current!;

      // Calculate delta time since last update
      const deltaTime = lastUpdateTimeRef.current === 0 ? 16 : currentTime - lastUpdateTimeRef.current; // Assume 16ms for first frame
      lastUpdateTimeRef.current = currentTime;

      // Only process game logic if game is actively playing
      if (currentGameState.gameStatus === "playing") {
        // Update drop timer
        dropTimerRef.current += deltaTime;

        // Calculate current drop speed
        const currentDropSpeed = calculateDropSpeed(currentGameState.level);

        // Handle automatic piece dropping
        if (dropTimerRef.current >= currentDropSpeed) {
          dropTimerRef.current = 0;

          if (currentGameState.currentPiece) {
            // Check if piece should be locked before attempting to move down
            if (shouldLockPiece(currentGameState.board, currentGameState.currentPiece)) {
              // Lock the current piece
              dispatch({ type: "LOCK_PIECE" });
              onPieceLock?.();
            } else {
              // Move piece down automatically
              dispatch({ type: "MOVE_DOWN" });
            }
          } else {
            // No current piece, spawn the next one
            dispatch({ type: "SPAWN_PIECE" });
            onPieceSpawn?.();
          }
        }

        // Dispatch game tick for any additional timing-based updates
        dispatch({ type: "GAME_TICK" });
      }

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [dispatch, onPieceLock, onPieceSpawn]
  );

  // Start the game loop
  const startGameLoop = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      lastUpdateTimeRef.current = 0; // Let the first frame calculate deltaTime properly
      dropTimerRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameLoop]);

  // Stop the game loop
  const stopGameLoop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Auto-start/stop based on game status
  useEffect(() => {
    const checkAndStartLoop = () => {
      if (gameStateRef.current?.gameStatus === "playing") {
        startGameLoop();
      } else {
        stopGameLoop();
      }
    };

    checkAndStartLoop();

    // Set up an interval to check game status periodically
    const interval = setInterval(checkAndStartLoop, 100);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      stopGameLoop();
    };
  }, [startGameLoop, stopGameLoop, gameStateRef]);

  // Note: Removed timer reset useEffects as they were causing constant hook reinitialization
  // Timer resets are now handled within the game loop logic itself

  return {
    startGameLoop,
    stopGameLoop,
    isRunning: isRunningRef.current,
  };
}
