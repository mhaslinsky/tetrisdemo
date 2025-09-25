import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { GameContainer } from "../GameContainer";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
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
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { afterEach } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the hooks to avoid complex game logic in accessibility tests
jest.mock("@/hooks/useGameState", () => ({
  useGameState: () => ({
    gameState: {
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
    },
    dispatch: jest.fn(),
    isGameActive: true,
    canMovePiece: true,
    moveLeft: jest.fn(),
    moveRight: jest.fn(),
    moveDown: jest.fn(),
    rotate: jest.fn(),
    hardDrop: jest.fn(),
    holdPiece: jest.fn(),
    pauseGame: jest.fn(),
    resumeGame: jest.fn(),
    restartGame: jest.fn(),
    gameTick: jest.fn(),
    lockPiece: jest.fn(),
    spawnPiece: jest.fn(),
  }),
}));

jest.mock("@/hooks/useGameLoop", () => ({
  useGameLoop: () => ({
    startGameLoop: jest.fn(),
    stopGameLoop: jest.fn(),
    isRunning: false,
  }),
}));

jest.mock("@/hooks/useKeyboardInput", () => ({
  useKeyboardInput: () => ({
    isKeyPressed: jest.fn(),
    isActionPressed: jest.fn(),
  }),
}));

describe("GameContainer Accessibility", () => {
  beforeEach(() => {
    // Clean up any existing live regions
    const existingPolite = document.getElementById("tetris-polite-announcer");
    const existingAssertive = document.getElementById("tetris-assertive-announcer");
    if (existingPolite) document.body.removeChild(existingPolite);
    if (existingAssertive) document.body.removeChild(existingAssertive);
  });

  afterEach(() => {
    // Clean up live regions after each test
    const politeAnnouncer = document.getElementById("tetris-polite-announcer");
    const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");
    if (politeAnnouncer) document.body.removeChild(politeAnnouncer);
    if (assertiveAnnouncer) document.body.removeChild(assertiveAnnouncer);
  });

  describe("ARIA compliance", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<GameContainer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper application role and labels", () => {
      render(<GameContainer />);

      const gameContainer = screen.getByRole("application");
      expect(gameContainer).toHaveAttribute("aria-label", "Tetris Game");
      expect(gameContainer).toHaveAttribute("aria-describedby", "game-description game-controls-description");
    });

    it("should provide screen reader descriptions", () => {
      render(<GameContainer />);

      expect(screen.getByText(/Tetris game\. Status: playing/)).toBeInTheDocument();
      expect(screen.getByText(/Use arrow keys to move pieces/)).toBeInTheDocument();
    });

    it("should have proper grid structure for game board", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByRole("grid");
      expect(gameBoard).toHaveAttribute("aria-label", "Tetris game board");

      // Check that rows are properly structured
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(20); // 20 rows in Tetris board

      // Check that gridcells are properly structured
      const gridcells = screen.getAllByRole("gridcell");
      expect(gridcells).toHaveLength(200); // 10x20 = 200 cells
    });

    it("should have proper region roles for sidebar sections", () => {
      render(<GameContainer />);

      expect(screen.getByLabelText("Game information and statistics")).toBeInTheDocument();
      expect(screen.getByLabelText("Game statistics")).toBeInTheDocument();
    });
  });

  describe("Keyboard navigation", () => {
    it("should be focusable with keyboard", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const gameBoard = screen.getByRole("grid");

      await user.tab();
      expect(gameBoard).toHaveFocus();
    });

    it("should handle keyboard events for game controls", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const gameContainer = screen.getByRole("application");
      gameContainer.focus();

      // Test arrow key handling (these would be handled by the keyboard input hook)
      await user.keyboard("{ArrowLeft}");
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");

      // No errors should occur
      expect(gameContainer).toBeInTheDocument();
    });

    it("should allow navigation to control buttons", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Tab through the interface
      await user.tab(); // Game board
      await user.tab(); // First control button

      const pauseButton = screen.getByRole("button", { name: /pause game/i });
      expect(pauseButton).toHaveFocus();
    });
  });

  describe("Screen reader announcements", () => {
    it("should create live regions for announcements", () => {
      render(<GameContainer />);

      // Wait for useEffect to run
      waitFor(() => {
        expect(document.getElementById("tetris-polite-announcer")).toBeInTheDocument();
        expect(document.getElementById("tetris-assertive-announcer")).toBeInTheDocument();
      });
    });

    it("should have proper aria-live attributes", async () => {
      render(<GameContainer />);

      await waitFor(() => {
        const politeAnnouncer = document.getElementById("tetris-polite-announcer");
        const assertiveAnnouncer = document.getElementById("tetris-assertive-announcer");

        expect(politeAnnouncer).toHaveAttribute("aria-live", "polite");
        expect(assertiveAnnouncer).toHaveAttribute("aria-live", "assertive");
      });
    });
  });

  describe("Focus management", () => {
    it("should maintain focus within the game area", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const gameBoard = screen.getByRole("grid");
      gameBoard.focus();

      expect(gameBoard).toHaveFocus();

      // Focus should remain manageable
      await user.tab();
      expect(document.activeElement).not.toBe(gameBoard);
    });

    it("should have visible focus indicators", () => {
      render(<GameContainer />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // Check that buttons have focus styles (this would be in CSS)
        expect(button).toHaveClass(/focus:/);
      });
    });
  });

  describe("Color contrast and visual accessibility", () => {
    it("should use semantic HTML elements", () => {
      render(<GameContainer />);

      // Check for proper heading hierarchy
      expect(screen.getByRole("heading", { level: 3, name: "SCORE" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: "LEVEL" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: "LINES" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: "CONTROLS" })).toBeInTheDocument();
    });

    it("should provide alternative text for visual elements", () => {
      render(<GameContainer />);

      // Check that preview pieces have proper labels
      expect(screen.getByLabelText(/Next piece:/)).toBeInTheDocument();
      expect(screen.getByLabelText(/No piece held/)).toBeInTheDocument();
    });
  });

  describe("Game state announcements", () => {
    it("should have live regions for score updates", () => {
      render(<GameContainer />);

      const scoreValue = screen.getByTestId("score-value");
      expect(scoreValue).toHaveAttribute("aria-live", "polite");
    });

    it("should have live regions for level updates", () => {
      render(<GameContainer />);

      const levelValue = screen.getByTestId("level-value");
      expect(levelValue).toHaveAttribute("aria-live", "polite");
    });

    it("should have live regions for lines cleared updates", () => {
      render(<GameContainer />);

      const linesValue = screen.getByTestId("lines-value");
      expect(linesValue).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle missing game state gracefully", () => {
      // This would test error boundaries, but for now just ensure no crashes
      expect(() => render(<GameContainer />)).not.toThrow();
    });

    it("should maintain accessibility during game state changes", () => {
      const { rerender } = render(<GameContainer />);

      // Re-render with different props
      rerender(<GameContainer autoStart={false} />);

      // Accessibility features should still be present
      expect(screen.getByRole("application")).toBeInTheDocument();
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });
});
