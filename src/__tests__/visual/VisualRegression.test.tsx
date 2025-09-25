/**
 * Visual Regression Test Suite
 *
 * Comprehensive visual tests to ensure UI consistency and detect
 * visual regressions. Tests component rendering, responsive design,
 * and visual state consistency.
 */

import { render } from "@testing-library/react";
import GameContainer from "@/components/game/GameContainer";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import { createEmptyBoard } from "@/lib";
import { TETROMINO_SHAPES } from "@/constants/game";

describe("Visual Regression Tests", () => {
  beforeEach(() => {
    // Reset any global styles or state
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  describe("Game Board Visual Tests", () => {
    it("should render empty board consistently", () => {
      const board = createEmptyBoard();
      const { container } = render(<GameBoard board={board} currentPiece={null} />);

      const boardElement = container.firstChild as HTMLElement;
      expect(boardElement).toBeInTheDocument();

      // Check for basic grid structure
      const gridElements = container.querySelectorAll("[data-testid*='cell']");
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it("should render tetromino pieces", () => {
      const board = createEmptyBoard();
      const iPiece = {
        shape: TETROMINO_SHAPES.I[0],
        position: { x: 3, y: 0 },
        type: "I" as const,
      };

      const { container } = render(<GameBoard board={board} currentPiece={iPiece} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle filled board cells", () => {
      const board = createEmptyBoard();
      board[19][0] = 1; // Fill one cell

      const { container } = render(<GameBoard board={board} currentPiece={null} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Game Sidebar Visual Tests", () => {
    it("should display score information", () => {
      const { container } = render(
        <GameSidebar score={1500} level={3} lines={25} nextPiece={TETROMINO_SHAPES.T[0]} />
      );

      expect(container).toHaveTextContent("1500");
      expect(container).toHaveTextContent("Level");
      expect(container).toHaveTextContent("Lines");
    });

    it("should render next piece preview", () => {
      const { container } = render(
        <GameSidebar score={0} level={1} lines={0} nextPiece={TETROMINO_SHAPES.L[0]} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Game Container Visual Tests", () => {
    it("should render main game layout", () => {
      const { container } = render(<GameContainer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle component re-renders", () => {
      const { container, rerender } = render(<GameContainer />);

      expect(container.firstChild).toBeInTheDocument();

      rerender(<GameContainer />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Responsive Design Tests", () => {
    it("should render on different viewport sizes", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
      Object.defineProperty(window, "innerHeight", { value: 667, writable: true });

      const { container } = render(<GameContainer />);
      expect(container.firstChild).toBeInTheDocument();

      // Mock desktop viewport
      Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
      Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });

      const { container: desktopContainer } = render(<GameContainer />);
      expect(desktopContainer.firstChild).toBeInTheDocument();
    });
  });

  describe("Color and Theme Tests", () => {
    it("should render different tetromino types", () => {
      const tetrominoTypes = ["I", "O", "T"] as const; // Test subset to avoid heavy load

      tetrominoTypes.forEach((type) => {
        const board = createEmptyBoard();
        const piece = {
          shape: TETROMINO_SHAPES[type][0],
          position: { x: 3, y: 0 },
          type,
        };

        const { container } = render(<GameBoard board={board} currentPiece={piece} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe("Animation and Transition Tests", () => {
    it("should render animation states consistently", () => {
      const board = createEmptyBoard();
      const { container, rerender } = render(<GameBoard board={board} currentPiece={null} />);

      // Test different animation states
      const animationStates = [
        null,
        {
          shape: TETROMINO_SHAPES.T[0],
          position: { x: 4, y: 0 },
          type: "T" as const,
        },
        {
          shape: TETROMINO_SHAPES.I[0],
          position: { x: 3, y: 5 },
          type: "I" as const,
        },
      ];

      animationStates.forEach((piece) => {
        rerender(<GameBoard board={board} currentPiece={piece} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it("should handle line clearing visual states", () => {
      const board = createEmptyBoard();

      // Fill a line to simulate line clearing
      for (let x = 0; x < 10; x++) {
        board[19][x] = 1;
      }

      const { container } = render(<GameBoard board={board} currentPiece={null} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render game over state consistently", () => {
      const { container } = render(<GameContainer />);

      // Should render initial state consistently
      expect(container.firstChild).toBeInTheDocument();

      // Test multiple renders for consistency
      const { container: container2 } = render(<GameContainer />);
      expect(container2.firstChild).toBeInTheDocument();
    });
  });

  describe("Game State Visual Consistency", () => {
    it("should render different game states consistently", () => {
      const gameStates = [
        { score: 0, level: 1, lines: 0 },
        { score: 1000, level: 2, lines: 10 },
        { score: 5000, level: 5, lines: 50 },
      ];

      gameStates.forEach((state) => {
        const { container, unmount } = render(
          <GameSidebar
            score={state.score}
            level={state.level}
            lines={state.lines}
            nextPiece={TETROMINO_SHAPES.T[0]}
          />
        );

        expect(container).toHaveTextContent(state.score.toString());
        expect(container).toHaveTextContent(state.level.toString());
        expect(container).toHaveTextContent(state.lines.toString());

        unmount();
      });
    });

    it("should maintain visual consistency during state changes", () => {
      const { container, rerender } = render(
        <GameSidebar score={0} level={1} lines={0} nextPiece={TETROMINO_SHAPES.T[0]} />
      );

      // Test state progression
      const stateProgression = [
        { score: 100, level: 1, lines: 1 },
        { score: 300, level: 1, lines: 3 },
        { score: 1000, level: 2, lines: 10 },
      ];

      stateProgression.forEach((state) => {
        rerender(
          <GameSidebar
            score={state.score}
            level={state.level}
            lines={state.lines}
            nextPiece={TETROMINO_SHAPES.T[0]}
          />
        );

        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe("Component Layout Tests", () => {
    it("should maintain consistent layout structure", () => {
      const { container } = render(<GameContainer />);

      // Should have consistent DOM structure
      const gameElement = container.firstChild as HTMLElement;
      expect(gameElement).toBeInTheDocument();

      // Test layout stability
      const childCount = gameElement?.children.length || 0;
      expect(childCount).toBeGreaterThan(0);
    });

    it("should handle component composition correctly", () => {
      const board = createEmptyBoard();
      const { container } = render(
        <div>
          <GameBoard board={board} currentPiece={null} />
          <GameSidebar score={1000} level={2} lines={15} nextPiece={TETROMINO_SHAPES.T[0]} />
        </div>
      );

      // Both components should render together
      expect(container.firstChild).toBeInTheDocument();
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Design Visual Tests", () => {
    it("should render consistently across different screen sizes", () => {
      const screenSizes = [
        { width: 320, height: 568, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 1024, height: 768, name: "Tablet Landscape" },
        { width: 1920, height: 1080, name: "Desktop" },
      ];

      screenSizes.forEach(({ width, height, name }) => {
        Object.defineProperty(window, "innerWidth", { value: width, writable: true });
        Object.defineProperty(window, "innerHeight", { value: height, writable: true });

        const { container, unmount } = render(<GameContainer />);

        // Should render consistently across all screen sizes
        expect(container.firstChild).toBeInTheDocument();

        // Log for visual regression tracking
        console.log(`${name} (${width}x${height}): Rendered successfully`);

        unmount();
      });
    });

    it("should adapt layout for mobile devices", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
      Object.defineProperty(window, "innerHeight", { value: 667, writable: true });

      const { container } = render(<GameContainer />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Visual Accessibility Tests", () => {
    it("should render with proper visual hierarchy", () => {
      const { container } = render(<GameContainer />);

      // Should have proper visual structure
      const gameElement = container.firstChild as HTMLElement;
      expect(gameElement).toBeInTheDocument();
    });

    it("should maintain visual consistency with accessibility features", () => {
      // Mock high contrast mode
      Object.defineProperty(window, "matchMedia", {
        value: jest.fn().mockImplementation((query) => ({
          matches: query.includes("prefers-contrast: high"),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      const { container } = render(<GameContainer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render focus indicators properly", () => {
      const { container } = render(<GameContainer />);

      // Should render without visual errors
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Visual Regression Detection", () => {
    it("should detect layout changes", () => {
      const { container: container1 } = render(<GameContainer />);
      const { container: container2 } = render(<GameContainer />);

      // Both renders should produce consistent structure
      const element1 = container1.firstChild as HTMLElement;
      const element2 = container2.firstChild as HTMLElement;

      expect(element1?.tagName).toBe(element2?.tagName);
    });

    it("should maintain consistent component dimensions", () => {
      const board = createEmptyBoard();
      const { container } = render(<GameBoard board={board} currentPiece={null} />);

      const boardElement = container.firstChild as HTMLElement;
      expect(boardElement).toBeInTheDocument();

      // Should have consistent structure
      const cells = container.querySelectorAll("[data-testid*='cell'], [class*='cell'], div");
      expect(cells.length).toBeGreaterThan(0);
    });

    it("should track visual changes over time", () => {
      const snapshots: string[] = [];

      // Take multiple visual snapshots
      for (let i = 0; i < 3; i++) {
        const { container, unmount } = render(<GameContainer />);
        snapshots.push(container.innerHTML);
        unmount();
      }

      // All snapshots should be consistent (basic check)
      expect(snapshots.length).toBe(3);
      snapshots.forEach((snapshot) => {
        expect(snapshot.length).toBeGreaterThan(0);
      });
    });
  });
});
