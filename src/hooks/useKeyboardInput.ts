import { useEffect, useRef, useCallback } from "react";
import { GameAction } from "../types/game";

// Key mapping configuration
export const KEY_MAPPINGS = {
  // Movement keys
  MOVE_LEFT: ["ArrowLeft", "KeyA"],
  MOVE_RIGHT: ["ArrowRight", "KeyD"],
  MOVE_DOWN: ["ArrowDown", "KeyS"],

  // Rotation keys
  ROTATE: ["ArrowUp", "KeyW", "Space"],

  // Special actions
  HARD_DROP: ["Space", "KeyX"],
  HOLD_PIECE: ["KeyC", "Shift"],

  // Game control keys
  PAUSE_GAME: ["KeyP", "Escape"],
  RESTART_GAME: ["KeyR"],
} as const;

export type KeyAction = keyof typeof KEY_MAPPINGS;

export interface UseKeyboardInputOptions {
  enabled?: boolean;
  repeatDelay?: number;
  repeatInterval?: number;
}

export interface UseKeyboardInputReturn {
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
  isActionPressed: (action: KeyAction) => boolean;
  getActionForKey: (key: string) => KeyAction | null;
}

/**
 * Custom hook for handling keyboard input in the Tetris game
 * Provides key mapping, debouncing, and repeat handling
 */
export function useKeyboardInput(
  onAction: (action: GameAction) => void,
  options: UseKeyboardInputOptions = {}
): UseKeyboardInputReturn {
  const {
    enabled = true,
    repeatDelay = 150, // Initial delay before repeat starts (ms)
    repeatInterval = 50, // Interval between repeats (ms)
  } = options;

  const pressedKeysRef = useRef<Set<string>>(new Set());
  const keyTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const repeatTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Create reverse mapping from keys to actions
  const keyToActionMap = useRef<Map<string, KeyAction>>(new Map());

  useEffect(() => {
    keyToActionMap.current.clear();
    Object.entries(KEY_MAPPINGS).forEach(([action, keys]) => {
      keys.forEach((key) => {
        keyToActionMap.current.set(key, action as KeyAction);
      });
    });
  }, []);

  const getActionForKey = useCallback((key: string): KeyAction | null => {
    return keyToActionMap.current.get(key) || null;
  }, []);

  const isKeyPressed = useCallback((key: string): boolean => {
    return pressedKeysRef.current.has(key);
  }, []);

  const isActionPressed = useCallback((action: KeyAction): boolean => {
    return KEY_MAPPINGS[action].some((key) => pressedKeysRef.current.has(key));
  }, []);

  const mapKeyToGameAction = useCallback(
    (key: string): GameAction | null => {
      const action = getActionForKey(key);
      if (!action) return null;

      switch (action) {
        case "MOVE_LEFT":
          return { type: "MOVE_LEFT" };
        case "MOVE_RIGHT":
          return { type: "MOVE_RIGHT" };
        case "MOVE_DOWN":
          return { type: "MOVE_DOWN" };
        case "ROTATE":
          return { type: "ROTATE" };
        case "HARD_DROP":
          return { type: "HARD_DROP" };
        case "HOLD_PIECE":
          return { type: "HOLD_PIECE" };
        case "PAUSE_GAME":
          return { type: "PAUSE_GAME" };
        case "RESTART_GAME":
          return { type: "RESTART_GAME" };
        default:
          return null;
      }
    },
    [getActionForKey]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.code;
      const action = getActionForKey(key);

      if (!action) return;

      // Prevent default browser behavior for game keys
      event.preventDefault();

      // If key is already pressed, ignore (prevents browser key repeat)
      if (pressedKeysRef.current.has(key)) return;

      // Add key to pressed set
      pressedKeysRef.current.add(key);

      // Execute action immediately
      const gameAction = mapKeyToGameAction(key);
      if (gameAction) {
        onAction(gameAction);
      }

      // Set up key repeat for movement keys
      const isMovementKey = ["MOVE_LEFT", "MOVE_RIGHT", "MOVE_DOWN"].includes(action);

      if (isMovementKey) {
        // Clear any existing timer for this key
        const existingTimer = repeatTimersRef.current.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set up repeat after initial delay
        const repeatTimer = setTimeout(() => {
          const intervalTimer = setInterval(() => {
            if (pressedKeysRef.current.has(key) && enabled) {
              const repeatAction = mapKeyToGameAction(key);
              if (repeatAction) {
                onAction(repeatAction);
              }
            } else {
              clearInterval(intervalTimer);
            }
          }, repeatInterval);

          // Store interval timer for cleanup
          keyTimersRef.current.set(key, intervalTimer);
        }, repeatDelay);

        repeatTimersRef.current.set(key, repeatTimer);
      }
    },
    [enabled, onAction, getActionForKey, mapKeyToGameAction, repeatDelay, repeatInterval]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.code;
      const action = getActionForKey(key);

      if (!action) return;

      // Remove key from pressed set
      pressedKeysRef.current.delete(key);

      // Clear any timers for this key
      const repeatTimer = repeatTimersRef.current.get(key);
      if (repeatTimer) {
        clearTimeout(repeatTimer);
        repeatTimersRef.current.delete(key);
      }

      const intervalTimer = keyTimersRef.current.get(key);
      if (intervalTimer) {
        clearTimeout(intervalTimer);
        keyTimersRef.current.delete(key);
      }
    },
    [enabled, getActionForKey]
  );

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);

      // Clear all timers on cleanup
      repeatTimersRef.current.forEach((timer) => clearTimeout(timer));
      keyTimersRef.current.forEach((timer) => clearTimeout(timer));
      repeatTimersRef.current.clear();
      keyTimersRef.current.clear();
      pressedKeysRef.current.clear();
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  // Clear all pressed keys when disabled
  useEffect(() => {
    if (!enabled) {
      pressedKeysRef.current.clear();
      repeatTimersRef.current.forEach((timer) => clearTimeout(timer));
      keyTimersRef.current.forEach((timer) => clearTimeout(timer));
      repeatTimersRef.current.clear();
      keyTimersRef.current.clear();
    }
  }, [enabled]);

  return {
    pressedKeys: pressedKeysRef.current,
    isKeyPressed,
    isActionPressed,
    getActionForKey,
  };
}
