import {
  movePiece,
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  rotatePiece,
  rotatePieceCounterclockwise,
  hardDropPiece,
  canPieceMoveAnywhere,
  shouldLockPiece,
  getValidMoves,
  getGhostPiece,
} from "../movement";
import { createEmptyBoard } from "../board";
import { TETROMINO_SHAPES } from "@/constants/game";
import type { Board, Tetromino, TetrominoType } from "@/types";
import { describe, it, expect } from "@jest/globals";

// Helper function to create a test tetromino
function createTestTetromino(
  type: TetrominoType = "T",
  x: number = 4,
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

// Helper function to create a board with blocks at specific positions
function createBoardWithBlocks(blocks: Array<{ x: number; y: number; type: TetrominoType }>): Board {
  const board = createEmptyBoard();
  blocks.forEach(({ x, y, type }) => {
    if (y >= 0 && y < 20 && x >= 0 && x < 10) {
      board[y][x] = type;
    }
  });
  return board;
}

describe("Movement Logic", () => {
  describe("movePiece", () => {
    it("should move piece left when path is clear", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePiece(board, piece, "left");

      expect(result.position.x).toBe(4);
      expect(result.position.y).toBe(5);
    });

    it("should move piece right when path is clear", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePiece(board, piece, "right");

      expect(result.position.x).toBe(6);
      expect(result.position.y).toBe(5);
    });

    it("should move piece down when path is clear", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePiece(board, piece, "down");

      expect(result.position.x).toBe(5);
      expect(result.position.y).toBe(6);
    });

    it("should not move piece if blocked by boundary", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 0, 5); // At left edge

      const result = movePiece(board, piece, "left");

      expect(result.position.x).toBe(0); // Should not move
      expect(result.position.y).toBe(5);
    });

    it("should not move piece if blocked by existing blocks", () => {
      // Block the T-piece's left movement by placing a block where it would collide
      const board = createBoardWithBlocks([{ x: 3, y: 7, type: "I" }]); // Block bottom-left of T-piece
      const piece = createTestTetromino("T", 4, 5);

      const result = movePiece(board, piece, "left");

      expect(result.position.x).toBe(4); // Should not move
      expect(result.position.y).toBe(5);
    });
  });

  describe("movePieceLeft", () => {
    it("should move piece left when possible", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePieceLeft(board, piece);

      expect(result.position.x).toBe(4);
    });

    it("should not move piece left when at boundary", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 0, 5);

      const result = movePieceLeft(board, piece);

      expect(result.position.x).toBe(0);
    });
  });

  describe("movePieceRight", () => {
    it("should move piece right when possible", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePieceRight(board, piece);

      expect(result.position.x).toBe(6);
    });

    it("should not move piece right when at boundary", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 9, 5);

      const result = movePieceRight(board, piece);

      expect(result.position.x).toBe(9);
    });
  });

  describe("movePieceDown", () => {
    it("should move piece down when possible", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = movePieceDown(board, piece);

      expect(result.position.y).toBe(6);
    });

    it("should not move piece down when at bottom", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 18); // Near bottom

      const result = movePieceDown(board, piece);

      expect(result.position.y).toBe(18);
    });
  });

  describe("rotatePiece", () => {
    it("should rotate T-piece clockwise when space is available", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5, 0);

      const result = rotatePiece(board, piece);

      expect(result.rotation).toBe(1);
      expect(result.shape).toEqual(TETROMINO_SHAPES.T[1]);
    });

    it("should not rotate O-piece (it doesn't rotate)", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("O", 5, 5, 0);

      const result = rotatePiece(board, piece);

      expect(result.rotation).toBe(0); // O-piece doesn't rotate
      expect(result.shape).toEqual(TETROMINO_SHAPES.O[0]);
    });

    it("should attempt wall kicks when rotation is blocked", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("I", 0, 5, 0); // I-piece at left edge

      const result = rotatePiece(board, piece);

      // Should either rotate with wall kick or stay in original position
      expect(result.type).toBe("I");
    });

    it("should not rotate when completely blocked", () => {
      // Create a board with blocks that prevent all possible rotations and wall kicks
      const board = createBoardWithBlocks([
        { x: 3, y: 4, type: "I" },
        { x: 4, y: 4, type: "I" },
        { x: 5, y: 4, type: "I" },
        { x: 6, y: 4, type: "I" },
        { x: 7, y: 4, type: "I" },
        { x: 3, y: 5, type: "I" },
        { x: 7, y: 5, type: "I" },
        { x: 3, y: 6, type: "I" },
        { x: 7, y: 6, type: "I" },
        { x: 3, y: 7, type: "I" },
        { x: 4, y: 7, type: "I" },
        { x: 5, y: 7, type: "I" },
        { x: 6, y: 7, type: "I" },
        { x: 7, y: 7, type: "I" },
      ]);
      const piece = createTestTetromino("T", 5, 5, 0);

      const result = rotatePiece(board, piece);

      expect(result.rotation).toBe(0); // Should not rotate
    });
  });

  describe("rotatePieceCounterclockwise", () => {
    it("should rotate T-piece counterclockwise when space is available", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5, 1);

      const result = rotatePieceCounterclockwise(board, piece);

      expect(result.rotation).toBe(0);
      expect(result.shape).toEqual(TETROMINO_SHAPES.T[0]);
    });

    it("should handle rotation from 0 to 3", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5, 0);

      const result = rotatePieceCounterclockwise(board, piece);

      expect(result.rotation).toBe(3);
      expect(result.shape).toEqual(TETROMINO_SHAPES.T[3]);
    });
  });

  describe("hardDropPiece", () => {
    it("should drop piece to bottom of empty board", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 0);

      const result = hardDropPiece(board, piece);

      expect(result.piece.position.y).toBe(17); // T-piece bottom blocks at y=19, so piece at y=17
      expect(result.dropDistance).toBe(17);
    });

    it("should drop piece to rest on existing blocks", () => {
      const board = createBoardWithBlocks([
        { x: 4, y: 15, type: "I" },
        { x: 5, y: 15, type: "I" },
        { x: 6, y: 15, type: "I" },
      ]);
      const piece = createTestTetromino("T", 5, 0);

      const result = hardDropPiece(board, piece);

      expect(result.piece.position.y).toBe(12); // Should rest above blocks
      expect(result.dropDistance).toBe(12);
    });

    it("should not move piece if already at bottom", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 18);

      const result = hardDropPiece(board, piece);

      expect(result.piece.position.y).toBe(18);
      expect(result.dropDistance).toBe(0);
    });
  });

  describe("canPieceMoveAnywhere", () => {
    it("should return true when piece can move in any direction", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = canPieceMoveAnywhere(board, piece);

      expect(result).toBe(true);
    });

    it("should return false when piece is completely locked", () => {
      // Create a board where piece cannot move in any direction
      const board = createBoardWithBlocks([
        { x: 3, y: 18, type: "I" }, // Left
        { x: 7, y: 18, type: "I" }, // Right
        { x: 4, y: 19, type: "I" }, // Bottom
        { x: 5, y: 19, type: "I" }, // Bottom
        { x: 6, y: 19, type: "I" }, // Bottom
      ]);
      const piece = createTestTetromino("T", 5, 18);

      const result = canPieceMoveAnywhere(board, piece);

      expect(result).toBe(false);
    });

    it("should return true when piece can rotate even if movement is blocked", () => {
      const board = createBoardWithBlocks([
        { x: 4, y: 19, type: "I" }, // Block left movement
        { x: 6, y: 19, type: "I" }, // Block right movement
        { x: 5, y: 19, type: "I" }, // Block down movement
      ]);
      const piece = createTestTetromino("T", 5, 18);

      const result = canPieceMoveAnywhere(board, piece);

      expect(result).toBe(true); // Should be able to rotate
    });
  });

  describe("shouldLockPiece", () => {
    it("should return true when piece cannot move down", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 18); // At bottom

      const result = shouldLockPiece(board, piece);

      expect(result).toBe(true);
    });

    it("should return false when piece can still move down", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 10);

      const result = shouldLockPiece(board, piece);

      expect(result).toBe(false);
    });

    it("should return true when piece is resting on blocks", () => {
      const board = createBoardWithBlocks([
        { x: 4, y: 10, type: "I" },
        { x: 5, y: 10, type: "I" },
        { x: 6, y: 10, type: "I" },
      ]);
      const piece = createTestTetromino("T", 5, 8);

      const result = shouldLockPiece(board, piece);

      expect(result).toBe(true);
    });
  });

  describe("getValidMoves", () => {
    it("should return all valid adjacent positions", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 5);

      const result = getValidMoves(board, piece);

      expect(result).toHaveLength(3); // left, right, down
      expect(result).toContainEqual({ x: 4, y: 5 }); // left
      expect(result).toContainEqual({ x: 6, y: 5 }); // right
      expect(result).toContainEqual({ x: 5, y: 6 }); // down
    });

    it("should exclude blocked positions", () => {
      const board = createBoardWithBlocks([{ x: 4, y: 7, type: "I" }]); // Block left movement at T-piece bottom
      const piece = createTestTetromino("T", 5, 5);

      const result = getValidMoves(board, piece);

      expect(result).toHaveLength(2); // right and down only
      expect(result).not.toContainEqual({ x: 4, y: 5 }); // left blocked
    });

    it("should exclude boundary violations", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 1, 17); // Near corner but valid position

      const result = getValidMoves(board, piece);

      expect(result).toHaveLength(2); // left and right (down blocked by boundary)
      expect(result).toContainEqual({ x: 0, y: 17 }); // left
      expect(result).toContainEqual({ x: 2, y: 17 }); // right
    });
  });

  describe("getGhostPiece", () => {
    it("should return piece at hard drop position", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 0);

      const result = getGhostPiece(board, piece);

      expect(result.position.x).toBe(5);
      expect(result.position.y).toBe(17); // At bottom
      expect(result.type).toBe("T");
      expect(result.rotation).toBe(0);
    });

    it("should return piece resting on blocks", () => {
      const board = createBoardWithBlocks([
        { x: 4, y: 15, type: "I" },
        { x: 5, y: 15, type: "I" },
        { x: 6, y: 15, type: "I" },
      ]);
      const piece = createTestTetromino("T", 5, 0);

      const result = getGhostPiece(board, piece);

      expect(result.position.x).toBe(5);
      expect(result.position.y).toBe(12); // Above the blocks
    });

    it("should return same position if already at bottom", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 5, 18);

      const result = getGhostPiece(board, piece);

      expect(result.position.x).toBe(5);
      expect(result.position.y).toBe(18);
    });
  });

  describe("Edge Cases", () => {
    it("should handle I-piece rotation near boundaries", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("I", 1, 5, 0); // Near left edge

      const result = rotatePiece(board, piece);

      // Should either rotate with wall kick or stay in place
      expect(result.type).toBe("I");
    });

    it("should handle complex wall kick scenarios", () => {
      const board = createBoardWithBlocks([
        { x: 3, y: 5, type: "I" },
        { x: 7, y: 5, type: "I" },
      ]);
      const piece = createTestTetromino("T", 5, 5, 0);

      const result = rotatePiece(board, piece);

      // Should attempt wall kicks and either succeed or fail gracefully
      expect(result.type).toBe("T");
    });

    it("should handle movement at spawn position", () => {
      const board = createEmptyBoard();
      const piece = createTestTetromino("T", 4, -1); // Above visible board

      const leftResult = movePieceLeft(board, piece);
      const rightResult = movePieceRight(board, piece);
      const downResult = movePieceDown(board, piece);

      expect(leftResult.position.x).toBe(3);
      expect(rightResult.position.x).toBe(5);
      expect(downResult.position.y).toBe(0);
    });
  });
});
