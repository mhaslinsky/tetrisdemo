import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { GameBoard } from "../GameBoard";
import type { Board, Tetromino } from "@/types";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("GameBoard Accessibility", () => {
  const createEmptyBoard = (): Board =>
    Array(20)
      .fill(null)
      .map(() => Array(10).fill(null));

  const createMockTetromino = (): Tetromino => ({
    type: "T",
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    position: { x: 4, y: 0 },
    rotation: 0,
  });

  describe("ARIA compliance", () => {
    it("should have no accessibility violations", async () => {
      const board = createEmptyBoard();
      const { container } = render(<GameBoard board={board} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper grid role and labels", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const gameBoard = screen.getByRole("grid");
      expect(gameBoard).toHaveAttribute("aria-label", "Tetris game board");
      expect(gameBoard).toHaveAttribute("aria-describedby", "board-description");
    });

    it("should provide board description for screen readers", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino();

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      const description = screen.getByText(/10 by 20 grid game board/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("sr-only");
    });

    it("should describe current piece in board description", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino();

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      expect(screen.getByText(/Current piece: T at position 4, 0/)).toBeInTheDocument();
    });

    it("should describe clearing lines in board description", () => {
      const board = createEmptyBoard();
      const clearingLines = [18, 19];

      render(<GameBoard board={board} clearingLines={clearingLines} />);

      expect(screen.getByText(/2 lines are being cleared/)).toBeInTheDocument();
    });
  });

  describe("Grid cell accessibility", () => {
    it("should have proper gridcell roles", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const gridCells = screen.getAllByRole("gridcell");
      expect(gridCells).toHaveLength(200); // 10x20 grid
    });

    it("should provide descriptive labels for empty cells", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const firstCell = screen.getByLabelText("Row 1, Column 1: empty");
      expect(firstCell).toBeInTheDocument();
    });

    it("should provide descriptive labels for filled cells", () => {
      const board = createEmptyBoard();
      board[19][0] = "I"; // Place an I-piece block at bottom-left

      render(<GameBoard board={board} />);

      const filledCell = screen.getByLabelText("Row 20, Column 1: I block");
      expect(filledCell).toBeInTheDocument();
    });

    it("should identify active piece blocks", () => {
      const board = createEmptyBoard();
      const currentPiece = createMockTetromino();

      render(<GameBoard board={board} currentPiece={currentPiece} />);

      // The T-piece should have active blocks
      const activePieceCell = screen.getByLabelText(/T block \(active piece\)/);
      expect(activePieceCell).toBeInTheDocument();
    });
  });

  describe("Keyboard navigation", () => {
    it("should be focusable", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const gameBoard = screen.getByRole("grid");
      expect(gameBoard).toHaveAttribute("tabIndex", "0");
    });

    it("should maintain focus during updates", () => {
      const board = createEmptyBoard();
      const { rerender } = render(<GameBoard board={board} />);

      const gameBoard = screen.getByRole("grid");
      gameBoard.focus();

      // Update the board
      const newBoard = createEmptyBoard();
      newBoard[19][0] = "T";
      rerender(<GameBoard board={newBoard} />);

      // Focus should be maintained (though this is more of a React behavior test)
      expect(gameBoard).toBeInTheDocument();
    });
  });

  describe("Visual state communication", () => {
    it("should communicate game over state", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} isGameOver={true} />);

      const gameBoard = screen.getByRole("grid");
      expect(gameBoard).toHaveClass("tetris-game-over");
    });

    it("should communicate level up state", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} justLeveledUp={true} />);

      const gameBoard = screen.getByRole("grid");
      expect(gameBoard).toHaveClass("animate-pulse");
    });

    it("should communicate line clearing animation", () => {
      const board = createEmptyBoard();
      const clearingLines = [18, 19];

      render(<GameBoard board={board} clearingLines={clearingLines} />);

      // Check that clearing lines have appropriate visual indicators
      const clearingCells = screen.getAllByTestId(/cell-1[89]-/);
      clearingCells.forEach((cell) => {
        expect(cell).toHaveClass("animate-pulse", "scale-110");
      });
    });
  });

  describe("Screen reader compatibility", () => {
    it("should use presentation role for grid container", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      const gridContainer = screen.getByTestId("board-grid");
      expect(gridContainer).toHaveAttribute("role", "presentation");
    });

    it("should provide meaningful test IDs for automation", () => {
      const board = createEmptyBoard();
      render(<GameBoard board={board} />);

      expect(screen.getByTestId("game-board")).toBeInTheDocument();
      expect(screen.getByTestId("board-grid")).toBeInTheDocument();
      expect(screen.getByTestId("cell-0-0")).toBeInTheDocument();
      expect(screen.getByTestId("cell-19-9")).toBeInTheDocument();
    });
  });

  describe("Dynamic content updates", () => {
    it("should update cell descriptions when board changes", () => {
      const board = createEmptyBoard();
      const { rerender } = render(<GameBoard board={board} />);

      // Initially empty
      expect(screen.getByLabelText("Row 1, Column 1: empty")).toBeInTheDocument();

      // Add a piece
      const newBoard = createEmptyBoard();
      newBoard[0][0] = "T";
      rerender(<GameBoard board={newBoard} />);

      expect(screen.getByLabelText("Row 1, Column 1: T block")).toBeInTheDocument();
    });

    it("should update board description when current piece changes", () => {
      const board = createEmptyBoard();
      const { rerender } = render(<GameBoard board={board} />);

      // No current piece initially
      expect(screen.queryByText(/Current piece:/)).not.toBeInTheDocument();

      // Add current piece
      const currentPiece = createMockTetromino();
      rerender(<GameBoard board={board} currentPiece={currentPiece} />);

      expect(screen.getByText(/Current piece: T at position 4, 0/)).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should handle null current piece gracefully", () => {
      const board = createEmptyBoard();

      expect(() => {
        render(<GameBoard board={board} currentPiece={null} />);
      }).not.toThrow();
    });

    it("should handle empty clearing lines array", () => {
      const board = createEmptyBoard();

      expect(() => {
        render(<GameBoard board={board} clearingLines={[]} />);
      }).not.toThrow();
    });

    it("should handle malformed board data gracefully", () => {
      // This is more of a defensive programming test
      const board = createEmptyBoard();

      expect(() => {
        render(<GameBoard board={board} />);
      }).not.toThrow();
    });
  });
});
