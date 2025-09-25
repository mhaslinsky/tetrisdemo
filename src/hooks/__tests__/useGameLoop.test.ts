import { renderHook, act } from "@testing-library/react";
import { useGameLoop } from "../useGameLoop";
import type { GameState, GameAction } from "@/types";
import { createInitialGameState } from "@/lib/gameState";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { jest } from "@jest/globals";

// Mock the dependencies
jest.mock("@/lib/scoring", () => ({
  calculateDropSpeed: jest.fn(() => 1000),
}));

jest.mock("@/lib/movement", () => ({
  shouldLockPiece: jest.fn(() => false),
}));

// Mock requestAnimationFrame with proper types - don't auto-call the callback
global.requestAnimationFrame = jest.fn(() => 1) as jest.MockedFunction<typeof requestAnimationFrame>;

global.cancelAnimationFrame = jest.fn() as jest.MockedFunction<typeof cancelAnimationFrame>;
global.performance = { now: jest.fn(() => 0) } as any;

describe("useGameLoop - Basic Tests", () => {
  let mockDispatch: jest.MockedFunction<React.Dispatch<GameAction>>;
  let gameState: GameState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    gameState = {
      ...createInitialGameState(),
      gameStatus: "playing",
      currentPiece: {
        type: "I",
        shape: [[true, true, true, true]],
        position: { x: 4, y: 0 },
        rotation: 0,
      },
    };
  });

  it("should start game loop when game is playing", () => {
    renderHook(() =>
      useGameLoop({
        gameState,
        dispatch: mockDispatch,
      })
    );

    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it("should dispatch GAME_TICK when animation frame is called", () => {
    renderHook(() =>
      useGameLoop({
        gameState,
        dispatch: mockDispatch,
      })
    );

    // Get the callback and call it
    const callback = (global.requestAnimationFrame as jest.Mock).mock.calls[0][0] as FrameRequestCallback;
    act(() => {
      callback(16);
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "GAME_TICK" });
  });

  it("should not start game loop when game is paused", () => {
    const pausedState = { ...gameState, gameStatus: "paused" as const };

    renderHook(() =>
      useGameLoop({
        gameState: pausedState,
        dispatch: mockDispatch,
      })
    );

    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("should stop game loop when game status changes from playing to paused", () => {
    type Props = { gameStatus: GameState["gameStatus"] };

    const { rerender } = renderHook(
      ({ gameStatus }: Props) =>
        useGameLoop({
          gameState: { ...gameState, gameStatus },
          dispatch: mockDispatch,
        }),
      { initialProps: { gameStatus: "playing" as GameState["gameStatus"] } }
    );

    // Change to paused
    rerender({ gameStatus: "paused" as GameState["gameStatus"] });

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("should provide start and stop functions", () => {
    const { result } = renderHook(() =>
      useGameLoop({
        gameState,
        dispatch: mockDispatch,
      })
    );

    expect(typeof result.current.startGameLoop).toBe("function");
    expect(typeof result.current.stopGameLoop).toBe("function");
    expect(typeof result.current.isRunning).toBe("boolean");
  });
});
