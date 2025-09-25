import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameContainer } from "../GameContainer";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Mock the hooks
jest.mock("@/hooks/useGameLoop", () => ({
  useGameLoop: jest.fn(() => ({
    startGameLoop: jest.fn(),
    stopGameLoop: jest.fn(),
    isRunning: false,
  })),
}));

// Don't mock useKeyboardInput - let it work normally for testing keyboard functionality

describe("GameContainer - Pause Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Visual Pause Indicators", () => {
    it("shows pause overlay when game is paused", async () => {
      render(<GameContainer />);

      // Start the game first
      fireEvent.keyDown(document, { code: "Space" });

      // Pause the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByTestId("game-status-overlay")).toBeInTheDocument();
      });

      const overlay = screen.getByTestId("game-status-overlay");
      expect(overlay).toHaveTextContent("PAUSED");
      expect(overlay).toHaveTextContent("Press P or ESC to resume");
    });

    it("applies blur and opacity effects to game board when paused", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Pause the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        const gameBoard = screen.getByTestId("game-board");
        expect(gameBoard).toHaveClass("opacity-50", "blur-sm");
      });
    });

    it("removes visual effects when game is resumed", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Pause the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByTestId("game-status-overlay")).toBeInTheDocument();
      });

      // Resume the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.queryByTestId("game-status-overlay")).not.toBeInTheDocument();
      });

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).not.toHaveClass("opacity-50", "blur-sm");
    });
  });

  describe("Keyboard Controls", () => {
    it("pauses game with P key", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Wait for game to start
      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      // Pause with P key
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByTestId("game-status-overlay")).toBeInTheDocument();
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });
    });

    it("pauses game with Escape key", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Wait for game to start
      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      // Pause with Escape key
      fireEvent.keyDown(document, { code: "Escape" });

      await waitFor(() => {
        expect(screen.getByTestId("game-status-overlay")).toBeInTheDocument();
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });
    });

    it("resumes game with P key when paused", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Wait for game to start and then pause
      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Resume with P key
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.queryByText("PAUSED")).not.toBeInTheDocument();
      });
    });

    it("resumes game with spacebar when paused", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Wait for game to start and then pause
      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Resume with spacebar
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("PAUSED")).not.toBeInTheDocument();
      });
    });
  });

  describe("Game Controls Integration", () => {
    it("renders GameControls component", () => {
      render(<GameContainer />);
      expect(screen.getByTestId("game-controls")).toBeInTheDocument();
    });

    it("pause button works correctly", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      // Wait for game to start
      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      // Click pause button
      const pauseButton = screen.getByTestId("pause-resume-button");
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Button should now show "Resume"
      expect(pauseButton).toHaveTextContent("Resume (P)");
    });

    it("resume button works correctly", async () => {
      render(<GameContainer />);

      // Start and pause the game
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Click resume button
      const resumeButton = screen.getByTestId("pause-resume-button");
      expect(resumeButton).toHaveTextContent("Resume (P)");
      fireEvent.click(resumeButton);

      await waitFor(() => {
        expect(screen.queryByText("PAUSED")).not.toBeInTheDocument();
      });

      // Button should now show "Pause"
      expect(resumeButton).toHaveTextContent("Pause (P)");
    });

    it("restart button works from paused state", async () => {
      render(<GameContainer autoStart={false} />);

      // Start the game manually
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Click restart button
      const restartButton = screen.getByTestId("controls-restart-button");
      fireEvent.click(restartButton);

      await waitFor(() => {
        // Should show ready state overlay
        expect(screen.getByText("TETRIS")).toBeInTheDocument();
        expect(screen.getByText("Press any key to start")).toBeInTheDocument();
      });
    });
  });

  describe("Callback Functions", () => {
    it("calls onPause callback when game is paused", async () => {
      const onPause = jest.fn();
      render(<GameContainer onPause={onPause} />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      // Pause the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(onPause).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onResume callback when game is resumed", async () => {
      const onResume = jest.fn();
      render(<GameContainer onResume={onResume} />);

      // Start and pause the game
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Resume the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(onResume).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Game State Consistency", () => {
    it("preserves game state when pausing and resuming", async () => {
      render(<GameContainer />);

      // Start the game
      fireEvent.keyDown(document, { code: "Space" });

      await waitFor(() => {
        expect(screen.queryByText("Press any key to start")).not.toBeInTheDocument();
      });

      // Get initial score
      const scoreElement = screen.getByTestId("score-value");
      const initialScore = scoreElement.textContent;

      // Pause the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.getByText("PAUSED")).toBeInTheDocument();
      });

      // Resume the game
      fireEvent.keyDown(document, { code: "KeyP" });

      await waitFor(() => {
        expect(screen.queryByText("PAUSED")).not.toBeInTheDocument();
      });

      // Score should be preserved
      expect(scoreElement.textContent).toBe(initialScore);
    });
  });
});
