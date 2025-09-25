import type { Board, Tetromino, Position } from "@/types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINO_SHAPES } from "@/constants/game";

/**
 * Checks if a tetromino piece collides with the board boundaries
 * Optimized version with early exit conditions
 * @param piece - The tetromino piece to check
 * @returns true if there's a boundary collision, false otherwise
 */
export function checkBoundaryCollision(piece: Tetromino): boolean {
  const { shape, position } = piece;
  const { x: posX, y: posY } = position;

  // Early exit: check if piece is completely outside boundaries
  if (posX + shape[0].length <= 0 || posX >= BOARD_WIDTH) {
    return true;
  }

  for (let row = 0; row < shape.length; row++) {
    const boardY = posY + row;

    // Skip rows above the board (allowed for spawning)
    if (boardY < 0) continue;

    // Early exit: if we're below the board, collision detected
    if (boardY >= BOARD_HEIGHT) {
      // Check if this row has any blocks
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          return true;
        }
      }
      continue;
    }

    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = posX + col;

        // Check left and right boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if a tetromino piece collides with existing blocks on the board
 * Optimized version with boundary checks and early exits
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if there's a block collision, false otherwise
 */
export function checkBlockCollision(board: Board, piece: Tetromino): boolean {
  const { shape, position } = piece;
  const { x: posX, y: posY } = position;

  for (let row = 0; row < shape.length; row++) {
    const boardY = posY + row;

    // Skip rows outside the visible board
    if (boardY < 0 || boardY >= BOARD_HEIGHT) continue;

    const boardRow = board[boardY];

    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = posX + col;

        // Check bounds and collision in one condition
        if (boardX >= 0 && boardX < BOARD_WIDTH && boardRow[boardX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if a tetromino piece has any collision (boundary or block)
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if there's any collision, false otherwise
 */
export function hasCollision(board: Board, piece: Tetromino): boolean {
  return checkBoundaryCollision(piece) || checkBlockCollision(board, piece);
}

/**
 * Wall kick offset data for different tetromino types and rotations
 * Based on the Super Rotation System (SRS) used in modern Tetris games
 */
const WALL_KICK_OFFSETS = {
  // Standard pieces (J, L, S, T, Z)
  JLSTZ: {
    "0->1": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
    "1->0": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    "1->2": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    "2->1": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
    "2->3": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
    "3->2": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    "3->0": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    "0->3": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
  },
  // I-piece has different wall kick offsets
  I: {
    "0->1": [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
    ],
    "1->0": [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 1 },
      { x: -1, y: -2 },
    ],
    "1->2": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 2 },
      { x: 2, y: -1 },
    ],
    "2->1": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: -2 },
      { x: -2, y: 1 },
    ],
    "2->3": [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 1 },
      { x: -1, y: -2 },
    ],
    "3->2": [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
    ],
    "3->0": [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: -2 },
      { x: -2, y: 1 },
    ],
    "0->3": [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 2 },
      { x: 2, y: -1 },
    ],
  },
  // O-piece doesn't rotate, so no wall kicks needed
  O: {},
};

/**
 * Gets wall kick offsets for a specific piece type and rotation transition
 * @param pieceType - The type of tetromino piece
 * @param fromRotation - The current rotation state (0-3)
 * @param toRotation - The target rotation state (0-3)
 * @returns Array of position offsets to try for wall kicks
 */
export function getWallKickOffsets(pieceType: string, fromRotation: number, toRotation: number): Position[] {
  // O-piece doesn't rotate
  if (pieceType === "O") {
    return [{ x: 0, y: 0 }];
  }

  // Get the appropriate offset table
  const offsetTable = pieceType === "I" ? WALL_KICK_OFFSETS.I : WALL_KICK_OFFSETS.JLSTZ;
  const transitionKey = `${fromRotation}->${toRotation}` as keyof typeof offsetTable;

  return offsetTable[transitionKey] || [{ x: 0, y: 0 }];
}

/**
 * Creates a rotated version of a tetromino piece
 * @param piece - The original tetromino piece
 * @param newRotation - The target rotation state (0-3)
 * @returns A new tetromino piece with the specified rotation
 */
export function createRotatedPiece(piece: Tetromino, newRotation: number): Tetromino {
  const normalizedRotation = ((newRotation % 4) + 4) % 4; // Ensure rotation is 0-3
  const newShape = TETROMINO_SHAPES[piece.type][normalizedRotation];

  return {
    ...piece,
    shape: newShape,
    rotation: normalizedRotation,
  };
}

/**
 * Attempts to rotate a tetromino piece with wall kick support
 * @param board - The current game board
 * @param piece - The tetromino piece to rotate
 * @param clockwise - Whether to rotate clockwise (default: true)
 * @returns The successfully rotated piece, or null if rotation is not possible
 */
export function attemptRotation(board: Board, piece: Tetromino, clockwise: boolean = true): Tetromino | null {
  // O-piece doesn't rotate
  if (piece.type === "O") {
    return piece;
  }

  const currentRotation = piece.rotation;
  const targetRotation = clockwise ? (currentRotation + 1) % 4 : (currentRotation - 1 + 4) % 4;

  // Get wall kick offsets for this rotation
  const wallKickOffsets = getWallKickOffsets(piece.type, currentRotation, targetRotation);

  // Try each wall kick offset
  for (const offset of wallKickOffsets) {
    const rotatedPiece = createRotatedPiece(piece, targetRotation);
    const testPiece: Tetromino = {
      ...rotatedPiece,
      position: {
        x: piece.position.x + offset.x,
        y: piece.position.y + offset.y,
      },
    };

    // Check if this position is valid
    if (!hasCollision(board, testPiece)) {
      return testPiece;
    }
  }

  // No valid rotation found
  return null;
}

/**
 * Checks if a piece can move in a specific direction
 * @param board - The current game board
 * @param piece - The tetromino piece to move
 * @param direction - The direction to move ('left', 'right', 'down')
 * @returns true if the move is valid, false otherwise
 */
export function canMovePiece(board: Board, piece: Tetromino, direction: "left" | "right" | "down"): boolean {
  let newX = piece.position.x;
  let newY = piece.position.y;

  switch (direction) {
    case "left":
      newX -= 1;
      break;
    case "right":
      newX += 1;
      break;
    case "down":
      newY += 1;
      break;
  }

  const testPiece: Tetromino = {
    ...piece,
    position: { x: newX, y: newY },
  };

  return !hasCollision(board, testPiece);
}

/**
 * Finds the lowest valid position for a piece (used for hard drop)
 * @param board - The current game board
 * @param piece - The tetromino piece to drop
 * @returns The piece at the lowest valid position
 */
export function findHardDropPosition(board: Board, piece: Tetromino): Tetromino {
  let testPiece = { ...piece };
  let lastValidPiece = { ...piece };

  // Keep moving down until we hit a collision
  while (!hasCollision(board, testPiece)) {
    lastValidPiece = { ...testPiece };
    testPiece = {
      ...testPiece,
      position: { x: testPiece.position.x, y: testPiece.position.y + 1 },
    };
  }

  return lastValidPiece;
}

/**
 * Checks if a piece can be placed at the spawn position (game over check)
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if the piece can spawn, false if game over
 */
export function canSpawnPiece(board: Board, piece: Tetromino): boolean {
  return !hasCollision(board, piece);
}
