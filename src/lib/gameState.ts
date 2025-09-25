import type { GameState, GameAction, Tetromino, TetrominoType, AnimationState } from "@/types";
import { createEmptyBoard, placePiece, isGameOver, isValidPosition } from "./board";
import { TETROMINO_SHAPES, GAME_CONFIG, BOARD_WIDTH } from "@/constants/game";
import {
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  rotatePiece,
  hardDropPiece,
  shouldLockPiece,
} from "./movement";
import {
  processLineClearing,
  calculateSoftDropScore,
  calculateHardDropScore,
  calculateDropSpeed,
  calculateLevel,
  calculateLineScore,
} from "./scoring";

// Re-export for backward compatibility with existing tests
export { calculateLevel, calculateLineScore as calculateScore } from "./scoring";

/**
 * Creates a random tetromino piece
 * @returns A new random tetromino piece
 */
export function createRandomTetromino(): Tetromino {
  const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  const randomType = types[Math.floor(Math.random() * types.length)];

  return {
    type: randomType,
    shape: TETROMINO_SHAPES[randomType][0], // Start with first rotation
    position: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: -1 }, // Start above visible board
    rotation: 0,
  };
}

/**
 * Creates the initial animation state
 * @returns Initial animation state
 */
export function createInitialAnimationState(): AnimationState {
  return {
    lastAction: null,
    clearingLines: [],
    isAnimating: false,
  };
}

/**
 * Creates the initial game state
 * @returns Initial game state
 */
export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: createRandomTetromino(),
    heldPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    linesCleared: 0,
    gameStatus: "ready",
    dropTimer: 0,
    lastDropTime: 0,
    animation: createInitialAnimationState(),
  };
}

// Note: Scoring functions moved to ./scoring.ts for better organization

/**
 * Validates if a game state transition is valid
 * @param currentState - Current game state
 * @param action - Action to validate
 * @returns true if the transition is valid
 */
export function isValidStateTransition(currentState: GameState, action: GameAction): boolean {
  switch (action.type) {
    case "MOVE_LEFT":
    case "MOVE_RIGHT":
    case "MOVE_DOWN":
    case "ROTATE":
    case "HARD_DROP":
      return currentState.gameStatus === "playing" && currentState.currentPiece !== null;

    case "HOLD_PIECE":
      return currentState.gameStatus === "playing" && currentState.currentPiece !== null && currentState.canHold;

    case "PAUSE_GAME":
      return currentState.gameStatus === "playing";

    case "RESUME_GAME":
      return currentState.gameStatus === "paused";

    case "RESTART_GAME":
      return true; // Can always restart

    case "GAME_TICK":
      return currentState.gameStatus === "playing";

    case "LOCK_PIECE":
      return currentState.gameStatus === "playing" && currentState.currentPiece !== null;

    case "SPAWN_PIECE":
      return (
        (currentState.gameStatus === "playing" || currentState.gameStatus === "ready") &&
        currentState.currentPiece === null
      );

    case "CLEAR_LINES":
      return currentState.gameStatus === "playing";

    case "START_LINE_CLEAR_ANIMATION":
    case "END_LINE_CLEAR_ANIMATION":
    case "SET_LAST_ACTION":
      return true; // Animation actions can happen in any state

    default:
      return false;
  }
}

/**
 * Game state reducer function
 * @param state - Current game state
 * @param action - Action to process
 * @returns New game state
 */
