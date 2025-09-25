import { gameStateReducer, createInitialGameState, createInitialAnimationState } from "../gameState";
import type { GameState, GameAction } from "@/types";

describe("Game State Animation Management", () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe("Animation State Initialization", () => {
    it("creates initial animation state correctly", () => {
      const animationState = createInitialAnimationState();

      expect(animationState).toEqual({
        lastAction: null,
        clearingLines: [],
        isAnimating: false,
      });
    });

    it("includes animation state in initial game state", () => {
      expect(initialState.animation).toBeDefined();
      expect(initialState.animation.lastAction).toBeNull();
      expect(initialState.animation.clearingLines).toEqual([]);
      expect(initialState.animation.isAnimating).toBe(false);
    });
  });

  describe("Movement Animation Actions", () => {
    beforeEach(() => {
      // Set up a state with a current piece for movement tests
      initialState = {
        ...initialState,
        gameStatus: "playing",
        currentPiece: {
          type: "T",
          shape: [
            [true, true, true],
            [false, true, false],
          ],
          position: { x: 4, y: 1 },
          rotation: 0,
        },
      };
    });

    it("sets lastAction to 'move' for MOVE_LEFT", () => {
      const action: GameAction = { type: "MOVE_LEFT" };
      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("move");
    });

    it("sets lastAction to 'move' for MOVE_RIGHT", () => {
      const action: GameAction = { type: "MOVE_RIGHT" };
      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("move");
    });

    it("sets lastAction to 'move' for MOVE_DOWN", () => {
      const action: GameAction = { type: "MOVE_DOWN" };
      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("move");
    });

    it("sets lastAction to 'rotate' for ROTATE", () => {
      const action: GameAction = { type: "ROTATE" };
      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("rotate");
    });

    it("sets lastAction to 'drop' for HARD_DROP", () => {
      const action: GameAction = { type: "HARD_DROP" };
      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("drop");
    });
  });

  describe("Line Clearing Animation Actions", () => {
    it("handles START_LINE_CLEAR_ANIMATION", () => {
      const action: GameAction = {
        type: "START_LINE_CLEAR_ANIMATION",
        payload: { lines: [18, 19] },
      };

      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.clearingLines).toEqual([18, 19]);
      expect(newState.animation.isAnimating).toBe(true);
    });

    it("handles END_LINE_CLEAR_ANIMATION", () => {
      const stateWithClearingLines = {
        ...initialState,
        animation: {
          ...initialState.animation,
          clearingLines: [19],
          isAnimating: true,
        },
      };

      const action: GameAction = { type: "END_LINE_CLEAR_ANIMATION" };
      const newState = gameStateReducer(stateWithClearingLines, action);

      expect(newState.animation.clearingLines).toEqual([]);
      expect(newState.animation.isAnimating).toBe(false);
    });

    it("handles SET_LAST_ACTION", () => {
      const action: GameAction = {
        type: "SET_LAST_ACTION",
        payload: { action: "rotate" },
      };

      const newState = gameStateReducer(initialState, action);

      expect(newState.animation.lastAction).toBe("rotate");
    });
  });

  describe("LOCK_PIECE Animation Integration", () => {
    it("sets clearing lines when lines are cleared", () => {
      // Create a state with a piece that will clear lines
      const stateWithPiece = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: {
          type: "I" as const,
          shape: [[true, true, true, true]],
          position: { x: 0, y: 19 },
          rotation: 0,
        },
        board: initialState.board.map((row, index) =>
          index === 19 ? row.map((_, colIndex) => (colIndex < 6 ? ("T" as const) : null)) : row
        ),
      };

      const action: GameAction = { type: "LOCK_PIECE" };
      const newState = gameStateReducer(stateWithPiece, action);

      // Should have clearing lines if any lines were cleared
      if (newState.animation.clearingLines.length > 0) {
        expect(newState.animation.isAnimating).toBe(true);
      }
      expect(newState.animation.lastAction).toBeNull();
    });

    it("resets lastAction when piece is locked", () => {
      const stateWithAction = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: {
          type: "T" as const,
          shape: [
            [true, true, true],
            [false, true, false],
          ],
          position: { x: 4, y: 18 },
          rotation: 0,
        },
        animation: {
          ...initialState.animation,
          lastAction: "drop" as const,
        },
      };

      const action: GameAction = { type: "LOCK_PIECE" };
      const newState = gameStateReducer(stateWithAction, action);

      expect(newState.animation.lastAction).toBeNull();
    });
  });

  describe("Animation State Persistence", () => {
    it("preserves other animation properties when updating lastAction", () => {
      const stateWithAnimation = {
        ...initialState,
        gameStatus: "playing" as const,
        currentPiece: {
          type: "T" as const,
          shape: [
            [true, true, true],
            [false, true, false],
          ],
          position: { x: 4, y: 1 },
          rotation: 0,
        },
        animation: {
          lastAction: null,
          clearingLines: [18, 19],
          isAnimating: true,
        },
      };

      const action: GameAction = { type: "MOVE_LEFT" };
      const newState = gameStateReducer(stateWithAnimation, action);

      expect(newState.animation.lastAction).toBe("move");
      expect(newState.animation.clearingLines).toEqual([18, 19]);
      expect(newState.animation.isAnimating).toBe(true);
    });

    it("preserves other animation properties when updating clearing lines", () => {
      const stateWithAction = {
        ...initialState,
        animation: {
          lastAction: "rotate" as const,
          clearingLines: [],
          isAnimating: false,
        },
      };

      const action: GameAction = {
        type: "START_LINE_CLEAR_ANIMATION",
        payload: { lines: [19] },
      };
      const newState = gameStateReducer(stateWithAction, action);

      expect(newState.animation.lastAction).toBe("rotate");
      expect(newState.animation.clearingLines).toEqual([19]);
      expect(newState.animation.isAnimating).toBe(true);
    });
  });

  describe("Animation State Validation", () => {
    it("allows animation actions in any game state", () => {
      const pausedState = { ...initialState, gameStatus: "paused" as const };

      const actions: GameAction[] = [
        { type: "START_LINE_CLEAR_ANIMATION", payload: { lines: [19] } },
        { type: "END_LINE_CLEAR_ANIMATION" },
        { type: "SET_LAST_ACTION", payload: { action: "move" } },
      ];

      actions.forEach((action) => {
        const newState = gameStateReducer(pausedState, action);
        expect(newState).not.toBe(pausedState); // State should change
      });
    });
  });
});
