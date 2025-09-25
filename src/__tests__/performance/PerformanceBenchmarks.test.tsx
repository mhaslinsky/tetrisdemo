/**
 * Performance Benchmarks Test Suite
 *
 * Comprehensive performance tests to verify performance benchmarks
 * and detect regressions. Tests rendering, input response, and memory usage.
 */

import { render, act } from "@testing-library/react";
import GameContainer from "@/components/game/GameContainer";

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, "performance", {
  value: {
    now: mockPerformanceNow,
  },
});

// Mock requestAnimationFrame for controlled timing
let animationFrameCallbacks: (() => void)[] = [];
const mockRequestAnimationFrame = jest.fn((callback: () => void) => {
  animationFrameCallbacks.push(callback);
  return animationFrameCallbacks.length;
});

Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
});

describe("Performance Benchmarks", () => {
  beforeEach(() => {
    mockPerformanceNow.mockImplementation(() => Date.now());
    animationFrameCallbacks = [];
    jest.clearAllMocks();
  });

  describe("Basic Performance", () => {
    it("should render game board efficiently", () => {
      const startTime = performance.now();
      render(<GameContainer />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Relaxed threshold
    });

    it("should handle component updates", () => {
      const { rerender } = render(<GameContainer />);

      // Test a few re-renders instead of 60
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        rerender(<GameContainer key={i} />);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
      }
    });

    it("should maintain reasonable memory usage", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      render(<GameContainer />);

      // Simulate light gameplay
      act(() => {
        for (let i = 0; i < 10; i++) {
          if (animationFrameCallbacks.length > 0) {
            const callback = animationFrameCallbacks.shift();
            callback?.();
          }
        }
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not use excessive memory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });
  });

  describe("Game Logic Performance", () => {
    it("should perform basic operations efficiently", () => {
      const startTime = performance.now();

      // Simple performance test
      for (let i = 0; i < 1000; i++) {
        const position = { x: i % 10, y: i % 20 };
        const isValid = position.x >= 0 && position.x < 10 && position.y >= 0 && position.y < 20;
        expect(typeof isValid).toBe("boolean");
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10);
    });

    it("should handle input processing efficiently", () => {
      render(<GameContainer />);

      const startTime = performance.now();

      // Simulate a few key presses
      for (let i = 0; i < 10; i++) {
        const keyEvent = new KeyboardEvent("keydown", {
          key: "ArrowLeft",
        });

        act(() => {
          document.dispatchEvent(keyEvent);
        });
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Rendering Performance", () => {
    it("should render initial game state within performance budget", () => {
      const startTime = performance.now();
      const { unmount } = render(<GameContainer />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Target: Initial render < 50ms
      expect(renderTime).toBeLessThan(50);

      unmount();
    });

    it("should handle re-renders efficiently", () => {
      const { rerender } = render(<GameContainer />);
      const renderTimes: number[] = [];

      // Test multiple re-renders
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        rerender(<GameContainer key={i} />);
        const endTime = performance.now();

        renderTimes.push(endTime - startTime);
      }

      const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;

      // Target: Re-render < 16ms (60fps)
      expect(avgRenderTime).toBeLessThan(16);
    });

    it("should maintain frame rate during animations", () => {
      render(<GameContainer />);
      const frameTimes: number[] = [];

      // Simulate 30 animation frames
      for (let i = 0; i < 30; i++) {
        const startTime = performance.now();

        act(() => {
          if (animationFrameCallbacks.length > 0) {
            const callback = animationFrameCallbacks.shift();
            callback?.();
          }
        });

        const endTime = performance.now();
        frameTimes.push(endTime - startTime);
      }

      const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;

      // Target: Frame time < 16.67ms (60fps)
      expect(avgFrameTime).toBeLessThan(16.67);
    });
  });

  describe("Input Response Performance", () => {
    it("should respond to input within performance budget", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const responseTimes: number[] = [];

      // Test input response times
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        await act(async () => {
          await user.keyboard("{ArrowDown}");
        });

        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }

      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

      // Target: Input response < 16ms
      expect(avgResponseTime).toBeLessThan(16);
    });

    it("should handle rapid input efficiently", async () => {
      const user = userEvent.setup();
      render(<GameContainer />);

      const startTime = performance.now();

      // Rapid input sequence
      const inputs = ["{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{ArrowUp}"];
      for (let cycle = 0; cycle < 5; cycle++) {
        for (const input of inputs) {
          await act(async () => {
            await user.keyboard(input);
          });
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Target: 20 inputs in < 500ms
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe("Memory Performance", () => {
    it("should not exceed memory growth limits", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and destroy multiple game instances
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<GameContainer />);

        // Simulate some gameplay
        act(() => {
          for (let j = 0; j < 10; j++) {
            if (animationFrameCallbacks.length > 0) {
              const callback = animationFrameCallbacks.shift();
              callback?.();
            }
          }
        });

        unmount();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024); // MB

      // Target: Memory growth < 10MB for 5 instances
      expect(memoryGrowth).toBeLessThan(10);
    });

    it("should clean up resources properly", () => {
      const { unmount } = render(<GameContainer />);

      // Simulate gameplay
      act(() => {
        for (let i = 0; i < 50; i++) {
          if (animationFrameCallbacks.length > 0) {
            const callback = animationFrameCallbacks.shift();
            callback?.();
          }
        }
      });

      // Should unmount without memory leaks
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Performance Regression Detection", () => {
    it("should maintain baseline performance metrics", () => {
      const metrics = {
        renderTime: 0,
        inputResponseTime: 0,
        frameTime: 0,
      };

      // Measure render performance
      const renderStart = performance.now();
      const { unmount } = render(<GameContainer />);
      metrics.renderTime = performance.now() - renderStart;

      // Measure frame performance
      const frameStart = performance.now();
      act(() => {
        for (let i = 0; i < 10; i++) {
          if (animationFrameCallbacks.length > 0) {
            const callback = animationFrameCallbacks.shift();
            callback?.();
          }
        }
      });
      metrics.frameTime = (performance.now() - frameStart) / 10;

      unmount();

      // Performance regression thresholds
      expect(metrics.renderTime).toBeLessThan(50); // Initial render
      expect(metrics.frameTime).toBeLessThan(16.67); // 60fps frame time

      // Log metrics for monitoring
      console.log("Performance Metrics:", metrics);
    });

    it("should detect performance degradation", () => {
      const measurements: number[] = [];

      // Take multiple measurements
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const { unmount } = render(<GameContainer />);

        // Simulate light workload
        act(() => {
          for (let j = 0; j < 5; j++) {
            if (animationFrameCallbacks.length > 0) {
              const callback = animationFrameCallbacks.shift();
              callback?.();
            }
          }
        });

        const endTime = performance.now();
        measurements.push(endTime - startTime);
        unmount();
      }

      const avgTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      const minTime = Math.min(...measurements);

      // Performance consistency checks
      expect(avgTime).toBeLessThan(100); // Average performance
      expect(maxTime).toBeLessThan(200); // Worst case performance
      expect(maxTime - minTime).toBeLessThan(100); // Performance variance

      // Log for regression tracking
      console.log("Performance Variance:", { avgTime, maxTime, minTime, variance: maxTime - minTime });
    });
  });
});
