import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { GameBoard } from "../GameBoard";
import { createEmptyBoard } from "@/lib/board";
import type { Tetromino } from "@/types";

// Mock timers for animation testing
jest.useFakeTimers();

describe("GameBoard Animations", () => {
  const mockBoard = createEmptyBoard();
  const mockTetromino: Tetromino = {
    type: "T",
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    position: { x: 3, y: 1 },
    rotation: 0,
  };

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("Line Clearing Animation", () => {
    it("applies clearing animation to specified lines", () => {
      render(<GameBoard board={mockBoard} currentPiece={null} clearingLines={[18, 19]} />);

      // Check that cells in clearing lines have the clearing animation
      const clearingCell = screen.getByTestId("cell-18-0");
      expect(clearingCell).toHaveClass("animate-pulse", "scale-110");
    });

    it("calls onLineClearAnimationComplete after animation duration", async () => {
      const mockCallback = jest.fn();

      render(
        <GameBoard
          board={mockBoard}
          currentPiece={null}
          clearingLines={[19]}
          onLineClearAnimationComplete={mockCallback}
        />
      );

      // Fast-forward time to complete animation
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call callback when no lines are clearing", () => {
      const mockCallback = jest.fn();

      render(
        <GameBoard
          board={mockBoard}
          currentPiece={null}
          clearingLines={[]}
          onLineClearAnimationComplete={mockCallback}
        />
      );

      jest.advanceTimersByTime(500);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("applies clearing styles to blocks in clearing lines", () => {
      // Create a board with some filled blocks
      const boardWithBlocks = createEmptyBoard();
      boardWithBlocks[19][0] = "I";
      boardWithBlocks[19][1] = "T";

      render(<GameBoard board={boardWithBlocks} currentPiece={null} clearingLines={[19]} />);

      // Check that blocks in clearing line have clearing styles
      const clearingBlock = screen.getByTestId("block-I-clearing");
      expect(clearingBlock).toBeInTheDocument();
    });
  });

  describe("Piece Action Animations", () => {
    it("applies move animation to active piece", () => {
      render(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='move' />);

      // Check that active blocks have the appropriate styling
      const activeBlock = screen.getAllByTestId(/block-T-active/)[0];
      expect(activeBlock).toHaveClass("brightness-110", "shadow-lg", "scale-105");
    });

    it("applies rotate animation to board", () => {
      render(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='rotate' />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("tetris-rotation");
    });

    it("applies drop animation to active piece blocks", () => {
      render(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='drop' />);

      // Check that active blocks have dropping animation
      const activeBlocks = screen.getAllByTestId(/block-T-active-dropping/);
      expect(activeBlocks.length).toBeGreaterThan(0);
    });

    it("clears piece animation after timeout", async () => {
      const { rerender } = render(
        <GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='rotate' />
      );

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("tetris-rotation");

      // Fast-forward time
      jest.advanceTimersByTime(200);

      // Rerender to trigger effect cleanup
      rerender(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='rotate' />);

      await waitFor(() => {
        expect(gameBoard).not.toHaveClass("tetris-rotation");
      });
    });
  });

  describe("Block Rendering with Animations", () => {
    it("renders empty blocks without animations", () => {
      render(<GameBoard board={mockBoard} currentPiece={null} />);

      const emptyBlock = screen.getAllByTestId("empty-block")[0];
      expect(emptyBlock).toHaveClass("bg-gray-900", "border-gray-700");
      expect(emptyBlock).not.toHaveClass("animate-pulse");
    });

    it("renders active blocks with enhanced styling", () => {
      render(<GameBoard board={mockBoard} currentPiece={mockTetromino} />);

      const activeBlocks = screen.getAllByTestId(/block-T-active/);
      activeBlocks.forEach((block) => {
        expect(block).toHaveClass("brightness-110", "shadow-lg", "scale-105");
      });
    });

    it("combines multiple animation states correctly", () => {
      // Create a scenario where a block is both active and dropping
      render(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='drop' />);

      const activeDroppingBlocks = screen.getAllByTestId(/block-T-active-dropping/);
      expect(activeDroppingBlocks.length).toBeGreaterThan(0);
    });
  });

  describe("Animation State Management", () => {
    it("handles rapid action changes", () => {
      const { rerender } = render(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='move' />);

      // Quickly change actions
      rerender(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='rotate' />);

      rerender(<GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='drop' />);

      // Should handle the changes without errors
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
    });

    it("handles piece changes during animation", () => {
      const { rerender } = render(
        <GameBoard board={mockBoard} currentPiece={mockTetromino} lastAction='rotate' />
      );

      const newPiece: Tetromino = {
        ...mockTetromino,
        type: "I",
        position: { x: 4, y: 2 },
      };

      rerender(<GameBoard board={mockBoard} currentPiece={newPiece} lastAction='rotate' />);

      expect(screen.getByTestId("game-board")).toBeInTheDocument();
    });
  });
});
