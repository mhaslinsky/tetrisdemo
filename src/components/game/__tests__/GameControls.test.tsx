import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameControls } from "../GameControls";
import type { GameState } from "@/types";
import { createInitialGameState } from "@/lib/gameState";

// Mock functions
const mockOnPause = jest.fn();
const mockOnResume = jest.fn();
const mockOnRestart = jest.fn();

// Helper to create game state with specific status
const createGameStateWithStatus = (status: GameState["gameStatus"]): GameState => ({
  ...createInitialGameState(),
  gameStatus: status,
});

describe("GameControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the controls container with title", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      expect(screen.getByTestId("game-controls")).toBeInTheDocument();
      expect(screen.getByText("CONTROLS")).toBeInTheDocument();
    });

    it("renders keyboard shortcuts help section", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      expect(screen.getByText("KEYBOARD SHORTCUTS")).toBeInTheDocument();
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

  describe("Pause/Resume Button", () => {
    it("shows 'Pause (P)' when game is playing", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      expect(pauseButton).toHaveTextContent("Pause (P)");
      expect(pauseButton).not.toBeDisabled();
    });

    it("shows 'Resume (P)' when game is paused", () => {
      const gameState = createGameStateWithStatus("paused");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      expect(pauseButton).toHaveTextContent("Resume (P)");
      expect(pauseButton).not.toBeDisabled();
    });

    it("is disabled when game is ready", () => {
      const gameState = createGameStateWithStatus("ready");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      expect(pauseButton).toBeDisabled();
    });

    it("is disabled when game is over", () => {
      const gameState = createGameStateWithStatus("gameOver");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      expect(pauseButton).toBeDisabled();
    });

    it("calls onPause when clicked during playing state", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      fireEvent.click(pauseButton);

      expect(mockOnPause).toHaveBeenCalledTimes(1);
      expect(mockOnResume).not.toHaveBeenCalled();
    });

    it("calls onResume when clicked during paused state", () => {
      const gameState = createGameStateWithStatus("paused");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      fireEvent.click(pauseButton);

      expect(mockOnResume).toHaveBeenCalledTimes(1);
      expect(mockOnPause).not.toHaveBeenCalled();
    });
  });

  describe("Restart Button", () => {
    it("is enabled when game is playing", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const restartButton = screen.getByTestId("controls-restart-button");
      expect(restartButton).toHaveTextContent("Restart (R)");
      expect(restartButton).not.toBeDisabled();
    });

    it("is enabled when game is paused", () => {
      const gameState = createGameStateWithStatus("paused");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const restartButton = screen.getByTestId("controls-restart-button");
      expect(restartButton).not.toBeDisabled();
    });

    it("is enabled when game is over", () => {
      const gameState = createGameStateWithStatus("gameOver");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const restartButton = screen.getByTestId("controls-restart-button");
      expect(restartButton).not.toBeDisabled();
    });

    it("is disabled when game is ready", () => {
      const gameState = createGameStateWithStatus("ready");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const restartButton = screen.getByTestId("controls-restart-button");
      expect(restartButton).toBeDisabled();
    });

    it("calls onRestart when clicked", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const restartButton = screen.getByTestId("controls-restart-button");
      fireEvent.click(restartButton);

      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe("Styling and Accessibility", () => {
    it("applies custom className", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
          className='custom-class'
        />
      );

      const container = screen.getByTestId("game-controls");
      expect(container).toHaveClass("custom-class");
    });

    it("has proper button styling for enabled state", () => {
      const gameState = createGameStateWithStatus("playing");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      const restartButton = screen.getByTestId("controls-restart-button");

      expect(pauseButton).toHaveClass("bg-blue-600", "border-blue-500", "text-white");
      expect(restartButton).toHaveClass("bg-gray-700", "border-gray-600", "text-white");
    });

    it("has proper button styling for disabled state", () => {
      const gameState = createGameStateWithStatus("ready");
      render(
        <GameControls
          gameState={gameState}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onRestart={mockOnRestart}
        />
      );

      const pauseButton = screen.getByTestId("pause-resume-button");
      const restartButton = screen.getByTestId("controls-restart-button");

      expect(pauseButton).toHaveClass("bg-gray-600", "border-gray-500", "text-gray-400");
      expect(restartButton).toHaveClass("bg-gray-600", "border-gray-500", "text-gray-400");
    });
  });
});
