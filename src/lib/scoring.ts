import type { Board } from "@/types";
import { GAME_CONFIG } from "@/constants/game";
import { clearLines } from "./board";

/**
 * Scoring system for Tetris game
 * Handles all scoring calculations including line clears and drop bonuses
 */

/**
 * Calculates score based on lines cleared and current level
 * @param linesCleared - Number of lines cleared simultaneously (1-4)
 * @param level - Current game level
 * @returns Score points to add
 */
export function calculateLineScore(linesCleared: number, level: number): number {
  const { scoring } = GAME_CONFIG;

  switch (linesCleared) {
    case 1:
      return scoring.single * level;
    case 2:
      return scoring.double * level;
    case 3:
      return scoring.triple * level;
    case 4:
      return scoring.tetris * level;
    default:
      return 0;
  }
}

/**
 * Calculates the new level based on total lines cleared
 * @param totalLinesCleared - Total lines cleared in the game
 * @returns New level (starts at 1)
 */
export function calculateLevel(totalLinesCleared: number): number {
  return Math.floor(totalLinesCleared / GAME_CONFIG.levelUpLines) + 1;
}

/**
 * Calculates drop speed based on current level
 * @param level - Current game level
 * @returns Drop speed in milliseconds
 */
export function calculateDropSpeed(level: number): number {
  const baseSpeed = GAME_CONFIG.dropSpeed;
  const speedReduction = Math.pow(0.8, level - 1); // Each level is 20% faster
  return Math.max(50, Math.floor(baseSpeed * speedReduction)); // Minimum 50ms
}

/**
 * Calculates soft drop score bonus
 * @param cellsDropped - Number of cells the piece dropped
 * @returns Score points to add
 */
export function calculateSoftDropScore(cellsDropped: number): number {
  return cellsDropped * GAME_CONFIG.scoring.softDrop;
}

/**
 * Calculates hard drop score bonus
 * @param cellsDropped - Number of cells the piece dropped
 * @returns Score points to add
 */
export function calculateHardDropScore(cellsDropped: number): number {
  return cellsDropped * GAME_CONFIG.scoring.hardDrop;
}

/**
 * Processes line clearing and returns updated board with scoring information
 * @param board - Current game board
 * @param currentLevel - Current game level
 * @param currentScore - Current game score
 * @param currentLinesCleared - Current total lines cleared
 * @returns Object with updated board, score, level, and lines cleared
 */
export function processLineClearing(
  board: Board,
  currentLevel: number,
  currentScore: number,
  currentLinesCleared: number
): {
  newBoard: Board;
  linesCleared: number;
  clearedLineIndices: number[];
  scoreGained: number;
  newScore: number;
  newLevel: number;
  newTotalLines: number;
  leveledUp: boolean;
} {
  const { newBoard, linesCleared, clearedLineIndices } = clearLines(board);

  if (linesCleared === 0) {
    return {
      newBoard: board,
      linesCleared: 0,
      clearedLineIndices: [],
      scoreGained: 0,
      newScore: currentScore,
      newLevel: currentLevel,
      newTotalLines: currentLinesCleared,
      leveledUp: false,
    };
  }

  const scoreGained = calculateLineScore(linesCleared, currentLevel);
  const newScore = currentScore + scoreGained;
  const newTotalLines = currentLinesCleared + linesCleared;
  const newLevel = calculateLevel(newTotalLines);
  const leveledUp = newLevel > currentLevel;

  return {
    newBoard,
    linesCleared,
    clearedLineIndices,
    scoreGained,
    newScore,
    newLevel,
    newTotalLines,
    leveledUp,
  };
}

/**
 * Gets scoring multiplier names for display purposes
 * @param linesCleared - Number of lines cleared
 * @returns Human-readable name for the scoring action
 */
export function getLineClearName(linesCleared: number): string {
  switch (linesCleared) {
    case 1:
      return "Single";
    case 2:
      return "Double";
    case 3:
      return "Triple";
    case 4:
      return "Tetris";
    default:
      return "";
  }
}

/**
 * Validates if a score calculation is correct
 * @param linesCleared - Number of lines cleared
 * @param level - Game level
 * @param expectedScore - Expected score result
 * @returns true if the calculation is correct
 */
export function validateScoreCalculation(linesCleared: number, level: number, expectedScore: number): boolean {
  return calculateLineScore(linesCleared, level) === expectedScore;
}