export function gameStateReducer(state: GameState, action: GameAction): GameState {
  // Validate state transition
  if (!isValidStateTransition(state, action)) {
    return state;
  }

  switch (action.type) {
    case "MOVE_LEFT": {
      if (!state.currentPiece) return state;

      const newPiece = movePieceLeft(state.board, state.currentPiece);

      return {
        ...state,
        currentPiece: newPiece,
        animation: {
          ...state.animation,
          lastAction: "move",
        },
      };
    }

    case "MOVE_RIGHT": {
      if (!state.currentPiece) return state;

      const newPiece = movePieceRight(state.board, state.currentPiece);

      return {
        ...state,
        currentPiece: newPiece,
        animation: {
          ...state.animation,
          lastAction: "move",
        },
      };
    }

    case "MOVE_DOWN": {
      if (!state.currentPiece) return state;

      const newPiece = movePieceDown(state.board, state.currentPiece);

      // Only award soft drop points if the piece actually moved
      const didMove = newPiece.position.y > state.currentPiece.position.y;
      const scoreBonus = didMove ? calculateSoftDropScore(1) : 0;

      // Check if piece should be locked after this move
      if (shouldLockPiece(state.board, newPiece)) {
        // Trigger piece locking in the next game tick
        return {
          ...state,
          currentPiece: newPiece,
          score: state.score + scoreBonus,
        };
      }

      return {
        ...state,
        currentPiece: newPiece,
        score: state.score + scoreBonus,
        animation: {
          ...state.animation,
          lastAction: "move",
        },
      };
    }

    case "ROTATE": {
      if (!state.currentPiece) return state;

      const newPiece = rotatePiece(state.board, state.currentPiece);

      return {
        ...state,
        currentPiece: newPiece,
        animation: {
          ...state.animation,
          lastAction: "rotate",
        },
      };
    }

    case "HARD_DROP": {
      if (!state.currentPiece) return state;

      const { piece: droppedPiece, dropDistance } = hardDropPiece(state.board, state.currentPiece);
      const scoreBonus = calculateHardDropScore(dropDistance);

      // Place the piece on the board immediately
      const boardWithPiece = placePiece(state.board, droppedPiece);

      // Process line clearing and scoring
      const { newBoard, linesCleared, clearedLineIndices, scoreGained, newScore, newLevel, newTotalLines } =
        processLineClearing(boardWithPiece, state.level, state.score + scoreBonus, state.linesCleared);

      // Check for game over
      if (isGameOver(newBoard)) {
        return {
          ...state,
          board: newBoard,
          currentPiece: null,
          gameStatus: "gameOver",
          score: newScore,
          level: newLevel,
          linesCleared: newTotalLines,
          animation: {
            ...state.animation,
            lastAction: "hard_drop",
            clearingLines: clearedLineIndices,
            isAnimating: clearedLineIndices.length > 0,
          },
        };
      }

      // Spawn next piece immediately
      return {
        ...state,
        board: newBoard,
        currentPiece: state.nextPiece,
        nextPiece: createRandomTetromino(),
        canHold: true, // Reset hold ability when piece is locked
        score: newScore,
        level: newLevel,
        linesCleared: newTotalLines,
        animation: {
          ...state.animation,
          lastAction: "hard_drop",
          clearingLines: clearedLineIndices,
          isAnimating: clearedLineIndices.length > 0,
        },
      };
    }

    case "HOLD_PIECE": {
      if (!state.currentPiece || !state.canHold) return state;

      const currentPiece = state.currentPiece;
      const heldPiece = state.heldPiece;

      // Reset piece position and rotation
      const resetPiece = (piece: Tetromino): Tetromino => ({
        ...piece,
        position: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: -1 },
        rotation: 0,
        shape: TETROMINO_SHAPES[piece.type][0],
      });

      if (heldPiece) {
        // Swap current piece with held piece
        return {
          ...state,
          currentPiece: resetPiece(heldPiece),
          heldPiece: resetPiece(currentPiece),
          canHold: false,
        };
      } else {
        // Hold current piece and spawn next piece
        return {
          ...state,
          currentPiece: resetPiece(state.nextPiece),
          nextPiece: createRandomTetromino(),
          heldPiece: resetPiece(currentPiece),
          canHold: false,
        };
      }
    }

    case "PAUSE_GAME": {
      return {
        ...state,
        gameStatus: "paused",
      };
    }

    case "RESUME_GAME": {
      const newState = {
        ...state,
        gameStatus: "playing" as const,
      };

      // If there's no current piece when resuming, spawn one
      if (!newState.currentPiece) {
        return {
          ...newState,
          currentPiece: newState.nextPiece,
          nextPiece: createRandomTetromino(),
        };
      }

      return newState;
    }

    case "RESTART_GAME": {
      return createInitialGameState();
    }

    case "GAME_TICK": {
      const currentTime = Date.now();
      const dropSpeed = calculateDropSpeed(state.level);

      return {
        ...state,
        dropTimer: state.dropTimer + (currentTime - state.lastDropTime),
        lastDropTime: currentTime,
      };
    }

    case "LOCK_PIECE": {
      if (!state.currentPiece) return state;

      // Place the piece on the board
      const boardWithPiece = placePiece(state.board, state.currentPiece);

      // Process line clearing and scoring
      const { newBoard, linesCleared, clearedLineIndices, scoreGained, newScore, newLevel, newTotalLines } =
        processLineClearing(boardWithPiece, state.level, state.score, state.linesCleared);

      // Check for game over
      if (isGameOver(newBoard)) {
        return {
          ...state,
          board: newBoard,
          currentPiece: null,
          gameStatus: "gameOver",
          score: newScore,
          level: newLevel,
          linesCleared: newTotalLines,
        };
      }

      return {
        ...state,
        board: newBoard,
        currentPiece: null,
        canHold: true, // Reset hold ability when piece is locked
        score: newScore,
        level: newLevel,
        linesCleared: newTotalLines,
        animation: {
          ...state.animation,
          clearingLines: clearedLineIndices,
          isAnimating: clearedLineIndices.length > 0,
          lastAction: null,
        },
      };
    }

    case "SPAWN_PIECE": {
      if (state.currentPiece !== null) return state;

      const newPiece = state.nextPiece;

      // Check if the new piece can be placed at spawn position
      // If not, trigger game over
      if (!isValidPosition(state.board, newPiece)) {
        return {
          ...state,
          gameStatus: "gameOver",
        };
      }

      return {
        ...state,
        currentPiece: newPiece,
        nextPiece: createRandomTetromino(),
        gameStatus: "playing", // Always set to playing when spawning a piece
      };
    }

    case "CLEAR_LINES": {
      // This action is for manually triggering line clearing with a specific count
      // Mainly used for testing purposes
      const { linesCleared } = action.payload;

      const newScore = state.score + calculateLineScore(linesCleared, state.level);
      const newTotalLines = state.linesCleared + linesCleared;
      const newLevel = calculateLevel(newTotalLines);

      return {
        ...state,
        score: newScore,
        level: newLevel,
        linesCleared: newTotalLines,
      };
    }

    case "START_LINE_CLEAR_ANIMATION": {
      const { lines } = action.payload;
      return {
        ...state,
        animation: {
          ...state.animation,
          clearingLines: lines,
          isAnimating: true,
        },
      };
    }

    case "END_LINE_CLEAR_ANIMATION": {
      return {
        ...state,
        animation: {
          ...state.animation,
          clearingLines: [],
          isAnimating: false,
        },
      };
    }

    case "SET_LAST_ACTION": {
      const { action: lastAction } = action.payload;
      return {
        ...state,
        animation: {
          ...state.animation,
          lastAction,
        },
      };
    }

    default:
      return state;
  }
}
