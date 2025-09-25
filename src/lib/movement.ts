import type { Board, Tetromino, Position } from "@/types";
import { hasCollision, canMovePiece, attemptRotation, findHardDropPosition } from "./collision";

/**
 * Attempts to move a tetromino piece in the specified direction
 * @param board - The current game board
 * @param piece - The tetromino piece to move
 * @param direction - The direction to move ('left', 'right', 'down')
 * @returns The moved piece if successful, or the original piece if movement is blocked
 */
export function movePiece(board: Board, piece: Tetromino, direction: "left" | "right" | "down"): Tetromino {
  if (!canMovePiece(board, piece, direction)) {
    return piece;
  }

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

  return {
    ...piece,
    position: { x: newX, y: newY },
  };
}

/**
 * Attempts to move a piece to the left
 * @param board - The current game board
 * @param piece - The tetromino piece to move
 * @returns The moved piece if successful, or the original piece if blocked
 */
export function movePieceLeft(board: Board, piece: Tetromino): Tetromino {
  return movePiece(board, piece, "left");
}

/**
 * Attempts to move a piece to the right
 * @param board - The current game board
 * @param piece - The tetromino piece to move
 * @returns The moved piece if successful, or the original piece if blocked
 */
export function movePieceRight(board: Board, piece: Tetromino): Tetromino {
  return movePiece(board, piece, "right");
}

/**
 * Attempts to move a piece down (soft drop)
 * @param board - The current game board
 * @param piece - The tetromino piece to move
 * @returns The moved piece if successful, or the original piece if blocked
 */
export function movePieceDown(board: Board, piece: Tetromino): Tetromino {
  return movePiece(board, piece, "down");
}

/**
 * Rotates a tetromino piece clockwise with wall kick support
 * @param board - The current game board
 * @param piece - The tetromino piece to rotate
 * @returns The rotated piece if successful, or the original piece if rotation is blocked
 */
export function rotatePiece(board: Board, piece: Tetromino): Tetromino {
  const rotatedPiece = attemptRotation(board, piece, true);
  return rotatedPiece || piece;
}

/**
 * Rotates a tetromino piece counterclockwise with wall kick support
 * @param board - The current game board
 * @param piece - The tetromino piece to rotate
 * @returns The rotated piece if successful, or the original piece if rotation is blocked
 */
export function rotatePieceCounterclockwise(board: Board, piece: Tetromino): Tetromino {
  const rotatedPiece = attemptRotation(board, piece, false);
  return rotatedPiece || piece;
}

/**
 * Performs a hard drop, moving the piece to the lowest possible position
 * @param board - The current game board
 * @param piece - The tetromino piece to drop
 * @returns Object containing the dropped piece and the number of cells dropped
 */
export function hardDropPiece(board: Board, piece: Tetromino): { piece: Tetromino; dropDistance: number } {
  const droppedPiece = findHardDropPosition(board, piece);
  const dropDistance = droppedPiece.position.y - piece.position.y;

  return {
    piece: droppedPiece,
    dropDistance,
  };
}

/**
 * Checks if a piece can move in any direction (used for lock delay)
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if the piece can move in any direction, false if it's locked
 */
export function canPieceMoveAnywhere(board: Board, piece: Tetromino): boolean {
  return (
    canMovePiece(board, piece, "left") ||
    canMovePiece(board, piece, "right") ||
    canMovePiece(board, piece, "down") ||
    attemptRotation(board, piece, true) !== null ||
    attemptRotation(board, piece, false) !== null
  );
}

/**
 * Checks if a piece should be locked (can't move down and has been in position)
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns true if the piece should be locked, false otherwise
 */
export function shouldLockPiece(board: Board, piece: Tetromino): boolean {
  return !canMovePiece(board, piece, "down");
}

/**
 * Gets all possible positions a piece can move to from its current position
 * @param board - The current game board
 * @param piece - The tetromino piece to check
 * @returns Array of valid positions the piece can move to
 */
export function getValidMoves(board: Board, piece: Tetromino): Position[] {
  const validMoves: Position[] = [];
  const directions = [
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }, // right
    { x: 0, y: 1 }, // down
  ];

  for (const direction of directions) {
    const testPiece: Tetromino = {
      ...piece,
      position: {
        x: piece.position.x + direction.x,
        y: piece.position.y + direction.y,
      },
    };

    if (!hasCollision(board, testPiece)) {
      validMoves.push(testPiece.position);
    }
  }

  return validMoves;
}

/**
 * Calculates the ghost piece position (preview of where piece will land)
 * @param board - The current game board
 * @param piece - The tetromino piece to calculate ghost position for
 * @returns The ghost piece at the drop position
 */
export function getGhostPiece(board: Board, piece: Tetromino): Tetromino {
  return findHardDropPosition(board, piece);
}
