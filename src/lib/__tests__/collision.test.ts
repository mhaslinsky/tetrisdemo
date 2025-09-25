import {
  checkBoundaryCollision,
  checkBlockCollision,
  hasCollision,
  getWallKickOffsets,
  createRotatedPiece,
  attemptRotation,
  canMovePiece,
  findHardDropPosition,
  canSpawnPiece,
} from "../collision";
import { createEmptyBoard } from "../board";
import type { Board, Tetromino, TetrominoType } from "@/types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINO_SHAPES } from "@/constants/game";
import { describe, it, expect, beforeEach } from "@jest/globals";

// Helper function to create a test tetromino
function createTestTetromino(
  type: TetrominoType = "I",
  x: number = 0,
  y: number = 0,
  rotation: number = 0
): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type][rotation],
    position: { x, y },
    rotation,
  };
}

describe("Collision Detection System", () => {
  let board: Board;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe("checkBoundaryCollision", () => {
    it("should return false for piece within boundaries", () => {
      const piece = createTestTetromino("I", 3, 0);
      expect(checkBoundaryCollision(piece)).toBe(false);
    });

    it("should return true when piece goes outside left boundary", () => {
      const piece = createTestTetromino("I", -1, 0);
      expect(checkBoundaryCollision(piece)).toBe(true);
    });

    it("should return true when piece goes outside right boundary", () => {
      const piece = createTestTetromino("I", BOARD_WIDTH - 3, 0); // I-piece is 4 wide
      expect(checkBoundaryCollision(piece)).toBe(true);
    });

    it("should return true when piece goes outside bottom boundary", () => {
      const piece = createTestTetromino("I", 0, BOARD_HEIGHT);
      expect(checkBoundaryCollision(piece)).toBe(true);
    });

    it("should allow pieces above the visible board", () => {
      const piece = createTestTetromino("I", 3, -2);
      expect(checkBoundaryCollision(piece)).toBe(false);
    });

    it("should handle T-piece boundary collision correctly", () => {
      const piece = createTestTetromino("T", 0, 0);
      expect(checkBoundaryCollision(piece)).toBe(false);
    });

    it("should detect T-piece left boundary collision", () => {
      const piece = createTestTetromino("T", -1, 0);
      expect(checkBoundaryCollision(piece)).toBe(true);
    });

    it("should detect T-piece right boundary collision", () => {
      const piece = createTestTetromino("T", BOARD_WIDTH - 2, 0); // T-piece is 3 wide
      expect(checkBoundaryCollision(piece)).toBe(true);
    });

    it("should handle O-piece boundary collision", () => {
      const piece = createTestTetromino("O", BOARD_WIDTH - 3, 0); // O-piece blocks at positions 1,2 in 4x4 matrix
      expect(checkBoundaryCollision(piece)).toBe(false);
    });

    it("should detect O-piece right boundary collision", () => {
      const piece = createTestTetromino("O", BOARD_WIDTH - 2, 0); // This will put blocks at positions 9,10 (10 is out of bounds)
      expect(checkBoundaryCollision(piece)).toBe(true);
    });
  });

  describe("checkBlockCollision", () => {
    it("should return false for piece on empty board", () => {
      const piece = createTestTetromino("I", 0, 0);
      expect(checkBlockCollision(board, piece)).toBe(false);
    });

    it("should return true when piece collides with existing block", () => {
      // Place a block on the board
      board[2][1] = "T";
      const piece = createTestTetromino("I", 0, 1); // I-piece at row 2 (1+1)
      expect(checkBlockCollision(board, piece)).toBe(true);
    });

    it("should return false when piece is above existing blocks", () => {
      // Place blocks at bottom
      board[BOARD_HEIGHT - 1][0] = "T";
      board[BOARD_HEIGHT - 1][1] = "T";
      const piece = createTestTetromino("I", 0, 0);
      expect(checkBlockCollision(board, piece)).toBe(false);
    });

    it("should handle piece partially above visible board", () => {
      // Place block at top of visible board
      board[0][1] = "T";
      const piece = createTestTetromino("I", 0, -1); // Piece extends above board
      expect(checkBlockCollision(board, piece)).toBe(true);
    });

    it("should ignore collisions above visible board", () => {
      const piece = createTestTetromino("I", 0, -3); // Completely above board
      expect(checkBlockCollision(board, piece)).toBe(false);
    });

    it("should handle T-piece collision correctly", () => {
      // Place block where T-piece center would be
      board[2][2] = "I";
      const piece = createTestTetromino("T", 1, 0);
      expect(checkBlockCollision(board, piece)).toBe(true);
    });

    it("should handle complex collision scenarios", () => {
      // Create a pattern with gaps - I-piece is horizontal at rotation 0
      board[5][0] = "I";
      board[5][2] = "I";
      board[5][3] = "I";
      // Gap at board[5][1] but I-piece spans 4 blocks horizontally

      const piece = createTestTetromino("I", 1, 4); // I-piece at x=1 will occupy positions 1,2,3,4 - should collide
      expect(checkBlockCollision(board, piece)).toBe(true);
    });
  });

  describe("hasCollision", () => {
    it("should return false for valid position", () => {
      const piece = createTestTetromino("I", 3, 0);
      expect(hasCollision(board, piece)).toBe(false);
    });

    it("should return true for boundary collision", () => {
      const piece = createTestTetromino("I", -1, 0);
      expect(hasCollision(board, piece)).toBe(true);
    });

    it("should return true for block collision", () => {
      board[2][1] = "T";
      const piece = createTestTetromino("I", 0, 1);
      expect(hasCollision(board, piece)).toBe(true);
    });

    it("should return true when both collisions occur", () => {
      board[2][0] = "T";
      const piece = createTestTetromino("I", -1, 1);
      expect(hasCollision(board, piece)).toBe(true);
    });
  });

  describe("getWallKickOffsets", () => {
    it("should return correct offsets for standard pieces", () => {
      const offsets = getWallKickOffsets("T", 0, 1);
      expect(offsets).toHaveLength(5);
      expect(offsets[0]).toEqual({ x: 0, y: 0 });
      expect(offsets[1]).toEqual({ x: -1, y: 0 });
    });

    it("should return correct offsets for I-piece", () => {
      const offsets = getWallKickOffsets("I", 0, 1);
      expect(offsets).toHaveLength(5);
      expect(offsets[0]).toEqual({ x: 0, y: 0 });
      expect(offsets[1]).toEqual({ x: -2, y: 0 });
    });

    it("should return single offset for O-piece", () => {
      const offsets = getWallKickOffsets("O", 0, 1);
      expect(offsets).toHaveLength(1);
      expect(offsets[0]).toEqual({ x: 0, y: 0 });
    });

    it("should handle reverse rotations", () => {
      const offsets = getWallKickOffsets("T", 1, 0);
      expect(offsets).toHaveLength(5);
      expect(offsets[0]).toEqual({ x: 0, y: 0 });
      expect(offsets[1]).toEqual({ x: 1, y: 0 });
    });

    it("should handle all rotation transitions", () => {
      const transitions = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [1, 0],
        [2, 1],
        [3, 2],
        [0, 3],
      ];

      transitions.forEach(([from, to]) => {
        const offsets = getWallKickOffsets("T", from, to);
        expect(offsets.length).toBeGreaterThan(0);
      });
    });

    it("should return default offset for invalid transitions", () => {
      const offsets = getWallKickOffsets("T", 0, 5); // Invalid rotation
      expect(offsets).toEqual([{ x: 0, y: 0 }]);
    });
  });

  describe("createRotatedPiece", () => {
    it("should create piece with correct rotation", () => {
      const piece = createTestTetromino("T", 5, 5, 0);
      const rotated = createRotatedPiece(piece, 1);

      expect(rotated.rotation).toBe(1);
      expect(rotated.shape).toEqual(TETROMINO_SHAPES.T[1]);
      expect(rotated.position).toEqual({ x: 5, y: 5 });
      expect(rotated.type).toBe("T");
    });

    it("should handle negative rotations", () => {
      const piece = createTestTetromino("T", 0, 0, 0);
      const rotated = createRotatedPiece(piece, -1);

      expect(rotated.rotation).toBe(3); // -1 becomes 3
    });

    it("should handle rotations greater than 3", () => {
      const piece = createTestTetromino("T", 0, 0, 0);
      const rotated = createRotatedPiece(piece, 5);

      expect(rotated.rotation).toBe(1); // 5 % 4 = 1
    });

    it("should not modify original piece", () => {
      const piece = createTestTetromino("T", 5, 5, 0);
      const rotated = createRotatedPiece(piece, 1);

      expect(piece.rotation).toBe(0);
      expect(rotated).not.toBe(piece);
    });
  });

  describe("attemptRotation", () => {
    it("should rotate piece when space is available", () => {
      const piece = createTestTetromino("T", 5, 5, 0);
      const rotated = attemptRotation(board, piece);

      expect(rotated).not.toBeNull();
      expect(rotated!.rotation).toBe(1);
    });

    it("should return null when rotation is impossible", () => {
      // Fill the board around the piece to prevent rotation
      const piece = createTestTetromino("T", 1, 1, 0);

      // Block all possible wall kick positions
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (x !== 1 || y !== 1) {
            // Don't block the piece's current position
            board[y][x] = "I";
          }
        }
      }

      const rotated = attemptRotation(board, piece);
      expect(rotated).toBeNull();
    });

    it("should use wall kicks when normal rotation fails", () => {
      const piece = createTestTetromino("T", 0, 1, 0);

      // Block the normal rotation position to force wall kick
      board[2][0] = "I"; // Block where T-piece would rotate to

      const rotated = attemptRotation(board, piece);
      expect(rotated).not.toBeNull();
      // The piece should rotate successfully with wall kicks
      expect(rotated!.rotation).toBe(1);
    });

    it("should handle counter-clockwise rotation", () => {
      const piece = createTestTetromino("T", 5, 5, 1);
      const rotated = attemptRotation(board, piece, false);

      expect(rotated).not.toBeNull();
      expect(rotated!.rotation).toBe(0);
    });

    it("should return same piece for O-piece", () => {
      const piece = createTestTetromino("O", 5, 5, 0);
      const rotated = attemptRotation(board, piece);

      expect(rotated).toEqual(piece);
    });

    it("should handle I-piece wall kicks", () => {
      const piece = createTestTetromino("I", 0, 1, 0);

      // Create a scenario where I-piece needs wall kicks
      board[2][0] = "T";

      const rotated = attemptRotation(board, piece);
      expect(rotated).not.toBeNull();
    });
  });

  describe("canMovePiece", () => {
    it("should return true for valid left movement", () => {
      const piece = createTestTetromino("I", 5, 5);
      expect(canMovePiece(board, piece, "left")).toBe(true);
    });

    it("should return true for valid right movement", () => {
      const piece = createTestTetromino("I", 2, 5);
      expect(canMovePiece(board, piece, "right")).toBe(true);
    });

    it("should return true for valid down movement", () => {
      const piece = createTestTetromino("I", 5, 5);
      expect(canMovePiece(board, piece, "down")).toBe(true);
    });

    it("should return false when moving left hits boundary", () => {
      const piece = createTestTetromino("I", 0, 5);
      expect(canMovePiece(board, piece, "left")).toBe(false);
    });

    it("should return false when moving right hits boundary", () => {
      const piece = createTestTetromino("I", BOARD_WIDTH - 4, 5); // I-piece is 4 wide
      expect(canMovePiece(board, piece, "right")).toBe(false);
    });

    it("should return false when moving down hits bottom", () => {
      const piece = createTestTetromino("I", 5, BOARD_HEIGHT - 1);
      expect(canMovePiece(board, piece, "down")).toBe(false);
    });

    it("should return false when moving into existing blocks", () => {
      board[6][4] = "T";
      const piece = createTestTetromino("I", 5, 5);
      expect(canMovePiece(board, piece, "left")).toBe(false);
    });

    it("should handle T-piece movement correctly", () => {
      const piece = createTestTetromino("T", 5, 5);
      expect(canMovePiece(board, piece, "left")).toBe(true);
      expect(canMovePiece(board, piece, "right")).toBe(true);
      expect(canMovePiece(board, piece, "down")).toBe(true);
    });
  });

  describe("findHardDropPosition", () => {
    it("should find bottom position on empty board", () => {
      const piece = createTestTetromino("I", 5, 0);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position.x).toBe(5);
      expect(dropped.position.y).toBe(BOARD_HEIGHT - 2); // I-piece height is 1, so -2
    });

    it("should stop above existing blocks", () => {
      // Place blocks at bottom
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[BOARD_HEIGHT - 1][x] = "T";
      }

      const piece = createTestTetromino("I", 5, 0);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position.y).toBe(BOARD_HEIGHT - 3); // Stop above the blocks
    });

    it("should handle partial block collision", () => {
      // Place some blocks that only partially block the piece
      board[BOARD_HEIGHT - 1][5] = "T";
      board[BOARD_HEIGHT - 1][6] = "T";

      const piece = createTestTetromino("I", 4, 0);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position.y).toBe(BOARD_HEIGHT - 3);
    });

    it("should return same position if already at bottom", () => {
      const piece = createTestTetromino("I", 5, BOARD_HEIGHT - 2);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position).toEqual(piece.position);
    });

    it("should handle T-piece hard drop", () => {
      const piece = createTestTetromino("T", 5, 0);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position.x).toBe(5);
      expect(dropped.position.y).toBe(BOARD_HEIGHT - 3); // T-piece height is 2
    });

    it("should handle complex board scenarios", () => {
      // Create a simple pattern where I-piece can land
      board[BOARD_HEIGHT - 1][2] = "T";
      board[BOARD_HEIGHT - 1][3] = "T";
      board[BOARD_HEIGHT - 1][4] = "T";
      board[BOARD_HEIGHT - 1][5] = "T";

      const piece = createTestTetromino("I", 2, 0);
      const dropped = findHardDropPosition(board, piece);

      expect(dropped.position.y).toBe(BOARD_HEIGHT - 3); // Should land above the blocks
    });
  });

  describe("canSpawnPiece", () => {
    it("should return true for empty board", () => {
      const piece = createTestTetromino("I", 3, 0);
      expect(canSpawnPiece(board, piece)).toBe(true);
    });

    it("should return false when spawn position is blocked", () => {
      // Block the spawn area
      board[1][3] = "T";
      const piece = createTestTetromino("I", 0, 0);
      expect(canSpawnPiece(board, piece)).toBe(false);
    });

    it("should return true when spawn position is partially above board", () => {
      const piece = createTestTetromino("I", 3, -1);
      expect(canSpawnPiece(board, piece)).toBe(true);
    });

    it("should handle different piece types", () => {
      const pieces: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

      pieces.forEach((type) => {
        const piece = createTestTetromino(type, 3, 0);
        expect(canSpawnPiece(board, piece)).toBe(true);
      });
    });

    it("should detect game over condition", () => {
      // Fill top rows to simulate game over
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[0][x] = "T";
        board[1][x] = "T";
      }

      const piece = createTestTetromino("I", 3, 0);
      expect(canSpawnPiece(board, piece)).toBe(false);
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle piece at exact boundary", () => {
      const piece = createTestTetromino("O", BOARD_WIDTH - 3, 0); // O-piece blocks at positions 1,2 in matrix
      expect(hasCollision(board, piece)).toBe(false);
    });

    it("should handle multiple collision types simultaneously", () => {
      // Place piece at boundary with block collision
      board[1][0] = "T";
      const piece = createTestTetromino("I", -1, 0);

      expect(checkBoundaryCollision(piece)).toBe(true);
      expect(checkBlockCollision(board, piece)).toBe(true);
      expect(hasCollision(board, piece)).toBe(true);
    });

    it("should handle rotation near boundaries", () => {
      const piece = createTestTetromino("I", 0, 5, 0);
      const rotated = attemptRotation(board, piece);

      expect(rotated).not.toBeNull();
      expect(rotated!.position.x).toBeGreaterThanOrEqual(0);
    });

    it("should handle complex wall kick scenarios", () => {
      const piece = createTestTetromino("T", BOARD_WIDTH - 2, 5, 0);

      // Block some positions to force specific wall kicks
      board[5][BOARD_WIDTH - 1] = "I";

      const rotated = attemptRotation(board, piece);
      expect(rotated).not.toBeNull();
    });

    it("should maintain piece integrity during operations", () => {
      const originalPiece = createTestTetromino("T", 5, 5, 0);
      const originalType = originalPiece.type;
      const originalPosition = { ...originalPiece.position };

      // Perform various operations
      attemptRotation(board, originalPiece);
      canMovePiece(board, originalPiece, "left");
      findHardDropPosition(board, originalPiece);

      // Original piece should be unchanged
      expect(originalPiece.type).toBe(originalType);
      expect(originalPiece.position).toEqual(originalPosition);
    });
  });
});
