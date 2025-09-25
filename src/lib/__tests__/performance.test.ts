import { PerformanceMonitor, measureExecutionTime, debounce, throttle } from "../performance";

describe("Performance Utilities", () => {
  describe("PerformanceMonitor", () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor({
        targetFps: 60,
        sampleSize: 10,
        enableMemoryTracking: false,
        warningThreshold: 30,
      });
    });

    afterEach(() => {
      monitor.stop();
    });

    it("should track frame metrics correctly", () => {
      monitor.start();

      // Simulate some render cycles
      for (let i = 0; i < 5; i++) {
        monitor.startRender();
        // Simulate render work
        const start = performance.now();
        while (performance.now() - start < 10) {
          // Busy wait for 10ms
        }
        monitor.endRender();
      }

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeGreaterThan(0);
      expect(metrics.averageFps).toBeGreaterThan(0);
      expect(metrics.frameTime).toBeGreaterThan(0);
      expect(metrics.renderTime).toBeGreaterThan(0);
    });

    it("should detect poor performance", () => {
      monitor.start();

      // Simulate slow render cycles
      for (let i = 0; i < 5; i++) {
        monitor.startRender();
        // Simulate slow render work (>33ms for <30fps)
        const start = performance.now();
        while (performance.now() - start < 40) {
          // Busy wait for 40ms
        }
        monitor.endRender();
      }

      expect(monitor.isPerformancePoor()).toBe(true);

      const warnings = monitor.getPerformanceWarnings();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain("Low FPS detected");
    });

    it("should reset metrics correctly", () => {
      monitor.start();
      monitor.startRender();
      monitor.endRender();

      let metrics = monitor.getMetrics();
      expect(metrics.fps).toBeGreaterThan(0);

      monitor.reset();
      metrics = monitor.getMetrics();
      expect(metrics.fps).toBe(0);
    });
  });

  describe("measureExecutionTime", () => {
    it("should measure function execution time", () => {
      const slowFunction = () => {
        const start = performance.now();
        while (performance.now() - start < 10) {
          // Busy wait for 10ms
        }
        return "result";
      };

      const { result, executionTime } = measureExecutionTime(slowFunction);

      expect(result).toBe("result");
      expect(executionTime).toBeGreaterThanOrEqual(10);
      expect(executionTime).toBeLessThan(50); // Should be reasonable
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 60);
    });
  });

  describe("throttle", () => {
    it("should throttle function calls", (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 50);

      // Call multiple times rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should have been called once immediately
      expect(callCount).toBe(1);

      // Wait for throttle period
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 60);
    });
  });
});

describe("Performance Benchmarks", () => {
  it("should benchmark collision detection performance", () => {
    // Import collision functions for benchmarking
    const { checkBoundaryCollision, checkBlockCollision } = require("../collision");
    const { createEmptyBoard } = require("../board");

    const board = createEmptyBoard();
    const testPiece = {
      type: "T" as const,
      shape: [
        [false, true, false],
        [true, true, true],
        [false, false, false],
      ],
      position: { x: 4, y: 10 },
      rotation: 0,
    };

    // Benchmark boundary collision
    const boundaryResult = measureExecutionTime(() => {
      for (let i = 0; i < 1000; i++) {
        checkBoundaryCollision(testPiece);
      }
    }, "Boundary collision (1000 iterations)");

    // Benchmark block collision
    const blockResult = measureExecutionTime(() => {
      for (let i = 0; i < 1000; i++) {
        checkBlockCollision(board, testPiece);
      }
    }, "Block collision (1000 iterations)");

    // Performance should be reasonable (less than 10ms for 1000 iterations)
    expect(boundaryResult.executionTime).toBeLessThan(10);
    expect(blockResult.executionTime).toBeLessThan(10);
  });

  it("should benchmark board operations performance", () => {
    const { findCompleteRows, clearLines, createEmptyBoard } = require("../board");

    // Create a board with some complete rows
    const board = createEmptyBoard();
    // Fill bottom rows
    for (let row = 18; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        board[row][col] = "I";
      }
    }

    // Benchmark finding complete rows
    const findResult = measureExecutionTime(() => {
      for (let i = 0; i < 1000; i++) {
        findCompleteRows(board);
      }
    }, "Find complete rows (1000 iterations)");

    // Benchmark clearing lines
    const clearResult = measureExecutionTime(() => {
      for (let i = 0; i < 100; i++) {
        clearLines(board);
      }
    }, "Clear lines (100 iterations)");

    // Performance should be reasonable
    expect(findResult.executionTime).toBeLessThan(10);
    expect(clearResult.executionTime).toBeLessThan(50);
  });
});
