import {
  calculateLineScore,
  calculateLevel,
  calculateDropSpeed,
  calculateSoftDropScore,
  calculateHardDropScore,
  processLineClearing,
  getLineClearName,
  validateScoreCalculation,
} from "../scoring";
import { createEmptyBoard } from "../board";
import type { Board, TetrominoType } from "@/types";
import { GAME_CONFIG } from "@/constants/game";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Scoring System", () => {
  describe("calculateLineScore", () => {
    it("should calculate correct score for single line", () => {
      expect(calculateLineScore(1, 1)).toBe(100);
      expect(calculateLineScore(1, 2)).toBe(200);
      expect(calculateLineScore(1, 5)).toBe(500);
    });

    it("should calculate correct score for double lines", () => {
      expect(calculateLineScore(2, 1)).toBe(300);
      expect(calculateLineScore(2, 3)).toBe(900);
      expect(calculateLineScore(2, 10)).toBe(3000);
    });

    it("should calculate correct score for triple lines", () => {
      expect(calculateLineScore(3, 1)).toBe(500);
      expect(calculateLineScore(3, 2)).toBe(1000);
      expect(calculateLineScore(3, 4)).toBe(2000);
    });

    it("should calculate correct score for tetris (4 lines)", () => {
      expect(calculateLineScore(4, 1)).toBe(800);
      expect(calculateLineScore(4, 3)).toBe(2400);
      expect(calculateLineScore(4, 5)).toBe(4000);
    });

    it("should return 0 for invalid line counts", () => {
      expect(calculateLineScore(0, 1)).toBe(0);
      expect(calculateLineScore(5, 1)).toBe(0);
      expect(calculateLineScore(-1, 1)).toBe(0);
    });

    it("should handle edge cases", () => {
      expect(calculateLineScore(1, 0)).toBe(0);
      expect(calculateLineScore(4, 0)).toBe(0);
      expect(calculateLineScore(2, -1)).toBe(-300);
    });
  });

  describe("calculateLevel", () => {
    it("should start at level 1", () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(5)).toBe(1);
      expect(calculateLevel(9)).toBe(1);
    });

    it("should increase level every 10 lines", () => {
      expect(calculateLevel(10)).toBe(2);
      expect(calculateLevel(15)).toBe(2);
      expect(calculateLevel(19)).toBe(2);
      expect(calculateLevel(20)).toBe(3);
      expect(calculateLevel(25)).toBe(3);
      expect(calculateLevel(100)).toBe(11);
    });

    it("should handle large numbers correctly", () => {
      expect(calculateLevel(999)).toBe(100);
      expect(calculateLevel(1000)).toBe(101);
    });

    it("should use configured level up lines", () => {
      const originalLevelUpLines = GAME_CONFIG.levelUpLines;
      expect(calculateLevel(originalLevelUpLines)).toBe(2);
      expect(calculateLevel(originalLevelUpLines * 2)).toBe(3);
    });
  });

  describe("calculateDropSpeed", () => {
    it("should decrease speed as level increases", () => {
      const speed1 = calculateDropSpeed(1);
      const speed2 = calculateDropSpeed(2);
      const speed5 = calculateDropSpeed(5);
      const speed10 = calculateDropSpeed(10);

      expect(speed2).toBeLessThan(speed1);
      expect(speed5).toBeLessThan(speed2);
      expect(speed10).toBeLessThan(speed5);
    });

    it("should have minimum speed limit", () => {
      const highLevelSpeed = calculateDropSpeed(20);
      const veryHighLevelSpeed = calculateDropSpeed(100);

      expect(highLevelSpeed).toBeGreaterThanOrEqual(50);
      expect(veryHighLevelSpeed).toBeGreaterThanOrEqual(50);
      expect(veryHighLevelSpeed).toBe(50); // Should hit minimum
    });

    it("should start with base speed", () => {
      const initialSpeed = calculateDropSpeed(1);
      expect(initialSpeed).toBe(GAME_CONFIG.dropSpeed);
    });

    it("should calculate exponential speed increase", () => {
      const level1Speed = calculateDropSpeed(1);
      const level2Speed = calculateDropSpeed(2);

      // Level 2 should be 80% of level 1 speed (20% faster)
      const expectedLevel2Speed = Math.max(50, Math.floor(level1Speed * 0.8));
      expect(level2Speed).toBe(expectedLevel2Speed);
    });
  });

  describe("calculateSoftDropScore", () => {
    it("should calculate correct soft drop score", () => {
      expect(calculateSoftDropScore(1)).toBe(GAME_CONFIG.scoring.softDrop);
      expect(calculateSoftDropScore(5)).toBe(5 * GAME_CONFIG.scoring.softDrop);
      expect(calculateSoftDropScore(0)).toBe(0);
    });

    it("should handle negative values", () => {
      expect(calculateSoftDropScore(-1)).toBe(-GAME_CONFIG.scoring.softDrop);
    });
  });

  describe("calculateHardDropScore", () => {
    it("should calculate correct hard drop score", () => {
      expect(calculateHardDropScore(1)).toBe(GAME_CONFIG.scoring.hardDrop);
      expect(calculateHardDropScore(10)).toBe(10 * GAME_CONFIG.scoring.hardDrop);
      expect(calculateHardDropScore(0)).toBe(0);
    });

    it("should be double the soft drop score", () => {
      const cells = 5;
      const softScore = calculateSoftDropScore(cells);
      const hardScore = calculateHardDropScore(cells);

      expect(hardScore).toBe(softScore * 2);
    });
  });

  describe("processLineClearing", () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it("should return unchanged state when no lines to clear", () => {
      const result = processLineClearing(board, 1, 100, 5);

      expect(result.linesCleared).toBe(0);
      expect(result.scoreGained).toBe(0);
      expect(result.newScore).toBe(100);
      expect(result.newLevel).toBe(1);
      expect(result.newTotalLines).toBe(5);
      expect(result.leveledUp).toBe(false);
      expect(result.newBoard).toBe(board);
    });

    it("should process single line clear correctly", () => {
      // Fill bottom row
      for (let col = 0; col < 10; col++) {
        board[19][col] = "I" as TetrominoType;
      }

      const result = processLineClearing(board, 2, 500, 8);

      expect(result.linesCleared).toBe(1);
      expect(result.scoreGained).toBe(200); // 100 * level 2
      expect(result.newScore).toBe(700);
      expect(result.newTotalLines).toBe(9);
      expect(result.newLevel).toBe(1); // Still level 1 with 9 total lines
      expect(result.leveledUp).toBe(false);

      // Bottom row should be empty after clearing
      expect(result.newBoard[19].every((cell) => cell === null)).toBe(true);
    });

    it("should process multiple line clear correctly", () => {
      // Fill bottom two rows
      for (let row = 18; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          board[row][col] = "T" as TetrominoType;
        }
      }

      const result = processLineClearing(board, 1, 0, 0);

      expect(result.linesCleared).toBe(2);
      expect(result.scoreGained).toBe(300); // 300 * level 1
      expect(result.newScore).toBe(300);
      expect(result.newTotalLines).toBe(2);
      expect(result.newLevel).toBe(1);
      expect(result.leveledUp).toBe(false);
    });

    it("should handle level progression", () => {
      // Fill bottom row to trigger level up
      for (let col = 0; col < 10; col++) {
        board[19][col] = "I" as TetrominoType;
      }

      const result = processLineClearing(board, 1, 0, 9); // 9 + 1 = 10 lines

      expect(result.linesCleared).toBe(1);
      expect(result.newTotalLines).toBe(10);
      expect(result.newLevel).toBe(2);
      expect(result.leveledUp).toBe(true);
    });

    it("should handle tetris scoring", () => {
      // Fill bottom four rows
      for (let row = 16; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          board[row][col] = "L" as TetrominoType;
        }
      }

      const result = processLineClearing(board, 3, 1000, 15);

      expect(result.linesCleared).toBe(4);
      expect(result.scoreGained).toBe(2400); // 800 * level 3
      expect(result.newScore).toBe(3400);
      expect(result.newTotalLines).toBe(19);
      expect(result.newLevel).toBe(2); // 19 lines = level 2
      expect(result.leveledUp).toBe(false); // Was already level 3
    });

    it("should drop blocks correctly after line clear", () => {
      // Place a block above the line to be cleared
      board[17][5] = "O" as TetrominoType;

      // Fill bottom row
      for (let col = 0; col < 10; col++) {
        board[19][col] = "I" as TetrominoType;
      }

      const result = processLineClearing(board, 1, 0, 0);

      // The O block should have dropped down one row
      expect(result.newBoard[18][5]).toBe("O");
      expect(result.newBoard[17][5]).toBeNull();
    });
  });

  describe("getLineClearName", () => {
    it("should return correct names for line clears", () => {
      expect(getLineClearName(1)).toBe("Single");
      expect(getLineClearName(2)).toBe("Double");
      expect(getLineClearName(3)).toBe("Triple");
      expect(getLineClearName(4)).toBe("Tetris");
    });

    it("should return empty string for invalid counts", () => {
      expect(getLineClearName(0)).toBe("");
      expect(getLineClearName(5)).toBe("");
      expect(getLineClearName(-1)).toBe("");
    });
  });

  describe("validateScoreCalculation", () => {
    it("should validate correct score calculations", () => {
      expect(validateScoreCalculation(1, 1, 100)).toBe(true);
      expect(validateScoreCalculation(2, 3, 900)).toBe(true);
      expect(validateScoreCalculation(4, 5, 4000)).toBe(true);
    });

    it("should reject incorrect score calculations", () => {
      expect(validateScoreCalculation(1, 1, 200)).toBe(false);
      expect(validateScoreCalculation(2, 3, 800)).toBe(false);
      expect(validateScoreCalculation(4, 5, 3000)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(validateScoreCalculation(0, 1, 0)).toBe(true);
      expect(validateScoreCalculation(5, 1, 0)).toBe(true);
      expect(validateScoreCalculation(1, 0, 0)).toBe(true);
    });
  });

  describe("Integration tests", () => {
    it("should maintain scoring consistency across functions", () => {
      const linesCleared = 3;
      const level = 4;

      const directScore = calculateLineScore(linesCleared, level);
      const isValid = validateScoreCalculation(linesCleared, level, directScore);
      const name = getLineClearName(linesCleared);

      expect(isValid).toBe(true);
      expect(name).toBe("Triple");
      expect(directScore).toBe(2000);
    });

    it("should handle complete game progression scenario", () => {
      let currentLevel = 1;
      let currentScore = 0;
      let totalLines = 0;

      // Simulate clearing 25 lines in various combinations
      const clears = [1, 2, 4, 3, 1, 2, 4, 1, 3, 4]; // Total: 25 lines

      for (const lines of clears) {
        const scoreGained = calculateLineScore(lines, currentLevel);
        currentScore += scoreGained;
        totalLines += lines;
        currentLevel = calculateLevel(totalLines);
      }

      expect(totalLines).toBe(25);
      expect(currentLevel).toBe(3); // 25 lines = level 3
      expect(currentScore).toBeGreaterThan(0);

      // Verify final drop speed is faster than initial
      const finalSpeed = calculateDropSpeed(currentLevel);
      const initialSpeed = calculateDropSpeed(1);
      expect(finalSpeed).toBeLessThan(initialSpeed);
    });
  });
});
