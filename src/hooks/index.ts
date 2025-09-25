// Game state management hook
export { useGameState } from "./useGameState";
export type { UseGameStateReturn } from "./useGameState";

// Game loop management hook
export { useGameLoop } from "./useGameLoop";
export type { UseGameLoopReturn, UseGameLoopOptions } from "./useGameLoop";

// Keyboard input management hook
export { useKeyboardInput, KEY_MAPPINGS } from "./useKeyboardInput";
export type { UseKeyboardInputReturn, UseKeyboardInputOptions, KeyAction } from "./useKeyboardInput";

// Accessibility management hook
export { useAccessibility } from "./useAccessibility";
export type { UseAccessibilityReturn } from "./useAccessibility";
// Responsive design and device detection hooks
export { useResponsive, useDeviceCapabilities } from "./useResponsive";
