import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../useGameState";

describe("useGameState", () => {
  it("should initialize with correct initial state", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.gameStatus).toBe("ready");
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.level).toBe(1);
    expect(result.current.gameState.linesCleared).toBe(0);
    expect(result.current.gameState.currentPiece).toBeNull();
    expect(result.current.gameState.canHold).toBe(true);
  });

  it("should provide correct computed values", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.isGameActive).toBe(false);
    expect(result.current.canMovePiece).toBe(false);
    expect(result.current.canHoldPiece).toBe(false);
    expect(result.current.dropSpeed).toBe(1000); // Initial drop speed
  });

  it("should provide action helper functions", () => {
    const { result } = renderHook(() => useGameState());

    expect(typeof result.current.moveLeft).toBe("function");
    expect(typeof result.current.moveRight).toBe("function");
    expect(typeof result.current.moveDown).toBe("function");
    expect(typeof result.current.rotate).toBe("function");
    expect(typeof result.current.hardDrop).toBe("function");
    expect(typeof result.current.holdPiece).toBe("function");
    expect(typeof result.current.pauseGame).toBe("function");
    expect(typeof result.current.resumeGame).toBe("function");
    expect(typeof result.current.restartGame).toBe("function");
  });

  it("should handle restart game action", () => {
    const { result } = renderHook(() => useGameState());

    // Restart should always work
    act(() => {
      result.current.restartGame();
    });

    expect(result.current.gameState.gameStatus).toBe("ready");
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.level).toBe(1);
    expect(result.current.gameState.linesCleared).toBe(0);
  });

  it("should validate actions before dispatching", () => {
    const { result } = renderHook(() => useGameState());
    const initialState = result.current.gameState;

    // Try to move when game is not active and no current piece
    act(() => {
      result.current.moveLeft();
    });

    // State should remain unchanged
    expect(result.current.gameState).toEqual(initialState);
  });

  it("should handle direct dispatch calls", () => {
    const { result } = renderHook(() => useGameState());

    // Test direct dispatch functionality
    act(() => {
      result.current.dispatch({ type: "RESTART_GAME" });
    });

    expect(result.current.gameState.gameStatus).toBe("ready");
  });

  it("should provide dispatch function", () => {
    const { result } = renderHook(() => useGameState());

    expect(typeof result.current.dispatch).toBe("function");
  });

  it("should calculate drop speed correctly", () => {
    const { result } = renderHook(() => useGameState());

    // Initial level should have base drop speed
    expect(result.current.dropSpeed).toBe(1000);
    expect(result.current.gameState.level).toBe(1);
  });
});
