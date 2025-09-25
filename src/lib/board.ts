import type { Board, Tetromino, Position, TetrominoType } from "@/types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/constants/game";

/**
 * Creates an empty game board filled with null values
 * @returns A new empty board (20 rows x 10 columns)
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

/**
 * Checks if a tetromino piece can be placed at the given position
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if the position is valid, false otherwise
 */
export function isValidPosition(board: Board, piece: Tetromino): boolean {
  const { shape, position } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = position.x + col;
        const boardY = position.y + row;

        // Check boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false;
        }

        // Allow pieces to spawn above the visible board (negative Y)
        if (boardY < 0) {
          continue;
        }

        // Check collision with existing blocks
        if (board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Places a tetromino piece on the board and returns a new board
 * @param board - The current game board
 * @param piece - The tetromino piece to place
 * @returns A new board with the piece placed
 */
export function placePiece(board: Board, piece: Tetromino): Board {
  // Create a deep copy of the board
  const newBoard = board.map((row) => [...row]);
  const { shape, position, type } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = position.x + col;
        const boardY = position.y + row;

        // Only place blocks that are within the visible board
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = type;
        }
      }
    }
  }

  return newBoard;
}

/**
 * Checks if a row is completely filled
 * @param row - The board row to check
 * @returns true if the row is completely filled, false otherwise
 */
export function isRowComplete(row: (TetrominoType | null)[]): boolean {
  return row.every((cell) => cell !== null);
}

/**
 * Finds all complete rows in the board
 * Optimized version that checks from bottom up (more likely to find complete rows)
 * @param board - The current game board
 * @returns Array of row indices that are complete
 */
export function findCompleteRows(board: Board): number[] {
  const completeRows: number[] = [];

  // Check from bottom up as complete rows are more likely at the bottom
  for (let row = board.length - 1; row >= 0; row--) {
    if (isRowComplete(board[row])) {
      completeRows.unshift(row); // Add to front to maintain ascending order
    }
  }

  return completeRows;
}

/**
 * Clears complete lines from the board and drops remaining blocks
 * @param board - The current game board
 * @returns Object containing the new board and number of lines cleared
 */
export function clearLines(board: Board): { newBoard: Board; linesCleared: number; clearedLineIndices: number[] } {
  const completeRows = findCompleteRows(board);

  if (completeRows.length === 0) {
    return { newBoard: board, linesCleared: 0, clearedLineIndices: [] };
  }

  // Remove complete rows
  const newBoard = board.filter((_, rowIndex) => !completeRows.includes(rowIndex));

  // Add empty rows at the top
  const emptyRowsToAdd = completeRows.length;
  for (let i = 0; i < emptyRowsToAdd; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared: completeRows.length, clearedLineIndices: completeRows };
}

/**
 * Checks if the board has blocks at the top (game over condition)
 * @param board - The current game board
 * @returns true if there are blocks at the top, false otherwise
 */
export function isGameOver(board: Board): boolean {
  // Check if the spawn area (center columns in top 2 visible rows) is blocked
  // This allows more gameplay before triggering game over
  // Standard Tetris allows blocks to exist in top rows as long as new pieces can spawn
  for (let row = 0; row < 2; row++) {
    for (let col = 3; col <= 6; col++) {
      if (board[row][col] !== null) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Gets the height of the highest block in each column
 * @param board - The current game board
 * @returns Array of heights for each column
 */
export function getColumnHeights(board: Board): number[] {
  const heights: number[] = new Array(BOARD_WIDTH).fill(0);

  for (let col = 0; col < BOARD_WIDTH; col++) {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      if (board[row][col] !== null) {
        heights[col] = BOARD_HEIGHT - row;
        break;
      }
    }
  }

  return heights;
}
