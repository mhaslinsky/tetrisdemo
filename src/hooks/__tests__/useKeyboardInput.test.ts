import { renderHook, act } from "@testing-library/react";
import { useKeyboardInput, KEY_MAPPINGS, KeyAction } from "../useKeyboardInput";
import { GameAction } from "../../types/game";

// Mock timers
jest.useFakeTimers();

describe("useKeyboardInput", () => {
  let mockOnAction: jest.Mock<void, [GameAction]>;

  beforeEach(() => {
    mockOnAction = jest.fn();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Key mapping", () => {
    it("should map arrow keys to movement actions", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      expect(result.current.getActionForKey("ArrowLeft")).toBe("MOVE_LEFT");
      expect(result.current.getActionForKey("ArrowRight")).toBe("MOVE_RIGHT");
      expect(result.current.getActionForKey("ArrowDown")).toBe("MOVE_DOWN");
      expect(result.current.getActionForKey("ArrowUp")).toBe("ROTATE");
    });

    it("should map WASD keys to movement actions", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      expect(result.current.getActionForKey("KeyA")).toBe("MOVE_LEFT");
      expect(result.current.getActionForKey("KeyD")).toBe("MOVE_RIGHT");
      expect(result.current.getActionForKey("KeyS")).toBe("MOVE_DOWN");
      expect(result.current.getActionForKey("KeyW")).toBe("ROTATE");
    });

    it("should map special action keys", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      expect(result.current.getActionForKey("Space")).toBe("HARD_DROP");
      expect(result.current.getActionForKey("KeyC")).toBe("HOLD_PIECE");
      expect(result.current.getActionForKey("KeyP")).toBe("PAUSE_GAME");
      expect(result.current.getActionForKey("KeyR")).toBe("RESTART_GAME");
    });

    it("should return null for unmapped keys", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      expect(result.current.getActionForKey("KeyZ")).toBeNull();
      expect(result.current.getActionForKey("F1")).toBeNull();
    });
  });

  describe("Key press detection", () => {
    it("should detect when keys are pressed", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      // Simulate keydown
      act(() => {
        const event = new KeyboardEvent("keydown", { code: "ArrowLeft" });
        document.dispatchEvent(event);
      });

      expect(result.current.isKeyPressed("ArrowLeft")).toBe(true);
      expect(result.current.isActionPressed("MOVE_LEFT")).toBe(true);
    });

    it("should detect when keys are released", () => {
      const { result } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      // Simulate keydown then keyup
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(result.current.isKeyPressed("ArrowLeft")).toBe(true);

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowLeft" }));
      });

      expect(result.current.isKeyPressed("ArrowLeft")).toBe(false);
      expect(result.current.isActionPressed("MOVE_LEFT")).toBe(false);
    });
  });

  describe("Game action dispatch", () => {
    it("should dispatch MOVE_LEFT action for left arrow key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_LEFT" });
    });

    it("should dispatch MOVE_RIGHT action for right arrow key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_RIGHT" });
    });

    it("should dispatch MOVE_DOWN action for down arrow key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_DOWN" });
    });

    it("should dispatch ROTATE action for up arrow key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "ROTATE" });
    });

    it("should dispatch HARD_DROP action for space key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "HARD_DROP" });
    });

    it("should dispatch HOLD_PIECE action for C key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "HOLD_PIECE" });
    });

    it("should dispatch PAUSE_GAME action for P key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "PAUSE_GAME" });
    });

    it("should dispatch RESTART_GAME action for R key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR" }));
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: "RESTART_GAME" });
    });
  });

  describe("Key repeat functionality", () => {
    it("should repeat movement actions when key is held", () => {
      renderHook(() =>
        useKeyboardInput(mockOnAction, {
          enabled: true,
          repeatDelay: 100,
          repeatInterval: 50,
        })
      );

      // Initial keydown
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(mockOnAction).toHaveBeenCalledTimes(1);
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_LEFT" });

      // Fast forward past repeat delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Fast forward through several repeat intervals
      act(() => {
        jest.advanceTimersByTime(150); // 3 intervals of 50ms
      });

      expect(mockOnAction).toHaveBeenCalledTimes(4); // Initial + 3 repeats
    });

    it("should stop repeating when key is released", () => {
      renderHook(() =>
        useKeyboardInput(mockOnAction, {
          enabled: true,
          repeatDelay: 100,
          repeatInterval: 50,
        })
      );

      // Keydown
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      // Start repeating
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(mockOnAction).toHaveBeenCalledTimes(2);

      // Release key
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowLeft" }));
      });

      // Advance time - should not repeat anymore
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockOnAction).toHaveBeenCalledTimes(2); // No additional calls
    });

    it("should not repeat non-movement actions", () => {
      renderHook(() =>
        useKeyboardInput(mockOnAction, {
          enabled: true,
          repeatDelay: 100,
          repeatInterval: 50,
        })
      );

      // Press rotate key
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
      });

      expect(mockOnAction).toHaveBeenCalledTimes(1);

      // Advance time - should not repeat
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockOnAction).toHaveBeenCalledTimes(1); // No additional calls
    });
  });

  describe("Input debouncing", () => {
    it("should ignore repeated keydown events for the same key", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      // Multiple keydown events for same key
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple different keys pressed simultaneously", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
      });

      expect(mockOnAction).toHaveBeenCalledTimes(2);
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_LEFT" });
      expect(mockOnAction).toHaveBeenCalledWith({ type: "ROTATE" });
    });
  });

  describe("Enabled/disabled state", () => {
    it("should not handle input when disabled", () => {
      renderHook(() => useKeyboardInput(mockOnAction, { enabled: false }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(mockOnAction).not.toHaveBeenCalled();
    });

    it("should clear pressed keys when disabled", () => {
      const { result, rerender } = renderHook(({ enabled }) => useKeyboardInput(mockOnAction, { enabled }), {
        initialProps: { enabled: true },
      });

      // Press key while enabled
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      expect(result.current.isKeyPressed("ArrowLeft")).toBe(true);

      // Disable hook
      rerender({ enabled: false });

      expect(result.current.isKeyPressed("ArrowLeft")).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners on unmount", () => {
      const addEventListenerSpy = jest.spyOn(document, "addEventListener");
      const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() => useKeyboardInput(mockOnAction, { enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("keyup", expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("keyup", expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it("should clear all timers on unmount", () => {
      const { unmount } = renderHook(() =>
        useKeyboardInput(mockOnAction, {
          enabled: true,
          repeatDelay: 100,
          repeatInterval: 50,
        })
      );

      // Start key repeat
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      });

      // Unmount should clear timers
      unmount();

      // Advance time - no actions should be called
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockOnAction).toHaveBeenCalledTimes(1); // Only initial call
    });
  });

  describe("KEY_MAPPINGS constant", () => {
    it("should contain all expected key mappings", () => {
      expect(KEY_MAPPINGS.MOVE_LEFT).toEqual(["ArrowLeft", "KeyA"]);
      expect(KEY_MAPPINGS.MOVE_RIGHT).toEqual(["ArrowRight", "KeyD"]);
      expect(KEY_MAPPINGS.MOVE_DOWN).toEqual(["ArrowDown", "KeyS"]);
      expect(KEY_MAPPINGS.ROTATE).toEqual(["ArrowUp", "KeyW", "Space"]);
      expect(KEY_MAPPINGS.HARD_DROP).toEqual(["Space", "KeyX"]);
      expect(KEY_MAPPINGS.HOLD_PIECE).toEqual(["KeyC", "Shift"]);
      expect(KEY_MAPPINGS.PAUSE_GAME).toEqual(["KeyP", "Escape"]);
      expect(KEY_MAPPINGS.RESTART_GAME).toEqual(["KeyR"]);
    });
  });
});
