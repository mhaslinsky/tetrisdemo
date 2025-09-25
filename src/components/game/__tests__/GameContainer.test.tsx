import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { GameContainer } from "../GameContainer";

// Mock the hooks
jest.mock("@/hooks/useGameState");
jest.mock("@/hooks/useGameLoop");
jest.mock("@/hooks/useKeyboardInput");

// Mock the child components
jest.mock("../GameBoard", () => ({
  GameBoard: ({ board, currentPiece, className }: any) => (
    <div data-testid='game-board' className={className}>
      Board: {board ? "loaded" : "empty"}
      Current Piece: {currentPiece?.type || "none"}
    </div>
  ),
}));

jest.mock("../GameSidebar", () => ({
  GameSidebar: ({ gameState }: any) => (
    <div data-testid='game-sidebar'>
      Score: {gameState.score}
      Level: {gameState.level}
      Status: {gameState.gameStatus}
    </div>
  ),
}));

import { useGameState } from "@/hooks/useGameState";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { it } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

const mockUseGameState = useGameState as jest.MockedFunction<typeof useGameState>;
const mockUseGameLoop = useGameLoop as jest.MockedFunction<typeof useGameLoop>;
const mockUseKeyboardInput = useKeyboardInput as jest.MockedFunction<typeof useKeyboardInput>;

