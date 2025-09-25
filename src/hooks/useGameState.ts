import { useReducer, useCallback, useMemo } from "react";
import type { GameState, GameAction } from "@/types";
import { gameStateReducer, createInitialGameState, isValidStateTransition } from "@/lib/gameState";
import { calculateDropSpeed } from "@/lib/scoring";

export interface UseGameStateReturn {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  isGameActive: boolean;
  canMovePiece: boolean;
  canHoldPiece: boolean;
  dropSpeed: number;
  // Action helpers
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  hardDrop: () => void;
  holdPiece: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  gameTick: () => void;
  lockPiece: () => void;
  spawnPiece: () => void;
  clearLines: (linesCleared: number) => void;
}

/**
 * Custom hook for managing Tetris game state
 * @returns Game state and action dispatchers
 */
export function useGameState(): UseGameStateReturn {
  const [gameState, dispatch] = useReducer(gameStateReducer, createInitialGameState());

  // Memoized computed values to prevent unnecessary recalculations
  const isGameActive = useMemo(() => {
    return gameState.gameStatus === "playing";
  }, [gameState.gameStatus]);

  const canMovePiece = useMemo(() => {
    return isGameActive && gameState.currentPiece !== null;
  }, [isGameActive, gameState.currentPiece]);

  const canHoldPiece = useMemo(() => {
    return canMovePiece && gameState.canHold;
  }, [canMovePiece, gameState.canHold]);

  const dropSpeed = useMemo(() => {
    return calculateDropSpeed(gameState.level);
  }, [gameState.level]);

  // Memoize game state validation to avoid expensive checks on every render
  const gameStateValidation = useMemo(() => {
    return {
      hasCurrentPiece: gameState.currentPiece !== null,
      hasNextPiece: gameState.nextPiece !== null,
      boardHeight: gameState.board.length,
      boardWidth: gameState.board[0]?.length || 0,
    };
  }, [gameState.currentPiece, gameState.nextPiece, gameState.board]);

  // Action helpers with validation
  const moveLeft = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "MOVE_LEFT" })) {
      dispatch({ type: "MOVE_LEFT" });
    }
  }, [gameState]);

  const moveRight = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "MOVE_RIGHT" })) {
      dispatch({ type: "MOVE_RIGHT" });
    }
  }, [gameState]);

  const moveDown = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "MOVE_DOWN" })) {
      dispatch({ type: "MOVE_DOWN" });
    }
  }, [gameState]);

  const rotate = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "ROTATE" })) {
      dispatch({ type: "ROTATE" });
    }
  }, [gameState]);

  const hardDrop = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "HARD_DROP" })) {
      dispatch({ type: "HARD_DROP" });
    }
  }, [gameState]);

  const holdPiece = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "HOLD_PIECE" })) {
      dispatch({ type: "HOLD_PIECE" });
    }
  }, [gameState]);

  const pauseGame = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "PAUSE_GAME" })) {
      dispatch({ type: "PAUSE_GAME" });
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "RESUME_GAME" })) {
      dispatch({ type: "RESUME_GAME" });
    }
  }, [gameState]);

  const restartGame = useCallback(() => {
    dispatch({ type: "RESTART_GAME" });
  }, []);

  const gameTick = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "GAME_TICK" })) {
      dispatch({ type: "GAME_TICK" });
    }
  }, [gameState]);

  const lockPiece = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "LOCK_PIECE" })) {
      dispatch({ type: "LOCK_PIECE" });
    }
  }, [gameState]);

  const spawnPiece = useCallback(() => {
    if (isValidStateTransition(gameState, { type: "SPAWN_PIECE" })) {
      dispatch({ type: "SPAWN_PIECE" });
    }
  }, [gameState]);

  const clearLines = useCallback(
    (linesCleared: number) => {
      const action = { type: "CLEAR_LINES" as const, payload: { linesCleared } };
      if (isValidStateTransition(gameState, action)) {
        dispatch(action);
      }
    },
    [gameState]
  );

  return {
    gameState,
    dispatch,
    isGameActive,
    canMovePiece,
    canHoldPiece,
    dropSpeed,
    // Action helpers
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
    clearLines,
  };
}
