import {
  createRandomTetromino,
  createInitialGameState,
  calculateScore,
  calculateLevel,
  isValidStateTransition,
  gameStateReducer,
} from "../gameState";
import { calculateDropSpeed } from "../scoring";
import type { GameState, GameAction } from "@/types";
import { GAME_CONFIG } from "@/constants/game";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("gameState", () => {
  describe("createRandomTetromino", () => {
    it("should create a tetromino with valid type", () => {
      const tetromino = createRandomTetromino();
      const validTypes = ["I", "O", "T", "S", "Z", "J", "L"];

      expect(validTypes).toContain(tetromino.type);
      expect(tetromino.rotation).toBe(0);
      expect(tetromino.position.x).toBe(3); // Math.floor(10/2) - 2
      expect(tetromino.position.y).toBe(-1);
      expect(tetromino.shape).toBeDefined();
      expect(Array.isArray(tetromino.shape)).toBe(true);
    });

    it("should create different pieces over multiple calls", () => {
      const pieces = Array.from({ length: 20 }, () => createRandomTetromino());
      const uniqueTypes = new Set(pieces.map((p) => p.type));

      // With 20 pieces, we should get some variety (not guaranteed but very likely)
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
  });

  describe("createInitialGameState", () => {
    it("should create valid initial state", () => {
      const state = createInitialGameState();

      expect(state.board).toHaveLength(20);
      expect(state.board[0]).toHaveLength(10);
      expect(state.currentPiece).toBeNull();
      expect(state.nextPiece).toBeDefined();
      expect(state.heldPiece).toBeNull();
      expect(state.canHold).toBe(true);
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.linesCleared).toBe(0);
      expect(state.gameStatus).toBe("ready");
      expect(state.dropTimer).toBe(0);
      expect(state.lastDropTime).toBe(0);
    });

    it("should create empty board", () => {
      const state = createInitialGameState();

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(state.board[row][col]).toBeNull();
        }
      }
    });
  });

  describe("calculateScore", () => {
    it("should calculate correct score for single line", () => {
      expect(calculateScore(1, 1)).toBe(100);
      expect(calculateScore(1, 2)).toBe(200);
      expect(calculateScore(1, 5)).toBe(500);
    });

    it("should calculate correct score for double lines", () => {
      expect(calculateScore(2, 1)).toBe(300);
      expect(calculateScore(2, 3)).toBe(900);
    });

    it("should calculate correct score for triple lines", () => {
      expect(calculateScore(3, 1)).toBe(500);
      expect(calculateScore(3, 2)).toBe(1000);
    });

    it("should calculate correct score for tetris", () => {
      expect(calculateScore(4, 1)).toBe(800);
      expect(calculateScore(4, 3)).toBe(2400);
    });

    it("should return 0 for invalid line counts", () => {
      expect(calculateScore(0, 1)).toBe(0);
      expect(calculateScore(5, 1)).toBe(0);
      expect(calculateScore(-1, 1)).toBe(0);
    });
  });

  describe("calculateLevel", () => {
    it("should start at level 1", () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(5)).toBe(1);
      expect(calculateLevel(9)).toBe(1);
    });

    it("should increase level every 10 lines", () => {
      expect(calculateLevel(10)).toBe(2);
      expect(calculateLevel(15)).toBe(2);
      expect(calculateLevel(20)).toBe(3);
      expect(calculateLevel(25)).toBe(3);
      expect(calculateLevel(100)).toBe(11);
    });
  });

  describe("calculateDropSpeed", () => {
    it("should decrease speed as level increases", () => {
      const speed1 = calculateDropSpeed(1);
      const speed2 = calculateDropSpeed(2);
      const speed5 = calculateDropSpeed(5);

      expect(speed2).toBeLessThan(speed1);
      expect(speed5).toBeLessThan(speed2);
    });

    it("should have minimum speed limit", () => {
      const highLevelSpeed = calculateDropSpeed(20);
      expect(highLevelSpeed).toBeGreaterThanOrEqual(50);
    });

    it("should start with base speed", () => {
      const initialSpeed = calculateDropSpeed(1);
      expect(initialSpeed).toBe(GAME_CONFIG.dropSpeed);
    });
  });

  describe("isValidStateTransition", () => {
    let playingState: GameState;
    let pausedState: GameState;
    let gameOverState: GameState;

    beforeEach(() => {
      playingState = {
        ...createInitialGameState(),
        gameStatus: "playing",
        currentPiece: createRandomTetromino(),
      };

      pausedState = {
        ...playingState,
        gameStatus: "paused",
      };

      gameOverState = {
        ...playingState,
        gameStatus: "gameOver",
        currentPiece: null,
      };
    });

    it("should allow movement actions when playing with current piece", () => {
      expect(isValidStateTransition(playingState, { type: "MOVE_LEFT" })).toBe(true);
      expect(isValidStateTransition(playingState, { type: "MOVE_RIGHT" })).toBe(true);
      expect(isValidStateTransition(playingState, { type: "MOVE_DOWN" })).toBe(true);
      expect(isValidStateTransition(playingState, { type: "ROTATE" })).toBe(true);
      expect(isValidStateTransition(playingState, { type: "HARD_DROP" })).toBe(true);
    });

    it("should not allow movement actions when paused", () => {
      expect(isValidStateTransition(pausedState, { type: "MOVE_LEFT" })).toBe(false);
      expect(isValidStateTransition(pausedState, { type: "MOVE_RIGHT" })).toBe(false);
      expect(isValidStateTransition(pausedState, { type: "ROTATE" })).toBe(false);
    });

    it("should not allow movement actions without current piece", () => {
      const stateWithoutPiece = { ...playingState, currentPiece: null };

      expect(isValidStateTransition(stateWithoutPiece, { type: "MOVE_LEFT" })).toBe(false);
      expect(isValidStateTransition(stateWithoutPiece, { type: "ROTATE" })).toBe(false);
    });

    it("should allow hold piece when conditions are met", () => {
      expect(isValidStateTransition(playingState, { type: "HOLD_PIECE" })).toBe(true);

      const cantHoldState = { ...playingState, canHold: false };
      expect(isValidStateTransition(cantHoldState, { type: "HOLD_PIECE" })).toBe(false);
    });

    it("should handle pause/resume correctly", () => {
      expect(isValidStateTransition(playingState, { type: "PAUSE_GAME" })).toBe(true);
      expect(isValidStateTransition(pausedState, { type: "RESUME_GAME" })).toBe(true);

      expect(isValidStateTransition(pausedState, { type: "PAUSE_GAME" })).toBe(false);
      expect(isValidStateTransition(playingState, { type: "RESUME_GAME" })).toBe(false);
    });

    it("should always allow restart", () => {
      expect(isValidStateTransition(playingState, { type: "RESTART_GAME" })).toBe(true);
      expect(isValidStateTransition(pausedState, { type: "RESTART_GAME" })).toBe(true);
      expect(isValidStateTransition(gameOverState, { type: "RESTART_GAME" })).toBe(true);
    });
  });

  describe("gameStateReducer", () => {
    let initialState: GameState;

    beforeEach(() => {
      initialState = createInitialGameState();
    });

    it("should return same state for invalid transitions", () => {
      const action: GameAction = { type: "MOVE_LEFT" };
      const result = gameStateReducer(initialState, action);

      expect(result).toBe(initialState);
    });

    it("should handle MOVE_LEFT action", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: createRandomTetromino(),
      };

      const result = gameStateReducer(state, { type: "MOVE_LEFT" });

      expect(result.currentPiece?.position.x).toBe(state.currentPiece!.position.x - 1);
      expect(result.currentPiece?.position.y).toBe(state.currentPiece!.position.y);
    });

    it("should handle MOVE_RIGHT action", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: createRandomTetromino(),
      };

      const result = gameStateReducer(state, { type: "MOVE_RIGHT" });

      expect(result.currentPiece?.position.x).toBe(state.currentPiece!.position.x + 1);
    });

    it("should handle MOVE_DOWN action and add soft drop score", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: createRandomTetromino(),
        score: 100,
      };

      const result = gameStateReducer(state, { type: "MOVE_DOWN" });

      expect(result.currentPiece?.position.y).toBe(state.currentPiece!.position.y + 1);
      expect(result.score).toBe(state.score + GAME_CONFIG.scoring.softDrop);
    });

    it("should handle ROTATE action", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: createRandomTetromino(),
      };

      const result = gameStateReducer(state, { type: "ROTATE" });

      expect(result.currentPiece?.rotation).toBe((state.currentPiece!.rotation + 1) % 4);
    });

    it("should handle PAUSE_GAME action", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
      };

      const result = gameStateReducer(state, { type: "PAUSE_GAME" });

      expect(result.gameStatus).toBe("paused");
    });

    it("should handle RESUME_GAME action", () => {
      const state = {
        ...initialState,
        gameStatus: "paused" as const,
      };

      const result = gameStateReducer(state, { type: "RESUME_GAME" });

      expect(result.gameStatus).toBe("playing");
    });

    it("should handle RESTART_GAME action", () => {
      const state = {
        ...initialState,
        gameStatus: "gameOver" as const,
        score: 1000,
        level: 5,
      };

      const result = gameStateReducer(state, { type: "RESTART_GAME" });

      expect(result.gameStatus).toBe("ready");
      expect(result.score).toBe(0);
      expect(result.level).toBe(1);
      expect(result.linesCleared).toBe(0);
    });

    it("should handle HOLD_PIECE action with no held piece", () => {
      const currentPiece = createRandomTetromino();
      const nextPiece = createRandomTetromino();

      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece,
        nextPiece,
        canHold: true,
      };

      const result = gameStateReducer(state, { type: "HOLD_PIECE" });

      expect(result.heldPiece?.type).toBe(currentPiece.type);
      expect(result.currentPiece?.type).toBe(nextPiece.type);
      expect(result.canHold).toBe(false);
      expect(result.nextPiece).not.toBe(nextPiece); // Should be a new piece
    });

    it("should handle HOLD_PIECE action with existing held piece", () => {
      const currentPiece = createRandomTetromino();
      const heldPiece = createRandomTetromino();

      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece,
        heldPiece,
        canHold: true,
      };

      const result = gameStateReducer(state, { type: "HOLD_PIECE" });

      expect(result.heldPiece?.type).toBe(currentPiece.type);
      expect(result.currentPiece?.type).toBe(heldPiece.type);
      expect(result.canHold).toBe(false);
    });

    it("should handle SPAWN_PIECE action", () => {
      const nextPiece = createRandomTetromino();

      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: null,
        nextPiece,
      };

      const result = gameStateReducer(state, { type: "SPAWN_PIECE" });

      expect(result.currentPiece?.type).toBe(nextPiece.type);
      expect(result.nextPiece).not.toBe(nextPiece); // Should be a new piece
    });

    it("should handle CLEAR_LINES action", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        score: 100,
        level: 1,
        linesCleared: 5,
      };

      const result = gameStateReducer(state, {
        type: "CLEAR_LINES",
        payload: { linesCleared: 2 },
      });

      expect(result.score).toBe(state.score + calculateScore(2, 1));
      expect(result.linesCleared).toBe(7);
      expect(result.level).toBe(1); // Still level 1 with 7 total lines
    });

    it("should handle level progression with CLEAR_LINES", () => {
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        linesCleared: 8,
        level: 1,
      };

      const result = gameStateReducer(state, {
        type: "CLEAR_LINES",
        payload: { linesCleared: 3 },
      });

      expect(result.linesCleared).toBe(11);
      expect(result.level).toBe(2); // Should advance to level 2
    });

    it("should handle SPAWN_PIECE action and trigger game over when piece cannot spawn", () => {
      // Create a board with blocks at the top to simulate game over condition
      const blockedBoard = createInitialGameState().board;
      // Fill the top row to block spawning
      for (let col = 0; col < 10; col++) {
        blockedBoard[0][col] = "I";
      }

      const nextPiece = createRandomTetromino();
      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: null,
        nextPiece,
        board: blockedBoard,
      };

      const result = gameStateReducer(state, { type: "SPAWN_PIECE" });

      expect(result.gameStatus).toBe("gameOver");
      expect(result.currentPiece).toBeNull();
    });

    it("should handle LOCK_PIECE action and trigger game over when board is full", () => {
      // Create a piece at the top of the board
      const piece = createRandomTetromino();
      piece.position = { x: 4, y: 0 };

      // Create a board that will trigger game over after placing piece
      const almostFullBoard = createInitialGameState().board;
      // Fill the spawn area (rows 0-1, columns 3-6) partially to trigger game over
      // but don't create complete lines that would be cleared
      almostFullBoard[1][3] = "I";
      almostFullBoard[1][4] = "I";
      almostFullBoard[1][5] = "I";
      // Add some blocks in other areas so the piece placement will cause game over
      for (let row = 3; row < 15; row++) {
        for (let col = 0; col < 8; col++) {
          almostFullBoard[row][col] = "I";
        }
      }

      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: piece,
        board: almostFullBoard,
      };

      const result = gameStateReducer(state, { type: "LOCK_PIECE" });


      expect(result.gameStatus).toBe("gameOver");
      expect(result.currentPiece).toBeNull();
    });

    it("should reset canHold when piece is locked", () => {
      const piece = createRandomTetromino();
      piece.position = { x: 4, y: 18 }; // Near bottom

      const state = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: piece,
        canHold: false,
      };

      const result = gameStateReducer(state, { type: "LOCK_PIECE" });

      expect(result.canHold).toBe(true);
      expect(result.currentPiece).toBeNull();
    });
  });

  describe("Game Over Detection", () => {
    it("should detect game over when spawning piece fails", () => {
      const state = createInitialGameState();

      // Fill the spawn area to block new pieces
      const blockedBoard = state.board.map((row) => [...row]);
      for (let col = 0; col < 10; col++) {
        blockedBoard[0][col] = "I";
        blockedBoard[1][col] = "I";
      }

      const gameOverState = {
        ...state,
        gameStatus: "playing" as const,
        board: blockedBoard,
        currentPiece: null,
      };

      const result = gameStateReducer(gameOverState, { type: "SPAWN_PIECE" });
      expect(result.gameStatus).toBe("gameOver");
    });

    it("should allow spawning when there is space", () => {
      const state = {
        ...createInitialGameState(),
        gameStatus: "playing" as const,
        currentPiece: null,
      };

      const result = gameStateReducer(state, { type: "SPAWN_PIECE" });
      expect(result.gameStatus).toBe("playing");
      expect(result.currentPiece).not.toBeNull();
    });
  });

  describe("Restart Functionality", () => {
    it("should reset all game state on restart", () => {
      const gameOverState = {
        ...createInitialGameState(),
        gameStatus: "gameOver" as const,
        score: 5000,
        level: 8,
        linesCleared: 75,
        currentPiece: createRandomTetromino(),
        heldPiece: createRandomTetromino(),
        canHold: false,
      };

      const result = gameStateReducer(gameOverState, { type: "RESTART_GAME" });

      expect(result.gameStatus).toBe("ready");
      expect(result.score).toBe(0);
      expect(result.level).toBe(1);
      expect(result.linesCleared).toBe(0);
      expect(result.currentPiece).toBeNull();
      expect(result.heldPiece).toBeNull();
      expect(result.canHold).toBe(true);
      expect(result.dropTimer).toBe(0);
      expect(result.lastDropTime).toBe(0);
    });

    it("should create fresh board on restart", () => {
      const gameOverState = createInitialGameState();
      // Fill some board positions
      gameOverState.board[19][0] = "I";
      gameOverState.board[19][1] = "T";
      gameOverState.gameStatus = "gameOver";

      const result = gameStateReducer(gameOverState, { type: "RESTART_GAME" });

      // Check that board is completely empty
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(result.board[row][col]).toBeNull();
        }
      }
    });
  });
});
