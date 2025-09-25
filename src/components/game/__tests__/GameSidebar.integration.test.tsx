import React from "react";
import { render, screen } from "@testing-library/react";
import { GameSidebar } from "../GameSidebar";
import type { GameState, Tetromino } from "@/types";
import { TETROMINO_SHAPES } from "@/constants/game";

// Create realistic game state scenarios
const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: Array(20)
    .fill(null)
    .map(() => Array(10).fill(null)),
  currentPiece: null,
  nextPiece: {
    type: "T",
    shape: TETROMINO_SHAPES.T[0],
    position: { x: 4, y: 0 },
    rotation: 0,
  },
  heldPiece: null,
  canHold: true,
  score: 0,
  level: 1,
  linesCleared: 0,
  gameStatus: "ready",
  dropTimer: 0,
  lastDropTime: 0,
  ...overrides,
});

describe("GameSidebar Integration", () => {
  it("displays a complete game session scenario", () => {
    // Simulate a mid-game state
    const heldPiece: Tetromino = {
      type: "I",
      shape: TETROMINO_SHAPES.I[0],
      position: { x: 3, y: 0 },
      rotation: 0,
    };

    const nextPiece: Tetromino = {
      type: "O",
      shape: TETROMINO_SHAPES.O[0],
      position: { x: 4, y: 0 },
      rotation: 0,
    };

    const gameState = createGameState({
      score: 15750,
      level: 3,
      linesCleared: 25,
      heldPiece,
      nextPiece,
      canHold: false, // Player has already used hold
      gameStatus: "playing",
    });

    render(<GameSidebar gameState={gameState} />);

    // Verify all game statistics are displayed correctly
    expect(screen.getByTestId("score-value")).toHaveTextContent("15,750");
    expect(screen.getByTestId("level-value")).toHaveTextContent("3");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("25");

    // Verify next piece preview shows O-piece
    expect(screen.getByTestId("next-piece-preview")).toBeInTheDocument();
    expect(screen.getAllByTestId("preview-block-O")).toHaveLength(4);

    // Verify hold piece preview shows I-piece but disabled
    expect(screen.getByTestId("hold-piece-preview")).toBeInTheDocument();
    expect(screen.getAllByTestId("hold-block-I-disabled")).toHaveLength(4);
    expect(screen.getByText("USED")).toBeInTheDocument();
  });

  it("handles game progression correctly", () => {
    // Start with early game state
    const initialState = createGameState({
      score: 400,
      level: 1,
      linesCleared: 4,
    });

    const { rerender } = render(<GameSidebar gameState={initialState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("400");
    expect(screen.getByTestId("level-value")).toHaveTextContent("1");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("4");

    // Progress to level up scenario (10 lines cleared)
    const levelUpState = createGameState({
      score: 2500,
      level: 2,
      linesCleared: 10,
    });

    rerender(<GameSidebar gameState={levelUpState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("2,500");
    expect(screen.getByTestId("level-value")).toHaveTextContent("2");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("10");
  });

  it("handles hold piece state transitions", () => {
    // Start with no held piece
    const initialState = createGameState({
      heldPiece: null,
      canHold: true,
    });

    const { rerender } = render(<GameSidebar gameState={initialState} />);

    expect(screen.getByTestId("hold-piece-empty")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();

    // Player holds a T-piece
    const heldPiece: Tetromino = {
      type: "T",
      shape: TETROMINO_SHAPES.T[0],
      position: { x: 4, y: 0 },
      rotation: 0,
    };

    const withHeldPiece = createGameState({
      heldPiece,
      canHold: false, // Used hold this turn
    });

    rerender(<GameSidebar gameState={withHeldPiece} />);

    expect(screen.getByTestId("hold-piece-preview")).toBeInTheDocument();
    expect(screen.getAllByTestId("hold-block-T-disabled")).toHaveLength(4);
    expect(screen.getByText("USED")).toBeInTheDocument();

    // Next turn, can hold again
    const canHoldAgain = createGameState({
      heldPiece,
      canHold: true,
    });

    rerender(<GameSidebar gameState={canHoldAgain} />);

    expect(screen.getAllByTestId("hold-block-T")).toHaveLength(4);
    expect(screen.queryByText("USED")).not.toBeInTheDocument();
  });

  it("displays different tetromino types correctly", () => {
    const tetrominoTypes: Array<{ type: keyof typeof TETROMINO_SHAPES; expectedBlocks: number }> = [
      { type: "I", expectedBlocks: 4 },
      { type: "O", expectedBlocks: 4 },
      { type: "T", expectedBlocks: 4 },
      { type: "S", expectedBlocks: 4 },
      { type: "Z", expectedBlocks: 4 },
      { type: "J", expectedBlocks: 4 },
      { type: "L", expectedBlocks: 4 },
    ];

    tetrominoTypes.forEach(({ type, expectedBlocks }) => {
      const nextPiece: Tetromino = {
        type,
        shape: TETROMINO_SHAPES[type][0],
        position: { x: 4, y: 0 },
        rotation: 0,
      };

      const gameState = createGameState({ nextPiece });
      const { unmount } = render(<GameSidebar gameState={gameState} />);

      expect(screen.getAllByTestId(`preview-block-${type}`)).toHaveLength(expectedBlocks);

      unmount();
    });
  });

  it("handles high score formatting", () => {
    const highScoreStates = [
      { score: 999, expected: "999" },
      { score: 1000, expected: "1,000" },
      { score: 12345, expected: "12,345" },
      { score: 123456, expected: "123,456" },
      { score: 1234567, expected: "1,234,567" },
      { score: 9999999, expected: "9,999,999" },
    ];

    highScoreStates.forEach(({ score, expected }) => {
      const gameState = createGameState({ score });
      const { unmount } = render(<GameSidebar gameState={gameState} />);

      expect(screen.getByTestId("score-value")).toHaveTextContent(expected);

      unmount();
    });
  });

  it("maintains consistent layout across different states", () => {
    const gameState = createGameState();
    render(<GameSidebar gameState={gameState} />);

    // Verify all main sections are present
    expect(screen.getByText("SCORE")).toBeInTheDocument();
    expect(screen.getByText("LEVEL")).toBeInTheDocument();
    expect(screen.getByText("LINES")).toBeInTheDocument();
    expect(screen.getByText("NEXT")).toBeInTheDocument();
    expect(screen.getByText("HOLD")).toBeInTheDocument();

    // Verify the main container has correct structure
    const sidebar = screen.getByTestId("game-sidebar");
    expect(sidebar).toHaveClass("flex", "flex-col", "gap-4");
  });
});
