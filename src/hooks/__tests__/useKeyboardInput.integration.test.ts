import { renderHook, act } from "@testing-library/react";
import { useKeyboardInput } from "../useKeyboardInput";
import { GameAction } from "../../types/game";

// Mock timers for integration tests
jest.useFakeTimers();

describe("useKeyboardInput Integration", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch correct actions when integrated with game state", () => {
    const mockDispatch = jest.fn();
    const { result: keyboardResult } = renderHook(() => useKeyboardInput(mockDispatch, { enabled: true }));

    // Simulate keyboard input for movement
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "MOVE_LEFT" });
    expect(keyboardResult.current.isKeyPressed("ArrowLeft")).toBe(true);
    expect(keyboardResult.current.isActionPressed("MOVE_LEFT")).toBe(true);
  });

  it("should handle pause action dispatch", () => {
    const mockDispatch = jest.fn();
    renderHook(() => useKeyboardInput(mockDispatch, { enabled: true }));

    // Pause with keyboard
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "PAUSE_GAME" });
  });

  it("should handle restart action dispatch", () => {
    const mockDispatch = jest.fn();
    renderHook(() => useKeyboardInput(mockDispatch, { enabled: true }));

    // Restart with keyboard
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR" }));
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "RESTART_GAME" });
  });

  it("should handle multiple simultaneous key presses", () => {
    const mockDispatch = jest.fn();
    renderHook(() => useKeyboardInput(mockDispatch, { enabled: true }));

    // Press multiple keys simultaneously
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC" }));
    });

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "MOVE_LEFT" });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "ROTATE" });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "HOLD_PIECE" });
  });

  it("should handle key repeat for movement actions in integration", () => {
    const mockDispatch = jest.fn();
    renderHook(() =>
      useKeyboardInput(mockDispatch, {
        enabled: true,
        repeatDelay: 100,
        repeatInterval: 50,
      })
    );

    // Hold down left arrow
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Advance time to trigger repeats
    act(() => {
      jest.advanceTimersByTime(200); // Past delay + one interval
    });

    expect(mockDispatch).toHaveBeenCalledTimes(3); // Initial + 2 repeats
    expect(mockDispatch).toHaveBeenCalledWith({ type: "MOVE_LEFT" });
  });

  it("should disable input when keyboard hook is disabled", () => {
    const mockDispatch = jest.fn();
    const { rerender } = renderHook(({ enabled }) => useKeyboardInput(mockDispatch, { enabled }), {
      initialProps: { enabled: true },
    });

    // Input should work when enabled
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Disable input
    rerender({ enabled: false });

    // Input should not work when disabled
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1); // No additional calls
  });

  it("should work with action helper pattern", () => {
    // Simulate how it would be used with useGameState action helpers
    const actionHelpers = {
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      pauseGame: jest.fn(),
    };

    const mockActionHandler = jest.fn((action: GameAction) => {
      switch (action.type) {
        case "MOVE_LEFT":
          actionHelpers.moveLeft();
          break;
        case "MOVE_RIGHT":
          actionHelpers.moveRight();
          break;
        case "ROTATE":
          actionHelpers.rotate();
          break;
        case "HARD_DROP":
          actionHelpers.hardDrop();
          break;
        case "PAUSE_GAME":
          actionHelpers.pauseGame();
          break;
        default:
          break;
      }
    });

    renderHook(() => useKeyboardInput(mockActionHandler, { enabled: true }));

    // Test various actions
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    });

    expect(mockActionHandler).toHaveBeenCalledTimes(3);
    expect(actionHelpers.moveLeft).toHaveBeenCalledTimes(1);
    expect(actionHelpers.rotate).toHaveBeenCalledTimes(1);
    expect(actionHelpers.hardDrop).toHaveBeenCalledTimes(1);
  });
});
