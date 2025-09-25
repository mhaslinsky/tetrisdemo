import { useEffect, useRef, useCallback } from "react";
import type { GameState, GameStatus } from "@/types";

interface UseAccessibilityOptions {
  announceGameStateChanges?: boolean;
  announceScoreChanges?: boolean;
  announceLevelChanges?: boolean;
  announceLineClears?: boolean;
  announcePieceActions?: boolean;
}

export interface UseAccessibilityReturn {
  announceToScreenReader: (message: string, priority?: "polite" | "assertive") => void;
  setFocusToElement: (elementId: string) => void;
  getGameStateDescription: () => string;
  getControlsDescription: () => string;
}

/**
 * Custom hook for managing accessibility features in the Tetris game
 * Provides screen reader announcements and focus management
 */
export const useAccessibility = (
  gameState: GameState,
  options: UseAccessibilityOptions = {}
): UseAccessibilityReturn => {
  const {
    announceGameStateChanges = true,
    announceScoreChanges = true,
    announceLevelChanges = true,
    announceLineClears = true,
    announcePieceActions = true,
  } = options;

  // Refs to track previous values for change detection
  const prevGameStatusRef = useRef<GameStatus>(gameState.gameStatus);
  const prevScoreRef = useRef<number>(gameState.score);
  const prevLevelRef = useRef<number>(gameState.level);
  const prevLinesRef = useRef<number>(gameState.linesCleared);
  const prevClearingLinesRef = useRef<number[]>([]);

  // Create live region elements for screen reader announcements
  const politeAnnouncerRef = useRef<HTMLDivElement | null>(null);
  const assertiveAnnouncerRef = useRef<HTMLDivElement | null>(null);

  // Initialize live regions
  useEffect(() => {
    // Create polite announcer
    if (!politeAnnouncerRef.current) {
      const politeDiv = document.createElement("div");
      politeDiv.setAttribute("aria-live", "polite");
      politeDiv.setAttribute("aria-atomic", "true");
      politeDiv.setAttribute("class", "sr-only");
      politeDiv.setAttribute("id", "tetris-polite-announcer");
      document.body.appendChild(politeDiv);
      politeAnnouncerRef.current = politeDiv;
    }

    // Create assertive announcer
    if (!assertiveAnnouncerRef.current) {
      const assertiveDiv = document.createElement("div");
      assertiveDiv.setAttribute("aria-live", "assertive");
      assertiveDiv.setAttribute("aria-atomic", "true");
      assertiveDiv.setAttribute("class", "sr-only");
      assertiveDiv.setAttribute("id", "tetris-assertive-announcer");
      document.body.appendChild(assertiveDiv);
      assertiveAnnouncerRef.current = assertiveDiv;
    }

    // Cleanup on unmount
    return () => {
      if (politeAnnouncerRef.current && document.body.contains(politeAnnouncerRef.current)) {
        document.body.removeChild(politeAnnouncerRef.current);
        politeAnnouncerRef.current = null;
      }
      if (assertiveAnnouncerRef.current && document.body.contains(assertiveAnnouncerRef.current)) {
        document.body.removeChild(assertiveAnnouncerRef.current);
        assertiveAnnouncerRef.current = null;
      }
    };
  }, []);

  // Function to announce messages to screen readers
  const announceToScreenReader = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = priority === "assertive" ? assertiveAnnouncerRef.current : politeAnnouncerRef.current;

    if (announcer) {
      // Clear previous message first
      announcer.textContent = "";

      // Set new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  }, []);

  // Function to set focus to a specific element
  const setFocusToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, []);

  // Function to get current game state description
  const getGameStateDescription = useCallback(() => {
    const { gameStatus, score, level, linesCleared, currentPiece } = gameState;

    let description = `Tetris game. Status: ${gameStatus}. `;
    description += `Score: ${score.toLocaleString()}. `;
    description += `Level: ${level}. `;
    description += `Lines cleared: ${linesCleared}. `;

    if (currentPiece) {
      description += `Current piece: ${currentPiece.type} piece at position ${currentPiece.position.x}, ${currentPiece.position.y}. `;
    }

    return description;
  }, [gameState]);

  // Function to get controls description
  const getControlsDescription = useCallback(() => {
    return "Use arrow keys to move pieces. Up arrow or space to rotate. Space for hard drop. C or Shift to hold piece. P or Escape to pause. R to restart.";
  }, []);

  // Announce game status changes
  useEffect(() => {
    if (announceGameStateChanges) {
      const prevStatus = prevGameStatusRef.current;
      const currentStatus = gameState.gameStatus;

      if (prevStatus !== currentStatus) {
        let message = "";

        switch (currentStatus) {
          case "ready":
            message = "Game ready. Press any key to start playing.";
            break;
          case "playing":
            message = "Game started. Use arrow keys to control pieces.";
            break;
          case "paused":
            message = "Game paused. Press P or Escape to resume.";
            break;
          case "gameOver":
            message = `Game over! Final score: ${gameState.score.toLocaleString()}. Level: ${
              gameState.level
            }. Lines cleared: ${gameState.linesCleared}.`;
            break;
        }

        if (message) {
          announceToScreenReader(message, "assertive");
        }
      }

      prevGameStatusRef.current = currentStatus;
    }
  }, [
    gameState.gameStatus,
    gameState.score,
    gameState.level,
    gameState.linesCleared,
    announceGameStateChanges,
    announceToScreenReader,
  ]);

  // Announce score changes
  useEffect(() => {
    if (announceScoreChanges) {
      const prevScore = prevScoreRef.current;
      const currentScore = gameState.score;

      if (prevScore !== currentScore && prevScore > 0) {
        const scoreDiff = currentScore - prevScore;
        announceToScreenReader(
          `Score increased by ${scoreDiff.toLocaleString()}. New score: ${currentScore.toLocaleString()}.`
        );
      }

      prevScoreRef.current = currentScore;
    }
  }, [gameState.score, announceScoreChanges, announceToScreenReader]);

  // Announce level changes
  useEffect(() => {
    if (announceLevelChanges) {
      const prevLevel = prevLevelRef.current;
      const currentLevel = gameState.level;

      if (prevLevel !== currentLevel && prevLevel > 0) {
        announceToScreenReader(`Level up! Now at level ${currentLevel}. Game speed increased.`, "assertive");
      }

      prevLevelRef.current = currentLevel;
    }
  }, [gameState.level, announceLevelChanges, announceToScreenReader]);

  // Announce line clears
  useEffect(() => {
    if (announceLineClears) {
      const prevLines = prevLinesRef.current;
      const currentLines = gameState.linesCleared;
      const clearingLines = gameState.animation.clearingLines;

      // Check if lines were just cleared
      if (clearingLines.length > 0 && prevClearingLinesRef.current.length === 0) {
        const linesCleared = clearingLines.length;
        let message = "";

        switch (linesCleared) {
          case 1:
            message = "Single line cleared!";
            break;
          case 2:
            message = "Double line clear!";
            break;
          case 3:
            message = "Triple line clear!";
            break;
          case 4:
            message = "Tetris! Four lines cleared!";
            break;
          default:
            message = `${linesCleared} lines cleared!`;
        }

        announceToScreenReader(message, "assertive");
      }

      prevLinesRef.current = currentLines;
      prevClearingLinesRef.current = [...clearingLines];
    }
  }, [gameState.linesCleared, gameState.animation.clearingLines, announceLineClears, announceToScreenReader]);

  return {
    announceToScreenReader,
    setFocusToElement,
    getGameStateDescription,
    getControlsDescription,
  };
};

export default useAccessibility;
