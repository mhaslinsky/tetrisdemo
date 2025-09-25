import { renderHook, act } from "@testing-library/react";
import { useAccessibility } from "../useAccessibility";
import type { GameState } from "@/types";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { afterEach } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Mock game state for testing
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: Array(20)
    .fill(null)
    .map(() => Array(10).fill(null)),
  currentPiece: {
    type: "T",
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    position: { x: 4, y: 0 },
    rotation: 0,
  },
  nextPiece: {
    type: "I",
    shape: [[true, true, true, true]],
    position: { x: 0, y: 0 },
    rotation: 0,
  },
  heldPiece: null,
  canHold: true,
  score: 1000,
  level: 2,
  linesCleared: 15,
  gameStatus: "playing",
  dropTimer: 0,
  lastDropTime: 0,
  animation: {
    lastAction: null,
    clearingLines: [],
    isAnimating: false,
  },
  ...overrides,
});

describe("useAccessibility", () => {
  let mockPoliteAnnouncer: HTMLDivElement;
  let mockAssertiveAnnouncer: HTMLDivElement;

  beforeEach(() => {
    // Clean up any existing announcers
    const existingPolite = document.getElementById("tetris-polite-announcer");
    const existingAssertive = document.getElementById("tetris-assertive-announcer");
    if (existingPolite) document.body.removeChild(existingPolite);
    if (existingAssertive) document.body.removeChild(existingAssertive);
  });

  afterEach(() => {
    // Clean up announcers after each test
    const politeAnnouncer = document.getElementById("tetris-polite-announcer");
    const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
    if (politeAnnouncer) document.body.removeChild(politeAnnouncer);
    if (assertiveAnnouncer) document.body.removeChild(assertiveAnnouncer);

    jest.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create live region elements on mount", () => {
      const gameState = createMockGameState();
      renderHook(() => useAccessibility(gameState));

      const politeAnnouncer = document.getElementById("tetris-polite-announcer");
      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");

      expect(politeAnnouncer).toBeInTheDocument();
      expect(assertiveAnnouncer).toBeInTheDocument();
      expect(politeAnnouncer).toHaveAttribute("aria-live", "polite");
      expect(assertiveAnnouncer).toHaveAttribute("aria-live", "assertive");
    });

    it("should clean up live region elements on unmount", () => {
      const gameState = createMockGameState();
      const { unmount } = renderHook(() => useAccessibility(gameState));

      expect(document.getElementById("tetris-polite-announcer")).toBeInTheDocument();
      expect(document.getElementById("tetris-assertive-announcer")).toBeInTheDocument();

      unmount();

      expect(document.getElementById("tetris-polite-announcer")).not.toBeInTheDocument();
      expect(document.getElementById("tetris-assertive-announcer")).not.toBeInTheDocument();
    });
  });

  describe("announceToScreenReader", () => {
    it("should announce messages to polite announcer by default", async () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => useAccessibility(gameState));

      act(() => {
        result.current.announceToScreenReader("Test message");
      });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const politeAnnouncer = document.getElementById("tetris-polite-announcer");
      expect(politeAnnouncer?.textContent).toBe("Test message");
    });

    it("should announce messages to assertive announcer when specified", async () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => useAccessibility(gameState));

      act(() => {
        result.current.announceToScreenReader("Urgent message", "assertive");
      });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toBe("Urgent message");
    });
  });

  describe("game state descriptions", () => {
    it("should provide accurate game state description", () => {
      const gameState = createMockGameState({
        gameStatus: "playing",
        score: 2500,
        level: 3,
        linesCleared: 25,
      });
      const { result } = renderHook(() => useAccessibility(gameState));

      const description = result.current.getGameStateDescription();

      expect(description).toContain("Status: playing");
      expect(description).toContain("Score: 2,500");
      expect(description).toContain("Level: 3");
      expect(description).toContain("Lines cleared: 25");
      expect(description).toContain("Current piece: T piece");
    });

    it("should provide controls description", () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => useAccessibility(gameState));

      const description = result.current.getControlsDescription();

      expect(description).toContain("arrow keys");
      expect(description).toContain("rotate");
      expect(description).toContain("hard drop");
      expect(description).toContain("hold");
      expect(description).toContain("pause");
      expect(description).toContain("restart");
    });
  });

  describe("game state change announcements", () => {
    it("should announce game status changes", async () => {
      const initialState = createMockGameState({ gameStatus: "ready" });
      const { result, rerender } = renderHook(({ gameState }) => useAccessibility(gameState), {
        initialProps: { gameState: initialState },
      });

      // Change to playing
      const playingState = createMockGameState({ gameStatus: "playing" });
      rerender({ gameState: playingState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toContain("Game started");
    });

    it("should announce game over with final stats", async () => {
      const initialState = createMockGameState({ gameStatus: "playing" });
      const { rerender } = renderHook(({ gameState }) => useAccessibility(gameState), {
        initialProps: { gameState: initialState },
      });

      // Change to game over
      const gameOverState = createMockGameState({
        gameStatus: "gameOver",
        score: 5000,
        level: 4,
        linesCleared: 35,
      });
      rerender({ gameState: gameOverState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toContain("Game over");
      expect(assertiveAnnouncer?.textContent).toContain("5,000");
      expect(assertiveAnnouncer?.textContent).toContain("Level: 4");
      expect(assertiveAnnouncer?.textContent).toContain("Lines cleared: 35");
    });

    it("should announce level changes", async () => {
      const initialState = createMockGameState({ level: 1 });
      const { rerender } = renderHook(({ gameState }) => useAccessibility(gameState), {
        initialProps: { gameState: initialState },
      });

      // Change level
      const levelUpState = createMockGameState({ level: 2 });
      rerender({ gameState: levelUpState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const politeAnnouncer = document.getElementById("tetris-polite-announcer");
      expect(politeAnnouncer?.textContent).toContain("Level up");
      expect(politeAnnouncer?.textContent).toContain("level 2");
    });

    it("should announce line clears", async () => {
      const initialState = createMockGameState({
        animation: { lastAction: null, clearingLines: [], isAnimating: false },
      });
      const { rerender } = renderHook(({ gameState }) => useAccessibility(gameState), {
        initialProps: { gameState: initialState },
      });

      // Simulate line clear
      const lineClearState = createMockGameState({
        animation: { lastAction: null, clearingLines: [18, 19], isAnimating: true },
      });
      rerender({ gameState: lineClearState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toContain("Double line clear");
    });

    it("should announce Tetris for 4-line clear", async () => {
      const initialState = createMockGameState({
        animation: { lastAction: null, clearingLines: [], isAnimating: false },
      });
      const { rerender } = renderHook(({ gameState }) => useAccessibility(gameState), {
        initialProps: { gameState: initialState },
      });

      // Simulate Tetris
      const tetrisState = createMockGameState({
        animation: { lastAction: null, clearingLines: [16, 17, 18, 19], isAnimating: true },
      });
      rerender({ gameState: tetrisState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toContain("Tetris! Four lines cleared!");
    });
  });

  describe("focus management", () => {
    it("should set focus to specified element", () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => useAccessibility(gameState));

      // Create a test element
      const testElement = document.createElement("button");
      testElement.id = "test-button";
      document.body.appendChild(testElement);

      const focusSpy = jest.spyOn(testElement, "focus");

      act(() => {
        result.current.setFocusToElement("test-button");
      });

      expect(focusSpy).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(testElement);
    });

    it("should handle missing elements gracefully", () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => useAccessibility(gameState));

      // Should not throw when element doesn't exist
      expect(() => {
        act(() => {
          result.current.setFocusToElement("non-existent-element");
        });
      }).not.toThrow();
    });
  });

  describe("configuration options", () => {
    it("should respect disabled announcement options", async () => {
      const initialState = createMockGameState({ gameStatus: "ready" });
      const { rerender } = renderHook(
        ({ gameState }) => useAccessibility(gameState, { announceGameStateChanges: false }),
        { initialProps: { gameState: initialState } }
      );

      // Change to playing
      const playingState = createMockGameState({ gameStatus: "playing" });
      rerender({ gameState: playingState });

      // Wait for the timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
      expect(assertiveAnnouncer?.textContent).toBe("");
    });
  });
});
