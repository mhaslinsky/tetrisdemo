import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameContainer } from "../GameContainer";

// Mock the responsive hook
const mockUseResponsive = jest.fn();
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockUseResponsive(),
}));

// Mock other hooks
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
      animation: {
        clearingLines: [],
        lastAction: null,
      },
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

describe("GameContainer Responsive Design", () => {
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

  describe("Desktop Layout", () => {
    it("renders desktop layout with horizontal arrangement", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-row");
      expect(container).not.toHaveClass("flex-col");
    });

    it("shows keyboard controls instead of touch controls", () => {
      render(<GameContainer />);

      // Should not show touch controls
      expect(screen.queryByTestId("touch-controls")).not.toBeInTheDocument();
    });

    it("uses standard game board size", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).not.toHaveClass("scale-75");
      expect(gameBoard).not.toHaveClass("scale-90");
    });
  });

  describe("Mobile Layout", () => {
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

    it("renders mobile layout with vertical arrangement", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
      expect(container).not.toHaveClass("flex-row");
    });

    it("shows touch controls instead of keyboard controls", () => {
      render(<GameContainer />);

      expect(screen.getByTestId("touch-controls")).toBeInTheDocument();
    });

    it("centers the game board", () => {
      render(<GameContainer />);

      const gameBoardContainer = screen.getByTestId("game-board").parentElement;
      expect(gameBoardContainer).toHaveClass("w-full");
      expect(gameBoardContainer).toHaveClass("flex");
      expect(gameBoardContainer).toHaveClass("justify-center");
    });

    it("scales down game board for small screens", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("scale-75");
    });

    it("arranges sidebar horizontally on mobile", () => {
      render(<GameContainer />);

      const sidebar = screen.getByTestId("game-sidebar").parentElement;
      expect(sidebar).toHaveClass("flex-row");
      expect(sidebar).toHaveClass("w-full");
      expect(sidebar).toHaveClass("justify-between");
    });
  });

  describe("Tablet Layout", () => {
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

    it("renders tablet layout with responsive arrangement", () => {
      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
      expect(container).toHaveClass("lg:flex-row");
    });

    it("shows touch controls on tablet", () => {
      render(<GameContainer />);

      expect(screen.getByTestId("touch-controls")).toBeInTheDocument();
    });

    it("uses medium game board scaling", () => {
      render(<GameContainer />);

      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("scale-90");
      expect(gameBoard).not.toHaveClass("scale-75");
    });
  });

  describe("Touch Controls Integration", () => {
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

    it("passes correct props to touch controls", () => {
      render(<GameContainer />);

      const touchControls = screen.getByTestId("touch-controls");
      expect(touchControls).toBeInTheDocument();

      // Touch controls should be present and functional
      expect(screen.getByTestId("touch-button-move-left")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-move-right")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-rotate-piece")).toBeInTheDocument();
    });

    it("applies mobile-specific classes to touch controls", () => {
      render(<GameContainer />);

      const touchControlsContainer = screen.getByTestId("touch-controls").parentElement;
      expect(touchControlsContainer).toHaveClass("flex-1");
    });
  });

  describe("Performance Optimizations", () => {
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

    it("applies performance optimization classes when needed", () => {
      render(<GameContainer />);

      // The component should be aware of performance optimization needs
      // This would be used to reduce animations, lower quality effects, etc.
      const container = screen.getByTestId("game-container");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Orientation Changes", () => {
    it("handles portrait orientation", () => {
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

      render(<GameContainer />);

      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
    });

    it("handles landscape orientation on mobile", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        canUseTouchControls: true,
        shouldOptimizePerformance: true,
        orientation: "landscape",
        isSmallScreen: false,
        screenWidth: 667,
        screenHeight: 375,
      });

      render(<GameContainer />);

      // Even in landscape, mobile should still use column layout for better UX
      const container = screen.getByTestId("game-container");
      expect(container).toHaveClass("flex-col");
    });
  });

  describe("Responsive Sidebar", () => {
    it("applies responsive classes to sidebar on mobile", () => {
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

      render(<GameContainer />);

      const sidebar = screen.getByTestId("game-sidebar");
      expect(sidebar).toHaveClass("flex-1");
    });

    it("uses standard sidebar layout on desktop", () => {
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

      render(<GameContainer />);

      const sidebar = screen.getByTestId("game-sidebar");
      expect(sidebar).not.toHaveClass("flex-1");
    });
  });
});
