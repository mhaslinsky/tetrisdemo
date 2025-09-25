import {
  createEmptyBoard,
  isValidPosition,
  placePiece,
  isRowComplete,
  findCompleteRows,
  clearLines,
  isGameOver,
  getColumnHeights,
} from "../board";
import type { Board, Tetromino, TetrominoType } from "@/types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/constants/game";
import { describe, it, expect, beforeEach } from "@jest/globals";

// Helper function to create a test tetromino
function createTestTetromino(
  type: TetrominoType = "I",
  x: number = 0,
  y: number = 0,
  shape: boolean[][] = [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ]
): Tetromino {
  return {
    type,
    shape,
    position: { x, y },
    rotation: 0,
  };
}

describe("Board Utilities", () => {
  describe("createEmptyBoard", () => {
    it("should create a board with correct dimensions", () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_HEIGHT);
      expect(board[0]).toHaveLength(BOARD_WIDTH);
    });

    it("should create a board filled with null values", () => {
      const board = createEmptyBoard();
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          expect(board[row][col]).toBeNull();
        }
      }
    });

    it("should create a new board instance each time", () => {
      const board1 = createEmptyBoard();
      const board2 = createEmptyBoard();
      expect(board1).not.toBe(board2);
      expect(board1[0]).not.toBe(board2[0]);
    });
  });

  describe("isValidPosition", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return true for valid position", () => {
      const piece = createTestTetromino("I", 3, 0);
      expect(isValidPosition(board, piece)).toBe(true);
    });

    it("should return false when piece goes outside left boundary", () => {
      const piece = createTestTetromino("I", -1, 0);
      expect(isValidPosition(board, piece)).toBe(false);
    });

    it("should return false when piece goes outside right boundary", () => {
      const piece = createTestTetromino("I", 7, 0); // I-piece is 4 wide, so 7+4 > 10
      expect(isValidPosition(board, piece)).toBe(false);
    });

    it("should return false when piece goes outside bottom boundary", () => {
      const piece = createTestTetromino("I", 0, BOARD_HEIGHT);
      expect(isValidPosition(board, piece)).toBe(false);
    });

    it("should allow pieces to spawn above the visible board", () => {
      const piece = createTestTetromino("I", 3, -1);
      expect(isValidPosition(board, piece)).toBe(true);
    });

    it("should return false when piece collides with existing blocks", () => {
      // Place a block on the board
      board[1][3] = "I";
      const piece = createTestTetromino("I", 0, 0);
      expect(isValidPosition(board, piece)).toBe(false);
    });

    it("should handle T-piece collision correctly", () => {
      const tShape = [
        [false, false, false, false],
        [false, true, false, false],
        [true, true, true, false],
        [false, false, false, false],
      ];
      const piece = createTestTetromino("T", 0, 0, tShape);
      expect(isValidPosition(board, piece)).toBe(true);
    });
  });

  describe("placePiece", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should place piece on the board", () => {
      const piece = createTestTetromino("I", 0, 1);
      const newBoard = placePiece(board, piece);

      // I-piece shape has blocks at row 1, so with position.y = 1, blocks appear at board row 2
      expect(newBoard[2][0]).toBe("I");
      expect(newBoard[2][1]).toBe("I");
      expect(newBoard[2][2]).toBe("I");
      expect(newBoard[2][3]).toBe("I");
    });

    it("should not modify the original board", () => {
      const piece = createTestTetromino("I", 0, 1);
      const newBoard = placePiece(board, piece);

      expect(board[2][0]).toBeNull();
      expect(newBoard).not.toBe(board);
    });

    it("should not place blocks above the visible board", () => {
      const piece = createTestTetromino("I", 0, -2);
      const newBoard = placePiece(board, piece);

      // All cells should still be null since piece is above visible area
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          expect(newBoard[row][col]).toBeNull();
        }
      }
    });

    it("should place T-piece correctly", () => {
      const tShape = [
        [false, false, false, false],
        [false, true, false, false],
        [true, true, true, false],
        [false, false, false, false],
      ];
      const piece = createTestTetromino("T", 1, 0, tShape);
      const newBoard = placePiece(board, piece);

      expect(newBoard[1][2]).toBe("T"); // Top of T
      expect(newBoard[2][1]).toBe("T"); // Left of T
      expect(newBoard[2][2]).toBe("T"); // Center of T
      expect(newBoard[2][3]).toBe("T"); // Right of T
    });
  });

  describe("isRowComplete", () => {
    it("should return true for complete row", () => {
      const completeRow: (TetrominoType | null)[] = Array(BOARD_WIDTH).fill("I");
      expect(isRowComplete(completeRow)).toBe(true);
    });

    it("should return false for incomplete row", () => {
      const incompleteRow: (TetrominoType | null)[] = Array(BOARD_WIDTH).fill("I");
      incompleteRow[5] = null;
      expect(isRowComplete(incompleteRow)).toBe(false);
    });

    it("should return false for empty row", () => {
      const emptyRow: (TetrominoType | null)[] = Array(BOARD_WIDTH).fill(null);
      expect(isRowComplete(emptyRow)).toBe(false);
    });
  });

  describe("findCompleteRows", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return empty array for board with no complete rows", () => {
      const completeRows = findCompleteRows(board);
      expect(completeRows).toEqual([]);
    });

    it("should find single complete row", () => {
      // Fill bottom row
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
      }

      const completeRows = findCompleteRows(board);
      expect(completeRows).toEqual([BOARD_HEIGHT - 1]);
    });

    it("should find multiple complete rows", () => {
      // Fill bottom two rows
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
        board[BOARD_HEIGHT - 2][col] = "T";
      }

      const completeRows = findCompleteRows(board);
      expect(completeRows).toEqual([BOARD_HEIGHT - 2, BOARD_HEIGHT - 1]);
    });

    it("should find non-consecutive complete rows", () => {
      // Fill rows with gap
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
        board[BOARD_HEIGHT - 3][col] = "T";
      }

      const completeRows = findCompleteRows(board);
      expect(completeRows).toEqual([BOARD_HEIGHT - 3, BOARD_HEIGHT - 1]);
    });
  });

  describe("clearLines", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return same board when no lines to clear", () => {
      const result = clearLines(board);
      expect(result.linesCleared).toBe(0);
      expect(result.newBoard).toEqual(board);
    });

    it("should clear single complete line", () => {
      // Fill bottom row
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
      }

      const result = clearLines(board);
      expect(result.linesCleared).toBe(1);

      // Bottom row should be empty
      for (let col = 0; col < BOARD_WIDTH; col++) {
        expect(result.newBoard[BOARD_HEIGHT - 1][col]).toBeNull();
      }
    });

    it("should clear multiple lines and drop blocks", () => {
      // Place some blocks above
      board[BOARD_HEIGHT - 4][5] = "T";

      // Fill bottom two rows
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
        board[BOARD_HEIGHT - 2][col] = "J";
      }

      const result = clearLines(board);
      expect(result.linesCleared).toBe(2);

      // The T block should have dropped down 2 rows
      expect(result.newBoard[BOARD_HEIGHT - 2][5]).toBe("T");
    });

    it("should maintain board dimensions after clearing", () => {
      // Fill bottom row
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[BOARD_HEIGHT - 1][col] = "I";
      }

      const result = clearLines(board);
      expect(result.newBoard).toHaveLength(BOARD_HEIGHT);
      expect(result.newBoard[0]).toHaveLength(BOARD_WIDTH);
    });
  });

  describe("isGameOver", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return false for empty board", () => {
      expect(isGameOver(board)).toBe(false);
    });

    it("should return true when blocks reach the top", () => {
      board[0][5] = "I";
      expect(isGameOver(board)).toBe(true);
    });

    it("should return true when blocks are in spawn area", () => {
      board[1][4] = "I"; // Row 1, column 4 is in spawn area (rows 0-1, columns 3-6)
      expect(isGameOver(board)).toBe(true);
    });

    it("should return false when blocks are below spawn area", () => {
      board[2][5] = "I"; // Row 2 is below the spawn area (rows 0-1)
      expect(isGameOver(board)).toBe(false);
    });

    it("should return false when blocks are outside spawn columns", () => {
      board[0][2] = "I"; // Column 2 is outside spawn area (columns 3-6)
      expect(isGameOver(board)).toBe(false);
    });
  });

  describe("getColumnHeights", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return all zeros for empty board", () => {
      const heights = getColumnHeights(board);
      expect(heights).toHaveLength(BOARD_WIDTH);
      expect(heights.every((height) => height === 0)).toBe(true);
    });

    it("should calculate correct heights", () => {
      // Place blocks at different heights
      board[BOARD_HEIGHT - 1][0] = "I"; // Height 1
      board[BOARD_HEIGHT - 3][1] = "T"; // Height 3
      board[BOARD_HEIGHT - 5][2] = "O"; // Height 5

      const heights = getColumnHeights(board);
      expect(heights[0]).toBe(1);
      expect(heights[1]).toBe(3);
      expect(heights[2]).toBe(5);
      expect(heights[3]).toBe(0);
    });

    it("should find highest block in each column", () => {
      // Place multiple blocks in same column
      board[BOARD_HEIGHT - 1][0] = "I";
      board[BOARD_HEIGHT - 5][0] = "T"; // This should determine the height

      const heights = getColumnHeights(board);
      expect(heights[0]).toBe(5); // Height from the topmost block
    });
  });
});
