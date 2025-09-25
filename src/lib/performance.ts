import React from "react";

/**
 * Performance monitoring utilities for Tetris game
 * Tracks frame rate, render times, and performance metrics
 */

export interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  frameTime: number;
  averageFrameTime: number;
  renderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  isPerformanceGood: boolean;
}

export interface PerformanceConfig {
  targetFps: number;
  sampleSize: number;
  enableMemoryTracking: boolean;
  warningThreshold: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  targetFps: 60,
  sampleSize: 60, // Track last 60 frames
  enableMemoryTracking: true,
  warningThreshold: 30, // Warn if FPS drops below 30
};

/**
 * Performance monitor class for tracking game performance
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private startTime = 0;
  private renderStartTime = 0;
  private isTracking = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = performance.now();
  }

  /**
   * Start tracking performance metrics
   */
  start(): void {
    this.isTracking = true;
    this.lastFrameTime = performance.now();
  }

  /**
   * Stop tracking performance metrics
   */
  stop(): void {
    this.isTracking = false;
  }

  /**
   * Mark the start of a render cycle
   */
  startRender(): void {
    if (!this.isTracking) return;
    this.renderStartTime = performance.now();
  }

  /**
   * Mark the end of a render cycle and record metrics
   */
  endRender(): void {
    if (!this.isTracking) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const renderTime = now - this.renderStartTime;

    // Record frame time
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.config.sampleSize) {
      this.frameTimes.shift();
    }

    // Record render time
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > this.config.sampleSize) {
      this.renderTimes.shift();
    }

    this.lastFrameTime = now;
    this.frameCount++;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const currentFrameTime = this.frameTimes[this.frameTimes.length - 1] || 0;
    const currentRenderTime = this.renderTimes[this.renderTimes.length - 1] || 0;

    const averageFrameTime =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length
        : 0;

    const averageRenderTime =
      this.renderTimes.length > 0
        ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
        : 0;

    const fps = currentFrameTime > 0 ? 1000 / currentFrameTime : 0;
    const averageFps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;

    let memoryUsage: number | undefined;
    if (this.config.enableMemoryTracking && "memory" in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    return {
      fps: Math.round(fps),
      averageFps: Math.round(averageFps),
      frameTime: Math.round(currentFrameTime * 100) / 100,
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      renderTime: Math.round(currentRenderTime * 100) / 100,
      averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      memoryUsage: memoryUsage ? Math.round(memoryUsage * 100) / 100 : undefined,
      isPerformanceGood: averageFps >= this.config.warningThreshold,
    };
  }

  /**
   * Reset all performance metrics
   */
  reset(): void {
    this.frameTimes = [];
    this.renderTimes = [];
    this.frameCount = 0;
    this.startTime = performance.now();
  }

  /**
   * Check if performance is below acceptable threshold
   */
  isPerformancePoor(): boolean {
    const metrics = this.getMetrics();
    return metrics.averageFps < this.config.warningThreshold;
  }

  /**
   * Get performance warnings and suggestions
   */
  getPerformanceWarnings(): string[] {
    const metrics = this.getMetrics();
    const warnings: string[] = [];

    if (metrics.averageFps < this.config.warningThreshold) {
      warnings.push(`Low FPS detected: ${metrics.averageFps} (target: ${this.config.targetFps})`);
    }

    if (metrics.averageRenderTime > 16) {
      // 16ms = 60fps
      warnings.push(`High render time: ${metrics.averageRenderTime}ms (target: <16ms)`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      // 100MB threshold
      warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
    }

    return warnings;
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for using performance monitoring in React components
 */
export function usePerformanceMonitor(enabled = true) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    performanceMonitor.start();

    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);

    return () => {
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, [enabled]);

  return {
    metrics,
    monitor: performanceMonitor,
    isPerformancePoor: metrics ? !metrics.isPerformanceGood : false,
    warnings: performanceMonitor.getPerformanceWarnings(),
  };
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.startRender();
      return () => {
        performanceMonitor.endRender();
      };
    });

    return React.createElement(Component, { ...props, ref } as any);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${
    componentName || Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Utility function to measure execution time of a function
 */
export function measureExecutionTime<T>(fn: () => T, label?: string): { result: T; executionTime: number } {
  const start = performance.now();
  const result = fn();
  const executionTime = performance.now() - start;

  if (label && process.env.NODE_ENV === "development") {
    console.log(`${label}: ${executionTime.toFixed(2)}ms`);
  }

  return { result, executionTime };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
