import React from "react";
import { render, screen } from "@testing-library/react";
import { GameSidebar } from "../GameSidebar";
import type { GameState, Tetromino } from "@/types";

// Mock game state factory
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: Array(20)
    .fill(null)
    .map(() => Array(10).fill(null)),
  currentPiece: null,
  nextPiece: {
    type: "T",
    shape: [
      [false, false, false, false],
      [false, true, false, false],
      [true, true, true, false],
      [false, false, false, false],
    ],
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

describe("GameSidebar", () => {
  it("renders the sidebar with all sections", () => {
    const gameState = createMockGameState();
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("game-sidebar")).toBeInTheDocument();
    expect(screen.getByText("SCORE")).toBeInTheDocument();
    expect(screen.getByText("LEVEL")).toBeInTheDocument();
    expect(screen.getByText("LINES")).toBeInTheDocument();
    expect(screen.getByText("NEXT")).toBeInTheDocument();
    expect(screen.getByText("HOLD")).toBeInTheDocument();
  });

  it("displays the correct score value", () => {
    const gameState = createMockGameState({ score: 12345 });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("12,345");
  });

  it("displays the correct level value", () => {
    const gameState = createMockGameState({ level: 5 });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("level-value")).toHaveTextContent("5");
  });

  it("displays the correct lines cleared value", () => {
    const gameState = createMockGameState({ linesCleared: 23 });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("lines-value")).toHaveTextContent("23");
  });

  it("formats large scores with commas", () => {
    const gameState = createMockGameState({ score: 1234567 });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("1,234,567");
  });

  it("displays zero values correctly", () => {
    const gameState = createMockGameState({
      score: 0,
      level: 1,
      linesCleared: 0,
    });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("0");
    expect(screen.getByTestId("level-value")).toHaveTextContent("1");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("0");
  });

  it("renders next piece preview", () => {
    const gameState = createMockGameState();
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("next-piece-preview")).toBeInTheDocument();
  });

  it("renders hold piece preview when no piece is held", () => {
    const gameState = createMockGameState({ heldPiece: null });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("hold-piece-empty")).toBeInTheDocument();
  });

  it("renders hold piece preview when a piece is held", () => {
    const heldPiece: Tetromino = {
      type: "I",
      shape: [
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
      ],
      position: { x: 0, y: 0 },
      rotation: 0,
    };
    const gameState = createMockGameState({ heldPiece });
    render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("hold-piece-preview")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const gameState = createMockGameState();
    render(<GameSidebar gameState={gameState} className='custom-class' />);

    expect(screen.getByTestId("game-sidebar")).toHaveClass("custom-class");
  });

  it("updates display when game state changes", () => {
    const gameState = createMockGameState({ score: 100, level: 1, linesCleared: 5 });
    const { rerender } = render(<GameSidebar gameState={gameState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("100");
    expect(screen.getByTestId("level-value")).toHaveTextContent("1");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("5");

    const updatedGameState = createMockGameState({ score: 500, level: 2, linesCleared: 15 });
    rerender(<GameSidebar gameState={updatedGameState} />);

    expect(screen.getByTestId("score-value")).toHaveTextContent("500");
    expect(screen.getByTestId("level-value")).toHaveTextContent("2");
    expect(screen.getByTestId("lines-value")).toHaveTextContent("15");
  });
});
