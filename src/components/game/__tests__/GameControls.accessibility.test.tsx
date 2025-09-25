import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { GameControls } from "../GameControls";
import type { GameState } from "@/types";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("GameControls Accessibility", () => {
  const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
    board: Array(20)
      .fill(null)
      .map(() => Array(10).fill(null)),
    currentPiece: null,
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

  const mockHandlers = {
    onPause: jest.fn(),
    onResume: jest.fn(),
    onRestart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ARIA compliance", () => {
    it("should have no accessibility violations", async () => {
      const gameState = createMockGameState();
      const { container } = render(<GameControls gameState={gameState} {...mockHandlers} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper region role and labels", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const controlsRegion = screen.getByRole("region", { name: /controls/i });
      expect(controlsRegion).toHaveAttribute("aria-labelledby", "controls-heading");
    });

    it("should have proper group role for buttons", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const buttonGroup = screen.getByRole("group", { name: "Game control buttons" });
      expect(buttonGroup).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      expect(screen.getByRole("heading", { level: 3, name: "CONTROLS" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 4, name: "KEYBOARD SHORTCUTS" })).toBeInTheDocument();
    });
  });

  describe("Button accessibility", () => {
    it("should have descriptive aria-labels for buttons", () => {
      const gameState = createMockGameState({ gameStatus: "playing" });
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game \(keyboard shortcut: p\)/i });
      const restartButton = screen.getByRole("button", { name: /restart game \(keyboard shortcut: r\)/i });

      expect(pauseButton).toBeInTheDocument();
      expect(restartButton).toBeInTheDocument();
    });

    it("should update button labels based on game state", () => {
      const pausedGameState = createMockGameState({ gameStatus: "paused" });
      render(<GameControls gameState={pausedGameState} {...mockHandlers} />);

      const resumeButton = screen.getByRole("button", { name: /resume game \(keyboard shortcut: p\)/i });
      expect(resumeButton).toBeInTheDocument();
    });

    it("should have proper focus indicators", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass(/focus:outline-none/);
        expect(button).toHaveClass(/focus:ring-2/);
      });
    });

    it("should handle disabled state properly", () => {
      const readyGameState = createMockGameState({ gameStatus: "ready" });
      render(<GameControls gameState={readyGameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      expect(pauseButton).toBeDisabled();
      expect(pauseButton).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Keyboard navigation", () => {
    it("should be navigable with Tab key", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      const restartButton = screen.getByRole("button", { name: /restart game/i });

      await user.tab();
      expect(pauseButton).toHaveFocus();

      await user.tab();
      expect(restartButton).toHaveFocus();
    });

    it("should activate buttons with Enter key", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      pauseButton.focus();

      await user.keyboard("{Enter}");
      expect(mockHandlers.onPause).toHaveBeenCalled();
    });

    it("should activate buttons with Space key", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const restartButton = screen.getByRole("button", { name: /restart game/i });
      restartButton.focus();

      await user.keyboard(" ");
      expect(mockHandlers.onRestart).toHaveBeenCalled();
    });
  });

  describe("Keyboard shortcuts documentation", () => {
    it("should provide keyboard shortcuts as a list", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const shortcutsList = screen.getByRole("list");
      const shortcuts = screen.getAllByRole("listitem");

      expect(shortcutsList).toBeInTheDocument();
      expect(shortcuts).toHaveLength(6); // Move, Rotate, Hard Drop, Hold, Pause, Restart
    });

    it("should have proper region for shortcuts", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const shortcutsRegion = screen.getByRole("region", { name: /keyboard shortcuts/i });
      expect(shortcutsRegion).toHaveAttribute("aria-labelledby", "shortcuts-heading");
    });

    it("should provide comprehensive keyboard shortcut information", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      expect(screen.getByText("Move:")).toBeInTheDocument();
      expect(screen.getByText("Arrow Keys")).toBeInTheDocument();
      expect(screen.getByText("Rotate:")).toBeInTheDocument();
      expect(screen.getByText("↑ / Space")).toBeInTheDocument();
      expect(screen.getByText("Hard Drop:")).toBeInTheDocument();
      expect(screen.getByText("Space")).toBeInTheDocument();
      expect(screen.getByText("Hold:")).toBeInTheDocument();
      expect(screen.getByText("C / Shift")).toBeInTheDocument();
      expect(screen.getByText("Pause:")).toBeInTheDocument();
      expect(screen.getByText("P / Esc")).toBeInTheDocument();
      expect(screen.getByText("Restart:")).toBeInTheDocument();
      expect(screen.getByText("R")).toBeInTheDocument();
    });
  });

  describe("Button state management", () => {
    it("should handle pause/resume button state correctly", () => {
      const playingState = createMockGameState({ gameStatus: "playing" });
      const { rerender } = render(<GameControls gameState={playingState} {...mockHandlers} />);

      expect(screen.getByText("Pause (P)")).toBeInTheDocument();

      const pausedState = createMockGameState({ gameStatus: "paused" });
      rerender(<GameControls gameState={pausedState} {...mockHandlers} />);

      expect(screen.getByText("Resume (P)")).toBeInTheDocument();
    });

    it("should disable buttons appropriately based on game state", () => {
      const readyState = createMockGameState({ gameStatus: "ready" });
      render(<GameControls gameState={readyState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      const restartButton = screen.getByRole("button", { name: /restart game/i });

      expect(pauseButton).toBeDisabled();
      expect(restartButton).toBeDisabled();
    });
  });

  describe("Click handlers", () => {
    it("should call onPause when pause button is clicked", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState({ gameStatus: "playing" });
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      await user.click(pauseButton);

      expect(mockHandlers.onPause).toHaveBeenCalled();
    });

    it("should call onResume when resume button is clicked", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState({ gameStatus: "paused" });
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const resumeButton = screen.getByRole("button", { name: /resume game/i });
      await user.click(resumeButton);

      expect(mockHandlers.onResume).toHaveBeenCalled();
    });

    it("should call onRestart when restart button is clicked", async () => {
      const user = userEvent.setup();
      const gameState = createMockGameState({ gameStatus: "playing" });
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const restartButton = screen.getByRole("button", { name: /restart game/i });
      await user.click(restartButton);

      expect(mockHandlers.onRestart).toHaveBeenCalled();
    });
  });

  describe("Visual design accessibility", () => {
    it("should use semantic button elements", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.tagName).toBe("BUTTON");
      });
    });

    it("should provide visual feedback for button states", () => {
      const gameState = createMockGameState();
      render(<GameControls gameState={gameState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      const restartButton = screen.getByRole("button", { name: /restart game/i });

      // Primary button should have primary styling
      expect(pauseButton).toHaveClass(/bg-blue-600/);
      // Secondary button should have secondary styling
      expect(restartButton).toHaveClass(/bg-gray-700/);
    });

    it("should show disabled state visually", () => {
      const readyState = createMockGameState({ gameStatus: "ready" });
      render(<GameControls gameState={readyState} {...mockHandlers} />);

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      expect(pauseButton).toHaveClass(/bg-gray-600/);
      expect(pauseButton).toHaveClass(/cursor-not-allowed/);
    });
  });

  describe("Error handling", () => {
    it("should handle missing handlers gracefully", () => {
      const gameState = createMockGameState();

      expect(() => {
        render(<GameControls gameState={gameState} onPause={() => {}} onResume={() => {}} onRestart={() => {}} />);
      }).not.toThrow();
    });

    it("should handle invalid game state gracefully", () => {
      const invalidState = createMockGameState({ gameStatus: "invalid" as any });

      expect(() => {
        render(<GameControls gameState={invalidState} {...mockHandlers} />);
      }).not.toThrow();
    });
  });
});
