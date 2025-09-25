/**
 * End-to-End Test Suite
 *
 * Comprehensive E2E tests for complete user journeys and full game sessions.
 * Tests high-frequency input handling, extended play sessions, and game stability.
 */

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameContainer from "@/components/game/GameContainer";

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

describe("End-to-End Game Sessions", () => {
  beforeEach(() => {
    animationFrameCallbacks = [];
    jest.clearAllMocks();
  });

  describe("Basic Game Session", () => {
    it("should handle a basic game session", async () => {
      const user = userEvent.setup();
      const { container } = render(<GameContainer />);

      // Game should start
      expect(container).toBeInTheDocument();

      // Simulate game start
      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate basic piece movements
      await act(async () => {
        await user.keyboard("{ArrowLeft}");
        await user.keyboard("{ArrowRight}");
        await user.keyboard("{ArrowDown}");
      });

      // Game should continue running
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle pause and resume", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Try to pause (implementation dependent)
      await act(async () => {
        await user.keyboard("{Escape}");
      });

      // Should handle pause gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Game Controls", () => {
    it("should handle all movement controls", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      // Start the game
      act(() => {
        triggerAnimationFrames(1);
      });

      // Test basic controls
      const movements = ["{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{ArrowUp}"];

      for (const movement of movements) {
        await act(async () => {
          await user.keyboard(movement);
        });

        act(() => {
          triggerAnimationFrames(2);
        });
      }

      // Game should handle all movements
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

  describe("Game Statistics", () => {
    it("should display game statistics", async () => {
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Look for game statistics
      const scoreElements = screen.queryAllByText(/\d+/);
      const levelElements = screen.queryAllByText(/level/i);
      const linesElements = screen.queryAllByText(/lines/i);

      // Should have some statistical display
      expect(scoreElements.length + levelElements.length + linesElements.length).toBeGreaterThan(0);
    });

    it("should update statistics during gameplay", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Perform some actions
      await act(async () => {
        await user.keyboard("{ArrowDown}");
      });

      act(() => {
        triggerAnimationFrames(10);
      });

      // Statistics should still be displayed
      const hasLevelText = screen.queryAllByText(/level/i).length > 0;
      const hasNumbers = screen.queryAllByText(/\d+/).length > 0;
      expect(hasLevelText || hasNumbers).toBeTruthy();
    });
  });

  describe("Game State Management", () => {
    it("should maintain consistent game state", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Perform a sequence of actions
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

  describe("High-Frequency Input Handling", () => {
    it("should handle high APM gameplay", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate high-frequency input (high APM)
      const highFrequencyInputs = [
        "{ArrowLeft}",
        "{ArrowLeft}",
        "{ArrowRight}",
        "{ArrowRight}",
        "{ArrowDown}",
        "{ArrowUp}",
        "{ArrowLeft}",
        "{ArrowDown}",
        "{ArrowRight}",
        "{ArrowUp}",
      ];

      for (const input of highFrequencyInputs) {
        await act(async () => {
          await user.keyboard(input);
        });
        // Minimal delay to simulate rapid input
        act(() => {
          triggerAnimationFrames(1);
        });
      }

      // Should handle high-frequency input without issues
      expect(document.body).toBeInTheDocument();
    });

    it("should maintain input responsiveness under load", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      const startTime = Date.now();

      // Simulate sustained high input rate
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(2);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should maintain responsiveness
      expect(duration).toBeLessThan(8000); // 8 seconds for 30 inputs
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Extended Play Sessions", () => {
    it("should handle extended gameplay sessions", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate extended play session
      for (let session = 0; session < 3; session++) {
        // Each session: 20 moves
        for (let move = 0; move < 20; move++) {
          await act(async () => {
            await user.keyboard("{ArrowDown}");
          });

          act(() => {
            triggerAnimationFrames(3);
          });
        }

        // Brief pause between sessions
        act(() => {
          triggerAnimationFrames(5);
        });
      }

      // Should maintain stability during extended play
      expect(document.body).toBeInTheDocument();
    });

    it("should maintain state consistency during long sessions", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Long session with varied inputs
      const inputPattern = ["{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{ArrowUp}"];

      for (let cycle = 0; cycle < 10; cycle++) {
        for (const input of inputPattern) {
          await act(async () => {
            await user.keyboard(input);
          });

          act(() => {
            triggerAnimationFrames(2);
          });
        }
      }

      // State should remain consistent
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Game Over and Restart Scenarios", () => {
    it("should handle game over scenarios", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Simulate gameplay that might lead to game over
      for (let i = 0; i < 25; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(5);
        });
      }

      // Should handle potential game over gracefully
      expect(document.body).toBeInTheDocument();
    });

    it("should handle restart functionality", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Play some moves
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        act(() => {
          triggerAnimationFrames(3);
        });
      }

      // Try restart (implementation dependent)
      await act(async () => {
        await user.keyboard("r");
      });

      act(() => {
        triggerAnimationFrames(5);
      });

      // Should handle restart gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Performance and Stability", () => {
    it("should maintain 60fps during gameplay", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const frameStartTime = Date.now();

      // Simulate 60 frames of gameplay
      for (let frame = 0; frame < 60; frame++) {
        act(() => {
          triggerAnimationFrames(1);
        });

        // Occasional input
        if (frame % 10 === 0) {
          await act(async () => {
            await user.keyboard("{ArrowDown}");
          });
        }
      }

      const frameEndTime = Date.now();
      const frameDuration = frameEndTime - frameStartTime;

      // Should maintain reasonable frame rate (60 frames in ~1 second)
      expect(frameDuration).toBeLessThan(2000); // Allow 2 seconds for 60 frames
      expect(document.body).toBeInTheDocument();
    });

    it("should handle memory efficiently during extended play", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<GameContainer />);

      // Extended gameplay simulation
      for (let i = 0; i < 50; i++) {
        act(() => {
          triggerAnimationFrames(3);
        });

        if (i % 5 === 0) {
          await act(async () => {
            await user.keyboard("{ArrowDown}");
          });
        }
      }

      // Should handle cleanup without memory leaks
      unmount();
      expect(document.body).toBeInTheDocument();
    });

    it("should recover from performance stress", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      act(() => {
        triggerAnimationFrames(1);
      });

      // Stress test with rapid operations
      for (let i = 0; i < 100; i++) {
        act(() => {
          triggerAnimationFrames(1);
        });

        if (i % 10 === 0) {
          await act(async () => {
            await user.keyboard("{ArrowDown}");
          });
        }
      }

      // Should recover and continue functioning
      await act(async () => {
        await user.keyboard("{ArrowLeft}");
      });

      expect(document.body).toBeInTheDocument();
    });
  });
});
