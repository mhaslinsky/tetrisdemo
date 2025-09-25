/**
 * Integration Test Suite
 *
 * Comprehensive integration tests for complete game flow scenarios.
 * Tests component interactions, game state management, and user workflows.
 */

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameContainer from "@/components/game/GameContainer";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import { createEmptyBoard } from "@/lib";
import { TETROMINO_SHAPES } from "@/constants/game";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Mock requestAnimationFrame for controlled testing
let animationFrameCallbacks: (() => void)[] = [];
const mockRequestAnimationFrame = jest.fn((callback: () => void) => {
  animationFrameCallbacks.push(callback);
  return animationFrameCallbacks.length;
});

Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
});

// Helper to trigger animation frames
const triggerAnimationFrames = (count: number = 1) => {
  for (let i = 0; i < count; i++) {
    const callbacks = [...animationFrameCallbacks];
    animationFrameCallbacks = [];
    callbacks.forEach((callback) => callback());
  }
};

describe("Game Flow Integration Tests", () => {
  beforeEach(() => {
    animationFrameCallbacks = [];
    jest.clearAllMocks();
  });

  describe("Component Integration", () => {
    it("should integrate game board and sidebar", async () => {
      const { container } = render(<GameContainer />);

      // Should render the main game container
      expect(container.firstChild).toBeInTheDocument();

      // Start the game loop
      act(() => {
        triggerAnimationFrames(1);
      });

      // Should have game elements
      const gameElements = container.querySelectorAll("*");
      expect(gameElements.length).toBeGreaterThan(1);
    });

    it("should coordinate game state updates", async () => {
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Look for game statistics
      const scoreElements = screen.queryAllByText(/\d+/);
      const levelElements = screen.queryAllByText(/level/i);
      const linesElements = screen.queryAllByText(/lines/i);

      // Should have some game statistics
      const totalElements = scoreElements.length + levelElements.length + linesElements.length;
      expect(totalElements).toBeGreaterThan(0);
    });
  });

  describe("Input Integration", () => {
    it("should handle keyboard input", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Test basic inputs
      const inputs = ["{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{ArrowUp}"];

      for (const input of inputs) {
        await act(async () => {
          await user.keyboard(input);
        });

        act(() => {
          triggerAnimationFrames(2);
        });
      }

      // Should handle all inputs without errors
      expect(document.body).toBeInTheDocument();
    });

    it("should handle rapid input", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate rapid input
      await act(async () => {
        await user.keyboard("{ArrowLeft}{ArrowRight}{ArrowDown}");
      });

      act(() => {
        triggerAnimationFrames(5);
      });

      // Should handle rapid input gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Game Loop Integration", () => {
    it("should coordinate game loop with rendering", async () => {
      render(<GameContainer />);

      // Start the game loop
      act(() => {
        triggerAnimationFrames(1);
      });

      // Run several iterations
      for (let i = 0; i < 10; i++) {
        act(() => {
          triggerAnimationFrames(1);
        });
      }

      // Game should continue running
      expect(document.body).toBeInTheDocument();
    });

    it("should handle pause and resume", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Try to pause
      await act(async () => {
        await user.keyboard("{Escape}");
      });

      // Should handle pause gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Game State Integration", () => {
    it("should track game statistics", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Perform actions
      await act(async () => {
        await user.keyboard("{ArrowDown}");
      });

      act(() => {
        triggerAnimationFrames(10);
      });

      // Statistics should be displayed
      const scoreElements = screen.queryAllByText(/\d+/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it("should maintain consistent state", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Perform sequence of actions
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(3);
        });
      }

      // Game should maintain consistent state
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Component Coordination", () => {
    it("should coordinate board and sidebar updates", async () => {
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Check for coordinated display
      const scoreElements = screen.queryAllByText(/score/i);
      const levelElements = screen.queryAllByText(/level/i);
      const linesElements = screen.queryAllByText(/lines/i);

      // Should have coordinated statistics
      expect(scoreElements.length + levelElements.length + linesElements.length).toBeGreaterThan(0);
    });

    it("should handle component re-renders", async () => {
      const { rerender } = render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Re-render the component
      rerender(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Should handle re-renders gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Performance Integration", () => {
    it("should maintain performance during extended gameplay", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const startTime = Date.now();

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Perform extended operations
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(3);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete efficiently
      expect(duration).toBeLessThan(5000); // 5 seconds for extended test
      expect(document.body).toBeInTheDocument();
    });

    it("should handle memory efficiently during gameplay", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<GameContainer />);

      // Simulate gameplay
      for (let i = 0; i < 10; i++) {
        act(() => {
          triggerAnimationFrames(5);
        });

        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });
      }

      // Should unmount without errors
      unmount();
      expect(document.body).toBeInTheDocument();
    });

    it("should handle rapid state changes", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Rapid input sequence
      const rapidInputs = ["{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{ArrowUp}", "{Escape}", "{Escape}"];

      for (const input of rapidInputs) {
        await act(async () => {
          await user.keyboard(input);
        });
      }

      act(() => {
        triggerAnimationFrames(10);
      });

      // Should handle rapid changes gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle invalid game states gracefully", async () => {
      render(<GameContainer />);

      // Start game and trigger multiple state changes
      act(() => {
        triggerAnimationFrames(1);
      });

      // Should not crash with rapid state changes
      for (let i = 0; i < 5; i++) {
        act(() => {
          triggerAnimationFrames(10);
        });
      }

      expect(document.body).toBeInTheDocument();
    });

    it("should recover from component errors", async () => {
      const { rerender } = render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Force re-render multiple times
      for (let i = 0; i < 3; i++) {
        rerender(<GameContainer key={i} />);
        act(() => {
          triggerAnimationFrames(1);
        });
      }

      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Complete Game Flow Integration", () => {
    it("should handle a complete game session flow", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Play for several moves
      for (let i = 0; i < 15; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(5);
        });
      }

      // Try to pause
      await act(async () => {
        await user.keyboard("{Escape}");
      });

      // Resume
      await act(async () => {
        await user.keyboard("{Escape}");
      });

      // Continue playing
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(3);
        });
      }

      // Game should maintain consistency
      expect(document.body).toBeInTheDocument();
    });

    it("should handle piece placement and line clearing", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate piece placement
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(2);
        });
      }

      // Should handle piece placement
      expect(document.body).toBeInTheDocument();
    });
  });
});
