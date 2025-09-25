// Performance testing setup
import "@testing-library/jest-dom";

// Mock performance.now for consistent timing in tests
let mockTime = 0;
const originalPerformanceNow = performance.now;

global.mockPerformanceTime = (time) => {
  mockTime = time;
};

global.advanceMockTime = (ms) => {
  mockTime += ms;
};

global.resetMockTime = () => {
  mockTime = 0;
};

// Override performance.now for controlled testing
performance.now = jest.fn(() => mockTime);

// Mock requestAnimationFrame for performance tests
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Performance monitoring utilities
global.performanceMonitor = {
  marks: new Map(),
  measures: [],

  mark(name) {
    this.marks.set(name, performance.now());
  },

  measure(name, startMark, endMark) {
    const startTime = this.marks.get(startMark) || 0;
    const endTime = this.marks.get(endMark) || performance.now();
    const duration = endTime - startTime;

    this.measures.push({
      name,
      duration,
      startTime,
      endTime,
    });

    return duration;
  },

  getEntries() {
    return [...this.measures];
  },

  clear() {
    this.marks.clear();
    this.measures = [];
  },
};

// Memory usage monitoring (if available)
if (typeof global.gc === "function") {
  global.forceGarbageCollection = () => {
    global.gc();
  };
} else {
  global.forceGarbageCollection = () => {
    // No-op if gc is not available
  };
}

// Performance assertion helpers
global.expectPerformance = {
  toBeFasterThan(actualTime, expectedMaxTime) {
    expect(actualTime).toBeLessThan(expectedMaxTime);
  },

  toMaintainFrameRate(frameTimes, targetFPS = 60) {
    const targetFrameTime = 1000 / targetFPS;
    const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
    expect(averageFrameTime).toBeLessThan(targetFrameTime);
  },

  toNotExceedMemoryGrowth(initialMemory, finalMemory, maxGrowthMB = 50) {
    const growthMB = (finalMemory - initialMemory) / (1024 * 1024);
    expect(growthMB).toBeLessThan(maxGrowthMB);
  },
};

// Cleanup after each test
afterEach(() => {
  global.performanceMonitor.clear();
  global.resetMockTime();
  jest.clearAllMocks();
});