describe("GameContainer", () => {
  const mockGameState = {
    board: Array(20)
      .fill(null)
      .map(() => Array(10).fill(null)),
    currentPiece: {
      type: "T" as const,
      shape: [
        [true, true, true],
        [false, true, false],
      ],
      position: { x: 4, y: 0 },
      rotation: 0,
    },
    nextPiece: {
      type: "I" as const,
      shape: [[true, true, true, true]],
      position: { x: 4, y: 0 },
      rotation: 0,
    },
    heldPiece: null,
    canHold: true,
    score: 1000,
    level: 2,
    linesCleared: 5,
    gameStatus: "playing" as const,
    dropTimer: 0,
    lastDropTime: 0,
  };

  const mockGameStateActions = {
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
  };

  const mockGameLoop = {
    startGameLoop: jest.fn(),
    stopGameLoop: jest.fn(),
    isRunning: true,
  };

  const mockKeyboardInput = {
    isKeyPressed: jest.fn(),
    isActionPressed: jest.fn(),
    pressedKeys: new Set<string>(),
    getActionForKey: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGameState.mockReturnValue({
      gameState: mockGameState,
      ...mockGameStateActions,
    });

    mockUseGameLoop.mockReturnValue(mockGameLoop);

    mockUseKeyboardInput.mockReturnValue(mockKeyboardInput);
  });

  describe("Component Rendering", () => {
    it("renders the game container with all child components", () => {
      render(<GameContainer />);

      expect(screen.getByTestId("game-container")).toBeInTheDocument();
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
      expect(screen.getByTestId("game-sidebar")).toBeInTheDocument();
    });

    it("passes correct props to GameBoard", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveTextContent("Board: loaded");
      expect(gameBoard).toHaveTextContent("Current Piece: T");
    });

    it("passes correct props to GameSidebar", () => {
      render(<GameContainer />);

      const gameSidebar = screen.getByTestId("game-sidebar");
      expect(gameSidebar).toHaveTextContent("Score: 1000");
      expect(gameSidebar).toHaveTextContent("Level: 2");
      expect(gameSidebar).toHaveTextContent("Status: playing");
    });

    it("applies custom className", () => {
      render(<GameContainer className='custom-class' />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Game Status Display", () => {
    it("shows no overlay when game is playing", () => {
      render(<GameContainer />);

      expect(screen.queryByTestId("game-status-overlay")).not.toBeInTheDocument();
    });

    it("shows paused overlay when game is paused", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "paused" },
        ...mockGameStateActions,
      });

      render(<GameContainer />);

      const overlay = screen.getByTestId("game-status-overlay");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent("PAUSEDPress P or ESC to resume");
    });

    it("shows game over modal when game is over", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "gameOver" },
        ...mockGameStateActions,
      });

      render(<GameContainer />);

      const modal = screen.getByTestId("game-over-modal");
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveTextContent("Game Over");
    });

    it("shows ready overlay when game is ready", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "ready" },
        ...mockGameStateActions,
      });

      render(<GameContainer />);

      const overlay = screen.getByTestId("game-status-overlay");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent("Press any key to start");
    });
  });

  describe("Hook Integration", () => {
    it("initializes useGameState hook", () => {
      render(<GameContainer />);

      expect(mockUseGameState).toHaveBeenCalledTimes(1);
    });

    it("initializes useGameLoop hook with correct parameters", () => {
      render(<GameContainer />);

      expect(mockUseGameLoop).toHaveBeenCalledWith({
        gameState: mockGameState,
        dispatch: mockGameStateActions.dispatch,
        onPieceLock: expect.any(Function),
        onPieceSpawn: expect.any(Function),
      });
    });

    it("initializes useKeyboardInput hook with correct parameters", () => {
      render(<GameContainer />);

      expect(mockUseKeyboardInput).toHaveBeenCalledWith(expect.any(Function), {
        enabled: true,
        repeatDelay: 150,
        repeatInterval: 50,
      });
    });
  });

  describe("Keyboard Action Handling", () => {
    let keyboardActionHandler: (action: any) => void;

    beforeEach(() => {
      render(<GameContainer />);
      keyboardActionHandler = mockUseKeyboardInput.mock.calls[0][0];
    });

    it("handles MOVE_LEFT action", () => {
      act(() => {
        keyboardActionHandler({ type: "MOVE_LEFT" });
      });

      expect(mockGameStateActions.moveLeft).toHaveBeenCalledTimes(1);
    });

    it("handles MOVE_RIGHT action", () => {
      act(() => {
        keyboardActionHandler({ type: "MOVE_RIGHT" });
      });

      expect(mockGameStateActions.moveRight).toHaveBeenCalledTimes(1);
    });

    it("handles MOVE_DOWN action", () => {
      act(() => {
        keyboardActionHandler({ type: "MOVE_DOWN" });
      });

      expect(mockGameStateActions.moveDown).toHaveBeenCalledTimes(1);
    });

    it("handles ROTATE action", () => {
      act(() => {
        keyboardActionHandler({ type: "ROTATE" });
      });

      expect(mockGameStateActions.rotate).toHaveBeenCalledTimes(1);
    });

    it("handles HARD_DROP action", () => {
      act(() => {
        keyboardActionHandler({ type: "HARD_DROP" });
      });

      expect(mockGameStateActions.hardDrop).toHaveBeenCalledTimes(1);
    });

    it("handles HOLD_PIECE action", () => {
      act(() => {
        keyboardActionHandler({ type: "HOLD_PIECE" });
      });

      expect(mockGameStateActions.holdPiece).toHaveBeenCalledTimes(1);
    });

    it("handles PAUSE_GAME action when playing", () => {
      act(() => {
        keyboardActionHandler({ type: "PAUSE_GAME" });
      });

      expect(mockGameStateActions.pauseGame).toHaveBeenCalledTimes(1);
    });

    it("handles PAUSE_GAME action when paused (resumes)", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "paused" },
        ...mockGameStateActions,
      });

      render(<GameContainer />);
      const pausedKeyboardHandler = mockUseKeyboardInput.mock.calls[1][0];

      act(() => {
        pausedKeyboardHandler({ type: "PAUSE_GAME" });
      });

      expect(mockGameStateActions.resumeGame).toHaveBeenCalledTimes(1);
    });

    it("handles RESTART_GAME action", () => {
      act(() => {
        keyboardActionHandler({ type: "RESTART_GAME" });
      });

      expect(mockGameStateActions.restartGame).toHaveBeenCalledTimes(1);
    });

    it("dispatches unknown actions directly", () => {
      const unknownAction = { type: "UNKNOWN_ACTION" };

      act(() => {
        keyboardActionHandler(unknownAction);
      });

      expect(mockGameStateActions.dispatch).toHaveBeenCalledWith(unknownAction);
    });
  });

  describe("Lifecycle Management", () => {
    it("calls onGameStart when game status changes to playing", () => {
      const onGameStart = jest.fn();

      // Start with ready status
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "ready" },
        ...mockGameStateActions,
      });

      const { rerender } = render(<GameContainer onGameStart={onGameStart} />);

      // Change to playing status
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "playing" },
        ...mockGameStateActions,
      });

      rerender(<GameContainer onGameStart={onGameStart} />);

      expect(onGameStart).toHaveBeenCalledTimes(1);
    });

    it("calls onGameEnd when game status changes to gameOver", () => {
      const onGameEnd = jest.fn();

      // Start with playing status
      const { rerender } = render(<GameContainer onGameEnd={onGameEnd} />);

      // Change to game over status
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "gameOver", score: 5000 },
        ...mockGameStateActions,
      });

      rerender(<GameContainer onGameEnd={onGameEnd} />);

      expect(onGameEnd).toHaveBeenCalledWith(5000);
    });

    it("calls onPause when pause action is triggered", () => {
      const onPause = jest.fn();

      render(<GameContainer onPause={onPause} />);
      const keyboardActionHandler = mockUseKeyboardInput.mock.calls[0][0];

      act(() => {
        keyboardActionHandler({ type: "PAUSE_GAME" });
      });

      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it("calls onResume when resume action is triggered", () => {
      const onResume = jest.fn();

      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "paused" },
        ...mockGameStateActions,
      });

      render(<GameContainer onResume={onResume} />);
      const keyboardActionHandler = mockUseKeyboardInput.mock.calls[0][0];

      act(() => {
        keyboardActionHandler({ type: "PAUSE_GAME" });
      });

      expect(onResume).toHaveBeenCalledTimes(1);
    });

    it("auto-starts game when autoStart is true and status is ready", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "ready" },
        ...mockGameStateActions,
      });

      render(<GameContainer autoStart={true} />);

      expect(mockGameStateActions.dispatch).toHaveBeenCalledWith({ type: "SPAWN_PIECE" });
    });

    it("does not auto-start game when autoStart is false", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "ready" },
        ...mockGameStateActions,
      });

      render(<GameContainer autoStart={false} />);

      expect(mockGameStateActions.dispatch).not.toHaveBeenCalledWith({ type: "SPAWN_PIECE" });
    });

    it("stops game loop on unmount", () => {
      const { unmount } = render(<GameContainer />);

      unmount();

      expect(mockGameLoop.stopGameLoop).toHaveBeenCalledTimes(1);
    });
  });

  describe("Game Loop Callbacks", () => {
    it("calls lockPiece when onPieceLock callback is triggered", () => {
      render(<GameContainer />);

      const gameLoopOptions = mockUseGameLoop.mock.calls[0][0];
      const onPieceLock = gameLoopOptions.onPieceLock;

      act(() => {
        onPieceLock?.();
      });

      expect(mockGameStateActions.lockPiece).toHaveBeenCalledTimes(1);
    });

    it("calls spawnPiece when onPieceSpawn callback is triggered", () => {
      render(<GameContainer />);

      const gameLoopOptions = mockUseGameLoop.mock.calls[0][0];
      const onPieceSpawn = gameLoopOptions.onPieceSpawn;

      act(() => {
        onPieceSpawn?.();
      });

      expect(mockGameStateActions.spawnPiece).toHaveBeenCalledTimes(1);
    });
  });

  describe("Visual States", () => {
    it("applies blur and opacity to game board when game is paused", () => {
      mockUseGameState.mockReturnValue({
        gameState: { ...mockGameState, gameStatus: "paused" },
        ...mockGameStateActions,
      });

      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("opacity-50", "blur-sm");
    });

    it("does not apply blur and opacity to game board when game is playing", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).not.toHaveClass("opacity-50", "blur-sm");
    });
  });
});
