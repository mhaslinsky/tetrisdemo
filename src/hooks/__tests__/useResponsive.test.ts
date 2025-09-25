import { renderHook, act } from "@testing-library/react";
import { useResponsive, useDeviceCapabilities } from "../useResponsive";

// Mock window properties
const mockWindow = (properties: Partial<Window & typeof globalThis>) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: properties.innerWidth || 1024,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: properties.innerHeight || 768,
  });
  Object.defineProperty(window, "devicePixelRatio", {
    writable: true,
    configurable: true,
    value: properties.devicePixelRatio || 1,
  });

  // Mock touch support
  if (properties.ontouchstart !== undefined) {
    Object.defineProperty(window, "ontouchstart", {
      writable: true,
      configurable: true,
      value: properties.ontouchstart,
    });
  }
};

// Mock navigator properties
const mockNavigator = (properties: Partial<Navigator>) => {
  Object.defineProperty(navigator, "maxTouchPoints", {
    writable: true,
    configurable: true,
    value: properties.maxTouchPoints || 0,
  });

  if (properties.hardwareConcurrency !== undefined) {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      writable: true,
      configurable: true,
      value: properties.hardwareConcurrency,
    });
  }
};

describe("useResponsive", () => {
  beforeEach(() => {
    // Reset to default desktop values
    mockWindow({
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
    });
    mockNavigator({
      maxTouchPoints: 0,
      hardwareConcurrency: 8,
    });
  });

  describe("Screen Size Detection", () => {
    it("detects desktop screen size", () => {
      mockWindow({ innerWidth: 1200, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isLargeScreen).toBe(true);
      expect(result.current.isMediumScreen).toBe(false);
      expect(result.current.isSmallScreen).toBe(false);
    });

    it("detects tablet screen size", () => {
      mockWindow({ innerWidth: 800, innerHeight: 600 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isLargeScreen).toBe(false);
      expect(result.current.isMediumScreen).toBe(true);
      expect(result.current.isSmallScreen).toBe(false);
    });

    it("detects mobile screen size", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isLargeScreen).toBe(false);
      expect(result.current.isMediumScreen).toBe(false);
      expect(result.current.isSmallScreen).toBe(true);
    });

    it("detects small screen size", () => {
      mockWindow({ innerWidth: 500, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isSmallScreen).toBe(true);
      expect(result.current.isMediumScreen).toBe(false);
      expect(result.current.isLargeScreen).toBe(false);
    });
  });

  describe("Orientation Detection", () => {
    it("detects landscape orientation", () => {
      mockWindow({ innerWidth: 1200, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe("landscape");
    });

    it("detects portrait orientation", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe("portrait");
    });
  });

  describe("Touch Device Detection", () => {
    it("detects touch device via ontouchstart", () => {
      mockWindow({ ontouchstart: null });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTouchDevice).toBe(true);
      expect(result.current.canUseTouchControls).toBe(true);
    });

    it("detects touch device via maxTouchPoints", () => {
      mockNavigator({ maxTouchPoints: 5 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTouchDevice).toBe(true);
      expect(result.current.canUseTouchControls).toBe(true);
    });

    it("detects non-touch device", () => {
      mockWindow({ ontouchstart: undefined });
      mockNavigator({ maxTouchPoints: 0 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTouchDevice).toBe(false);
    });
  });

  describe("Performance Optimization Detection", () => {
    it("suggests optimization for mobile devices", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.shouldOptimizePerformance).toBe(true);
    });

    it("suggests optimization for high DPI displays", () => {
      mockWindow({ devicePixelRatio: 3 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.shouldOptimizePerformance).toBe(true);
    });

    it("suggests optimization for low-end devices", () => {
      mockNavigator({ hardwareConcurrency: 2 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.shouldOptimizePerformance).toBe(true);
    });

    it("does not suggest optimization for high-end desktop", () => {
      mockWindow({
        innerWidth: 1920,
        innerHeight: 1080,
        devicePixelRatio: 1,
      });
      mockNavigator({ hardwareConcurrency: 8 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.shouldOptimizePerformance).toBe(false);
    });
  });

  describe("Touch Controls Recommendation", () => {
    it("recommends touch controls for touch devices", () => {
      mockWindow({ ontouchstart: null });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.canUseTouchControls).toBe(true);
    });

    it("recommends touch controls for mobile devices", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.canUseTouchControls).toBe(true);
    });

    it("does not recommend touch controls for desktop", () => {
      mockWindow({
        innerWidth: 1200,
        innerHeight: 800,
        ontouchstart: undefined,
      });
      mockNavigator({ maxTouchPoints: 0 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.canUseTouchControls).toBe(false);
    });
  });

  describe("Resize Handling", () => {
    it("updates state on window resize", () => {
      const { result } = renderHook(() => useResponsive());

      // Initial state - desktop
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);

      // Simulate resize to mobile
      act(() => {
        mockWindow({ innerWidth: 400, innerHeight: 800 });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isMobile).toBe(true);
    });

    it("updates orientation on resize", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });
      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe("portrait");

      // Simulate rotation to landscape
      act(() => {
        mockWindow({ innerWidth: 800, innerHeight: 400 });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.orientation).toBe("landscape");
    });

    it("handles orientation change event", () => {
      mockWindow({ innerWidth: 400, innerHeight: 800 });
      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe("portrait");

      // Simulate orientation change
      act(() => {
        mockWindow({ innerWidth: 800, innerHeight: 400 });
        window.dispatchEvent(new Event("orientationchange"));
      });

      expect(result.current.orientation).toBe("landscape");
    });
  });

  describe("Screen Dimensions", () => {
    it("provides accurate screen dimensions", () => {
      mockWindow({ innerWidth: 1200, innerHeight: 800 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.screenWidth).toBe(1200);
      expect(result.current.screenHeight).toBe(800);
    });

    it("provides device pixel ratio", () => {
      mockWindow({ devicePixelRatio: 2 });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.devicePixelRatio).toBe(2);
    });
  });
});

describe("useDeviceCapabilities", () => {
  beforeEach(() => {
    // Reset global objects
    delete (window as any).WebGLRenderingContext;
    delete (window as any).CanvasRenderingContext2D;
    delete (window as any).localStorage;
    delete (navigator as any).serviceWorker;
    delete (performance as any).memory;
    delete (navigator as any).connection;
  });

  it("detects WebGL support", () => {
    (window as any).WebGLRenderingContext = {};

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.supportsWebGL).toBe(true);
  });

  it("detects Canvas support", () => {
    (window as any).CanvasRenderingContext2D = {};

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.supportsCanvas).toBe(true);
  });

  it("detects localStorage support", () => {
    (window as any).localStorage = {};

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.supportsLocalStorage).toBe(true);
  });

  it("detects service worker support", () => {
    (navigator as any).serviceWorker = {};

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.supportsServiceWorker).toBe(true);
  });

  it("provides memory information when available", () => {
    (performance as any).memory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    };

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.memoryInfo).toEqual({
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    });
  });

  it("provides connection type when available", () => {
    (navigator as any).connection = {
      effectiveType: "4g",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.connectionType).toBe("4g");
  });

  it("handles missing capabilities gracefully", () => {
    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.supportsWebGL).toBe(false);
    expect(result.current.supportsCanvas).toBe(false);
    expect(result.current.supportsLocalStorage).toBe(false);
    expect(result.current.supportsServiceWorker).toBe(false);
    expect(result.current.memoryInfo).toBe(null);
    expect(result.current.connectionType).toBe("unknown");
  });
});
