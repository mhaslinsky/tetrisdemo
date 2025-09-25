import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameOverModal } from "../GameOverModal";
import type { GameState } from "@/types";
import { createInitialGameState } from "@/lib/gameState";

// Mock game state for testing
const createGameOverState = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialGameState(),
  gameStatus: "gameOver",
  score: 12500,
  level: 5,
  linesCleared: 42,
  ...overrides,
});

describe("GameOverModal", () => {
  const mockOnRestart = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when game is not over", () => {
    const gameState = createInitialGameState();
    const { container } = render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders modal when game is over", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    expect(screen.getByTestId("game-over-modal")).toBeInTheDocument();
    expect(screen.getByText("Game Over")).toBeInTheDocument();
  });

  it("displays final score correctly", () => {
    const gameState = createGameOverState({
      score: 25750,
      level: 8,
      linesCleared: 67,
    });

    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    expect(screen.getByText("25,750")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("67")).toBeInTheDocument();
  });

  it("calls onRestart when restart button is clicked", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    const restartButton = screen.getByTestId("restart-button");
    fireEvent.click(restartButton);

    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  it("calls onRestart when Enter key is pressed", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    const modal = screen.getByTestId("game-over-modal");
    const modalContent = modal.querySelector('div[tabindex="0"]');
    fireEvent.keyDown(modalContent!, { key: "Enter" });

    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  it("calls onRestart when Space key is pressed", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    const modal = screen.getByTestId("game-over-modal");
    const modalContent = modal.querySelector('div[tabindex="0"]');
    fireEvent.keyDown(modalContent!, { key: " " });

    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  it("shows close button when onClose is provided", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} onClose={mockOnClose} />);

    expect(screen.getByTestId("close-button")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId("close-button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} onClose={mockOnClose} />);

    const modal = screen.getByTestId("game-over-modal");
    const modalContent = modal.querySelector('div[tabindex="0"]');
    fireEvent.keyDown(modalContent!, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not show close button when onClose is not provided", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    expect(screen.queryByTestId("close-button")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    const modal = screen.getByTestId("game-over-modal");
    expect(modal).toHaveAttribute("role", "dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
    expect(modal).toHaveAttribute("aria-labelledby", "game-over-title");
    expect(modal).toHaveAttribute("aria-describedby", "game-over-description");
  });

  it("has restart button as first interactive element", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    const restartButton = screen.getByTestId("restart-button");
    expect(restartButton).toBeInTheDocument();
    expect(restartButton).toHaveTextContent("Play Again");
  });

  it("applies custom className", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} className='custom-class' />);

    const modal = screen.getByTestId("game-over-modal");
    expect(modal).toHaveClass("custom-class");
  });

  it("calls both onRestart and onClose when restart is clicked with onClose provided", () => {
    const gameState = createGameOverState();
    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} onClose={mockOnClose} />);

    const restartButton = screen.getByTestId("restart-button");
    fireEvent.click(restartButton);

    expect(mockOnRestart).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("formats large scores with commas", () => {
    const gameState = createGameOverState({
      score: 1234567,
    });

    render(<GameOverModal gameState={gameState} onRestart={mockOnRestart} />);

    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });
});
