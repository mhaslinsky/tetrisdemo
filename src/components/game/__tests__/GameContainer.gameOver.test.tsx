import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameContainer } from "../GameContainer";
import { createInitialGameState } from "@/lib/gameState";
import type { GameState } from "@/types";

// Mock the hooks to control game state
jest.mock("@/hooks/useGameState");
jest.mock("@/hooks/useGameLoop");
jest.mock("@/hooks/useKeyboardInput");

const mockUseGameState = require("@/hooks/useGameState").useGameState as jest.MockedFunction<any>;
const mockUseGameLoop = require("@/hooks/useGameLoop").useGameLoop as jest.MockedFunction<any>;
const mockUseKeyboardInput = require("@/hooks/useKeyboardInput").useKeyboardInput as jest.MockedFunction<any>;

describe("GameContainer - Game Over Functionality", () => {
  const mockDispatch = jest.fn();
  const mockRestartGame = jest.fn();
  const mockOnGameEnd = jest.fn();

  const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
    ...createInitialGameState(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseGameLoop.mockReturnValue({
      startGameLoop: jest.fn(),
      stopGameLoop: jest.fn(),
      isRunning: false,
    });

    mockUseKeyboardInput.mockReturnValue({
      isKeyPressed: jest.fn(),
      isActionPressed: jest.fn(),
    });
  });

  it("displays game over modal when game status is gameOver", () => {
    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
      score: 15000,
      level: 6,
      linesCleared: 50,
    });

    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    render(<GameContainer onGameEnd={mockOnGameEnd} />);

    expect(screen.getByTestId("game-over-modal")).toBeInTheDocument();
    expect(screen.getByText("Game Over")).toBeInTheDocument();

    // Check that the modal contains the score (there might be multiple instances)
    const modal = screen.getByTestId("game-over-modal");
    expect(modal).toHaveTextContent("15,000");
    expect(modal).toHaveTextContent("6");
    expect(modal).toHaveTextContent("50");
  });

  it("does not display game over modal when game is playing", () => {
    const playingState = createMockGameState({
      gameStatus: "playing",
    });

    mockUseGameState.mockReturnValue({
      gameState: playingState,
      dispatch: mockDispatch,
      isGameActive: true,
      canMovePiece: true,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    render(<GameContainer />);

    expect(screen.queryByTestId("game-over-modal")).not.toBeInTheDocument();
  });

  it("calls restartGame when restart button is clicked in modal", () => {
    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
      score: 5000,
    });

    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    render(<GameContainer />);

    const restartButton = screen.getByTestId("restart-button");
    fireEvent.click(restartButton);

    expect(mockRestartGame).toHaveBeenCalledTimes(1);
  });

  it("calls onGameEnd callback when game status changes to gameOver", async () => {
    const playingState = createMockGameState({
      gameStatus: "playing",
      score: 8500,
    });

    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
      score: 8500,
    });

    // Start with playing state
    mockUseGameState.mockReturnValue({
      gameState: playingState,
      dispatch: mockDispatch,
      isGameActive: true,
      canMovePiece: true,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    const { rerender } = render(<GameContainer onGameEnd={mockOnGameEnd} />);

    // Change to game over state
    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    rerender(<GameContainer onGameEnd={mockOnGameEnd} />);

    await waitFor(() => {
      expect(mockOnGameEnd).toHaveBeenCalledWith(8500);
    });
  });

  it("does not show game status overlay when game is over (modal handles it)", () => {
    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
    });

    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    render(<GameContainer />);

    expect(screen.queryByTestId("game-status-overlay")).not.toBeInTheDocument();
    expect(screen.getByTestId("game-over-modal")).toBeInTheDocument();
  });

  it("handles restart action through keyboard input", () => {
    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
    });

    const mockHandleKeyboardAction = jest.fn();

    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    mockUseKeyboardInput.mockImplementation((handleAction) => {
      mockHandleKeyboardAction.mockImplementation(handleAction);
      return {
        isKeyPressed: jest.fn(),
        isActionPressed: jest.fn(),
      };
    });

    render(<GameContainer />);

    // Simulate restart action through keyboard
    mockHandleKeyboardAction({ type: "RESTART_GAME" });

    expect(mockRestartGame).toHaveBeenCalledTimes(1);
  });

  it("maintains proper game state transitions during restart", () => {
    const gameOverState = createMockGameState({
      gameStatus: "gameOver",
      score: 12000,
      level: 5,
      linesCleared: 40,
    });

    const restartedState = createMockGameState({
      gameStatus: "ready",
      score: 0,
      level: 1,
      linesCleared: 0,
    });

    // Start with game over state
    mockUseGameState.mockReturnValue({
      gameState: gameOverState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    const { rerender } = render(<GameContainer />);

    expect(screen.getByTestId("game-over-modal")).toBeInTheDocument();

    // Simulate restart
    mockUseGameState.mockReturnValue({
      gameState: restartedState,
      dispatch: mockDispatch,
      isGameActive: false,
      canMovePiece: false,
      restartGame: mockRestartGame,
      // ... other required properties
      moveLeft: jest.fn(),
      moveRight: jest.fn(),
      moveDown: jest.fn(),
      rotate: jest.fn(),
      hardDrop: jest.fn(),
      holdPiece: jest.fn(),
      pauseGame: jest.fn(),
      resumeGame: jest.fn(),
      gameTick: jest.fn(),
      lockPiece: jest.fn(),
      spawnPiece: jest.fn(),
    });

    rerender(<GameContainer />);

    expect(screen.queryByTestId("game-over-modal")).not.toBeInTheDocument();
    expect(screen.getByText("Press any key to start")).toBeInTheDocument();
  });
});
