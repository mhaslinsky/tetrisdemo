import React from "react";
import { render, screen } from "@testing-library/react";
import { GameContainer } from "../GameContainer";

// Mock the responsive hook with different scenarios
const mockUseResponsive = jest.fn();
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockUseResponsive(),
}));

// Mock other hooks with minimal implementations
jest.mock("@/hooks/useGameState", () => ({
  useGameState: () => ({
    gameState: {
      board: Array(20)
        .fill(null)
        .map(() => Array(10).fill(null)),
      currentPiece: null,
      nextPiece: { type: "I", shape: [[true, true, true, true]], position: { x: 0, y: 0 }, rotation: 0 },
      heldPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      linesCleared: 0,
      gameStatus: "ready" as const,
      dropTimer: 0,
      lastDropTime: 0,
      animation: { clearingLines: [], lastAction: null },
    },
    dispatch: jest.fn(),
    isGameActive: false,
    canMovePiece: false,
    moveLeft: jest.fn(),
    moveRight: jest.fn(),
    moveDown: jest.fn(),
    rotate: jest.fn(),
    hardDrop: jest.fn(),
    holdPiece: jest.fn(),
    pauseGame: jest.fn(),
    resumeGame: jest.fn(),
    restartGame: jest.fn(),
    gameTick: jest.fn(),
    lockPiece: jest.fn(),
    spawnPiece: jest.fn(),
  }),
}));

jest.mock("@/hooks/useGameLoop", () => ({
  useGameLoop: () => ({
    startGameLoop: jest.fn(),
    stopGameLoop: jest.fn(),
    isRunning: false,
  }),
}));

jest.mock("@/hooks/useKeyboardInput", () => ({
  useKeyboardInput: () => ({
    isKeyPressed: jest.fn(),
    isActionPressed: jest.fn(),
  }),
}));

jest.mock("@/hooks/useAccessibility", () => ({
  useAccessibility: () => ({
    announceToScreenReader: jest.fn(),
    setFocusToElement: jest.fn(),
    getGameStateDescription: () => "Game ready to start",
    getControlsDescription: () => "Use arrow keys to control pieces",
  }),
}));

describe("Responsive Integration", () => {
  describe("Mobile Device", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        canUseTouchControls: true,
        shouldOptimizePerformance: true,
        orientation: "portrait",
        isSmallScreen: true,
        screenWidth: 375,
        screenHeight: 667,
      });
    });

    it("renders touch controls on mobile", () => {
      render(<GameContainer />);

      expect(screen.getByTestId("touch-controls")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /pause/i })).toBeInTheDocument();
    });

    it("uses mobile layout classes", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
    });
  });

  describe("Desktop Device", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        canUseTouchControls: false,
        shouldOptimizePerformance: false,
        orientation: "landscape",
        isSmallScreen: false,
        screenWidth: 1024,
        screenHeight: 768,
      });
    });

    it("does not render touch controls on desktop", () => {
      render(<GameContainer />);

      expect(screen.queryByTestId("touch-controls")).not.toBeInTheDocument();
    });

    it("uses desktop layout classes", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-row");
    });
  });

  describe("Tablet Device", () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        canUseTouchControls: true,
        shouldOptimizePerformance: false,
        orientation: "landscape",
        isSmallScreen: false,
        screenWidth: 768,
        screenHeight: 1024,
      });
    });

    it("renders touch controls on tablet", () => {
      render(<GameContainer />);

      expect(screen.getByTestId("touch-controls")).toBeInTheDocument();
    });

    it("uses responsive tablet layout", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
      expect(container).toHaveClass("lg:flex-row");
    });
  });
});
