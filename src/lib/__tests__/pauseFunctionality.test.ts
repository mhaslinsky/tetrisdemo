import { gameStateReducer, createInitialGameState, isValidStateTransition } from "../gameState";
import type { GameState, GameAction } from "@/types";

describe("Pause Functionality", () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe("State Transitions", () => {
    it("allows pausing when game is playing", () => {
      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      expect(isValidStateTransition(playingState, pauseAction)).toBe(true);
    });

    it("allows resuming when game is paused", () => {
      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
      };

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      expect(isValidStateTransition(pausedState, resumeAction)).toBe(true);
    });

    it("prevents pausing when game is not playing", () => {
      const readyState: GameState = {
        ...initialState,
        gameStatus: "ready",
      };

      const gameOverState: GameState = {
        ...initialState,
        gameStatus: "gameOver",
      };

      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };

      expect(isValidStateTransition(readyState, pauseAction)).toBe(false);
      expect(isValidStateTransition(gameOverState, pauseAction)).toBe(false);
      expect(isValidStateTransition(pausedState, pauseAction)).toBe(false);
    });

    it("prevents resuming when game is not paused", () => {
      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
      };

      const readyState: GameState = {
        ...initialState,
        gameStatus: "ready",
      };

      const gameOverState: GameState = {
        ...initialState,
        gameStatus: "gameOver",
      };

      const resumeAction: GameAction = { type: "RESUME_GAME" };

      expect(isValidStateTransition(playingState, resumeAction)).toBe(false);
      expect(isValidStateTransition(readyState, resumeAction)).toBe(false);
      expect(isValidStateTransition(gameOverState, resumeAction)).toBe(false);
    });

    it("prevents game actions when paused", () => {
      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
        currentPiece: {
          type: "T",
          shape: [
            [true, true, true],
            [false, true, false],
          ],
          position: { x: 4, y: 0 },
          rotation: 0,
        },
      };

      const gameActions: GameAction[] = [
        { type: "MOVE_LEFT" },
        { type: "MOVE_RIGHT" },
        { type: "MOVE_DOWN" },
        { type: "ROTATE" },
        { type: "HARD_DROP" },
        { type: "HOLD_PIECE" },
        { type: "GAME_TICK" },
        { type: "LOCK_PIECE" },
        { type: "SPAWN_PIECE" },
        { type: "CLEAR_LINES", payload: { linesCleared: 1 } },
      ];

      gameActions.forEach((action) => {
        expect(isValidStateTransition(pausedState, action)).toBe(false);
      });
    });
  });

  describe("Pause Action", () => {
    it("transitions from playing to paused", () => {
      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
        score: 1000,
        level: 2,
        linesCleared: 5,
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      const newState = gameStateReducer(playingState, pauseAction);

      expect(newState.gameStatus).toBe("paused");
      // All other state should remain unchanged
      expect(newState.score).toBe(1000);
      expect(newState.level).toBe(2);
      expect(newState.linesCleared).toBe(5);
      expect(newState.board).toBe(playingState.board);
      expect(newState.currentPiece).toBe(playingState.currentPiece);
      expect(newState.nextPiece).toBe(playingState.nextPiece);
      expect(newState.heldPiece).toBe(playingState.heldPiece);
    });

    it("does not change state when pausing from invalid state", () => {
      const readyState: GameState = {
        ...initialState,
        gameStatus: "ready",
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      const newState = gameStateReducer(readyState, pauseAction);

      expect(newState).toBe(readyState); // Should return same reference
      expect(newState.gameStatus).toBe("ready");
    });
  });

  describe("Resume Action", () => {
    it("transitions from paused to playing", () => {
      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
        score: 1500,
        level: 3,
        linesCleared: 8,
        currentPiece: {
          type: "T",
          shape: [
            [true, true, true],
            [false, true, false],
          ],
          position: { x: 4, y: 0 },
          rotation: 0,
        },
      };

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const newState = gameStateReducer(pausedState, resumeAction);

      expect(newState.gameStatus).toBe("playing");
      // All other state should remain unchanged when there's a current piece
      expect(newState.score).toBe(1500);
      expect(newState.level).toBe(3);
      expect(newState.linesCleared).toBe(8);
      expect(newState.board).toBe(pausedState.board);
      expect(newState.currentPiece).toBe(pausedState.currentPiece);
      expect(newState.nextPiece).toBe(pausedState.nextPiece);
      expect(newState.heldPiece).toBe(pausedState.heldPiece);
    });

    it("spawns a piece when resuming without current piece", () => {
      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
        currentPiece: null, // No current piece
        nextPiece: {
          type: "I",
          shape: [[true, true, true, true]],
          position: { x: 3, y: -1 },
          rotation: 0,
        },
      };

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const newState = gameStateReducer(pausedState, resumeAction);

      expect(newState.gameStatus).toBe("playing");
      expect(newState.currentPiece).toEqual(pausedState.nextPiece);
      expect(newState.nextPiece).not.toBe(pausedState.nextPiece); // Should be a new piece
      expect(newState.nextPiece.type).toMatch(/^[IOTSZJL]$/); // Should be a valid tetromino type
    });

    it("does not change state when resuming from invalid state", () => {
      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
      };

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const newState = gameStateReducer(playingState, resumeAction);

      expect(newState).toBe(playingState); // Should return same reference
      expect(newState.gameStatus).toBe("playing");
    });
  });

  describe("Game State Preservation During Pause", () => {
    it("preserves current piece position and rotation when paused", () => {
      const currentPiece = {
        type: "L" as const,
        shape: [
          [true, false, false],
          [true, true, true],
        ],
        position: { x: 3, y: 5 },
        rotation: 1,
      };

      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
        currentPiece,
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      const pausedState = gameStateReducer(playingState, pauseAction);

      expect(pausedState.currentPiece).toEqual(currentPiece);

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const resumedState = gameStateReducer(pausedState, resumeAction);

      expect(resumedState.currentPiece).toEqual(currentPiece);
    });

    it("preserves board state when paused and resumed", () => {
      const modifiedBoard = initialState.board.map((row, y) =>
        y === 19 ? row.map((_, x) => (x < 5 ? "I" : null)) : row
      );

      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
        board: modifiedBoard,
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      const pausedState = gameStateReducer(playingState, pauseAction);

      expect(pausedState.board).toBe(modifiedBoard);

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const resumedState = gameStateReducer(pausedState, resumeAction);

      expect(resumedState.board).toBe(modifiedBoard);
    });

    it("preserves game statistics when paused and resumed", () => {
      const playingState: GameState = {
        ...initialState,
        gameStatus: "playing",
        score: 2500,
        level: 4,
        linesCleared: 12,
        dropTimer: 500,
        lastDropTime: 1000,
      };

      const pauseAction: GameAction = { type: "PAUSE_GAME" };
      const pausedState = gameStateReducer(playingState, pauseAction);

      expect(pausedState.score).toBe(2500);
      expect(pausedState.level).toBe(4);
      expect(pausedState.linesCleared).toBe(12);
      expect(pausedState.dropTimer).toBe(500);
      expect(pausedState.lastDropTime).toBe(1000);

      const resumeAction: GameAction = { type: "RESUME_GAME" };
      const resumedState = gameStateReducer(pausedState, resumeAction);

      expect(resumedState.score).toBe(2500);
      expect(resumedState.level).toBe(4);
      expect(resumedState.linesCleared).toBe(12);
      expect(resumedState.dropTimer).toBe(500);
      expect(resumedState.lastDropTime).toBe(1000);
    });
  });

  describe("Restart from Paused State", () => {
    it("allows restarting from paused state", () => {
      const pausedState: GameState = {
        ...initialState,
        gameStatus: "paused",
        score: 1000,
        level: 2,
      };

      const restartAction: GameAction = { type: "RESTART_GAME" };
      expect(isValidStateTransition(pausedState, restartAction)).toBe(true);

      const newState = gameStateReducer(pausedState, restartAction);
      expect(newState.gameStatus).toBe("ready");
      expect(newState.score).toBe(0);
      expect(newState.level).toBe(1);
    });
  });
});
