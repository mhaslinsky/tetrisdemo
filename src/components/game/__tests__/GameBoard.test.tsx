import React from "react";
import { render, screen } from "@testing-library/react";
import { GameBoard } from "../GameBoard";
import type { Board, Tetromino } from "@/types";
import { createEmptyBoard } from "@/lib/board";
import { TETROMINO_SHAPES } from "@/constants/game";

// Mock data for testing
const createMockTetromino = (type: "I" | "O" | "T" = "T"): Tetromino => ({
  type,
  shape: TETROMINO_SHAPES[type][0], // Use first rotation
  position: { x: 4, y: 0 },
  rotation: 0,
});

const createBoardWithBlocks = (): Board => {
  const board = createEmptyBoard();
  // Add some blocks to the bottom row
  board[19][0] = "I";
  board[19][1] = "O";
  board[19][2] = "T";
  return board;
};

describe("GameBoard", () => {
  describe("Basic Rendering", () => {
    it("renders the game board with correct structure", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      expect(screen.getByTestId("game-board")).toBeInTheDocument();
      expect(screen.getByTestId("board-grid")).toBeInTheDocument();
    });

    it("renders correct number of cells (10x20 = 200)", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      // Check that we have 200 cells (10 columns × 20 rows)
      const cells = screen.getAllByTestId(/^cell-\d+-\d+$/);
      expect(cells).toHaveLength(200);
    });

    it("renders empty blocks for empty board", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const emptyBlocks = screen.getAllByTestId("empty-block");
      expect(emptyBlocks).toHaveLength(200);
    });

    it("applies custom className when provided", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} className='custom-class' />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("custom-class");
    });
  });

  describe("Block Rendering", () => {
    it("renders placed blocks with correct types", () => {
      const board = createBoardWithBlocks();
      render(<GameBoard board={board} />);

      expect(screen.getByTestId("block-I")).toBeInTheDocument();
      expect(screen.getByTestId("block-O")).toBeInTheDocument();
      expect(screen.getByTestId("block-T")).toBeInTheDocument();
    });

    it("renders blocks in correct positions", () => {
      const board = createBoardWithBlocks();
      render(<GameBoard board={board} />);

      // Check specific cell positions
      const cell_19_0 = screen.getByTestId("cell-19-0");
      const cell_19_1 = screen.getByTestId("cell-19-1");
      const cell_19_2 = screen.getByTestId("cell-19-2");

      expect(cell_19_0.querySelector('[data-testid="block-I"]')).toBeInTheDocument();
      expect(cell_19_1.querySelector('[data-testid="block-O"]')).toBeInTheDocument();
      expect(cell_19_2.querySelector('[data-testid="block-T"]')).toBeInTheDocument();
    });
  });

  describe("Active Piece Rendering", () => {
    it("renders current piece on the board", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("T");
      render(<GameBoard board={board} currentPiece={currentPiece} />);

      // T-piece should be rendered as active blocks
      const activeBlocks = screen.getAllByTestId("block-T-active");
      expect(activeBlocks.length).toBeGreaterThan(0);
    });

    it("renders active piece at correct position", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("I");
      currentPiece.position = { x: 3, y: 5 };

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      // I-piece at position (3,5) should render active blocks
      const activeBlocks = screen.getAllByTestId("block-I-active");
      expect(activeBlocks.length).toBe(4); // I-piece has 4 blocks
    });

    it("does not render active piece blocks outside board boundaries", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("T");
      currentPiece.position = { x: -1, y: -1 }; // Partially outside board

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      // Should only render blocks that are within the board
      const activeBlocks = screen.getAllByTestId("block-T-active");
      expect(activeBlocks.length).toBeLessThan(4); // Some blocks should be clipped
    });

    it("overlays active piece on existing board blocks", () => {
      const board = createBoardWithBlocks();
      const currentPiece = createMockTetromino("T");
      currentPiece.position = { x: 5, y: 17 }; // Position away from existing blocks

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      // Should have both placed blocks and active piece
      const placedBlocks = screen.getAllByTestId("block-I").concat(
        screen.getAllByTestId("block-O"),
        screen.getAllByTestId("block-T").filter((block) => !block.getAttribute("data-testid")?.includes("-active"))
      );
      const activeBlocks = screen.getAllByTestId("block-T-active");

      expect(placedBlocks.length).toBeGreaterThan(0); // Original placed blocks
      expect(activeBlocks.length).toBeGreaterThan(0); // Active piece blocks
    });
  });

  describe("Different Tetromino Types", () => {
    it("renders I-piece correctly", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("I");
      render(<GameBoard board={board} currentPiece={currentPiece} />);

      const activeBlocks = screen.getAllByTestId("block-I-active");
      expect(activeBlocks).toHaveLength(4);
    });

    it("renders O-piece correctly", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("O");
      render(<GameBoard board={board} currentPiece={currentPiece} />);

      const activeBlocks = screen.getAllByTestId("block-O-active");
      expect(activeBlocks).toHaveLength(4);
    });

    it("renders T-piece correctly", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino("T");
      render(<GameBoard board={board} currentPiece={currentPiece} />);

      const activeBlocks = screen.getAllByTestId("block-T-active");
      expect(activeBlocks).toHaveLength(4);
    });
  });

  describe("Board State Changes", () => {
    it("updates when board changes", () => {
      const initialBoard = createEmptyBoard();
      const { rerender } = render(<GameBoard board={initialBoard} />);

      expect(screen.getAllByTestId("empty-block")).toHaveLength(200);

      const updatedBoard = createBoardWithBlocks();
      rerender(<GameBoard board={updatedBoard} />);

      expect(screen.getAllByTestId("empty-block")).toHaveLength(197); // 200 - 3 blocks
      expect(screen.getAllByTestId(/^block-[A-Z]$/)).toHaveLength(3);
    });

    it("updates when current piece changes", () => {
      const board = createEmptyBoard();
      const initialPiece = createMockTetromino("T");
      const { rerender } = render(<GameBoard board={board} currentPiece={initialPiece} />);

      expect(screen.getAllByTestId("block-T-active")).toHaveLength(4);

      const newPiece = createMockTetromino("I");
      rerender(<GameBoard board={board} currentPiece={newPiece} />);

      expect(screen.queryAllByTestId("block-T-active")).toHaveLength(0);
      expect(screen.getAllByTestId("block-I-active")).toHaveLength(4);
    });

    it("handles null current piece", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} currentPiece={null} />);

      expect(screen.getAllByTestId("empty-block")).toHaveLength(200);
      expect(screen.queryAllByTestId(/active/)).toHaveLength(0);
    });
  });

  describe("Responsive Design", () => {
    it("maintains aspect ratio for blocks", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const cells = screen.getAllByTestId(/^cell-\d+-\d+$/);
      cells.forEach((cell) => {
        expect(cell).toHaveClass("aspect-square");
      });
    });

    it("uses CSS Grid for layout", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const grid = screen.getByTestId("board-grid");
      expect(grid).toHaveClass("grid");

      // Check grid template is set correctly
      const gridStyle = window.getComputedStyle(grid);
      expect(gridStyle.gridTemplateColumns).toContain("repeat(10");
      expect(gridStyle.gridTemplateRows).toContain("repeat(20");
    });
  });

  describe("Accessibility", () => {
    it("provides proper test ids for all elements", () => {
      const board = createBoardWithBlocks();
      const currentPiece = createMockTetromino("T");
      render(<GameBoard board={board} currentPiece={currentPiece} />);

      expect(screen.getByTestId("game-board")).toBeInTheDocument();
      expect(screen.getByTestId("board-grid")).toBeInTheDocument();

      // Check that all cells have proper test ids
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(screen.getByTestId(`cell-${row}-${col}`)).toBeInTheDocument();
        }
      }
    });

    it("provides semantic structure", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard.tagName).toBe("DIV");

      const grid = screen.getByTestId("board-grid");
      expect(grid.tagName).toBe("DIV");
      expect(grid).toHaveClass("grid");
    });
  });
});
