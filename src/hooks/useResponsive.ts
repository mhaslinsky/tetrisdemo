import { useState, useEffect, useCallback } from "react";

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: "portrait" | "landscape";
  devicePixelRatio: number;
}

interface ResponsiveHookReturn extends ResponsiveState {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  canUseTouchControls: boolean;
  shouldOptimizePerformance: boolean;
}

/**
 * Custom hook for responsive design and device detection
 * Provides information about screen size, device type, and capabilities
 */
export const useResponsive = (): ResponsiveHookReturn => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        screenWidth: 1024,
        screenHeight: 768,
        orientation: "landscape",
        devicePixelRatio: 1,
      };
    }

    return {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setState({
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? "landscape" : "portrait",
      devicePixelRatio: window.devicePixelRatio || 1,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Update state on mount
    updateState();

    // Add event listeners
    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
    };
  }, [updateState]);

  // Computed values
  const isSmallScreen = state.screenWidth < 640;
  const isMediumScreen = state.screenWidth >= 640 && state.screenWidth < 1024;
  const isLargeScreen = state.screenWidth >= 1024;

  // Touch controls should be shown on touch devices or small screens
  const canUseTouchControls = state.isTouchDevice || state.isMobile;

  // Performance optimization for lower-end devices
  const shouldOptimizePerformance =
    state.isMobile ||
    state.devicePixelRatio > 2 ||
    (typeof navigator !== "undefined" &&
      navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency <= 4);

  return {
    ...state,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    canUseTouchControls,
    shouldOptimizePerformance,
  };
};

/**
 * Hook for detecting device capabilities and performance characteristics
 */
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState(() => {
    if (typeof window === "undefined") {
      return {
        supportsWebGL: false,
        supportsCanvas: false,
        supportsLocalStorage: false,
        supportsServiceWorker: false,
        memoryInfo: null,
        connectionType: "unknown",
      };
    }

    return {
      supportsWebGL: !!window.WebGLRenderingContext,
      supportsCanvas: !!window.CanvasRenderingContext2D,
      supportsLocalStorage: !!window.localStorage,
      supportsServiceWorker: "serviceWorker" in navigator,
      memoryInfo: (performance as any)?.memory || null,
      connectionType: (navigator as any)?.connection?.effectiveType || "unknown",
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Update capabilities on mount
    setCapabilities({
      supportsWebGL: !!window.WebGLRenderingContext,
      supportsCanvas: !!window.CanvasRenderingContext2D,
      supportsLocalStorage: !!window.localStorage,
      supportsServiceWorker: "serviceWorker" in navigator,
      memoryInfo: (performance as any)?.memory || null,
      connectionType: (navigator as any)?.connection?.effectiveType || "unknown",
    });

    // Listen for connection changes
    const handleConnectionChange = () => {
      setCapabilities((prev) => ({
        ...prev,
        connectionType: (navigator as any)?.connection?.effectiveType || "unknown",
      }));
    };

    if ((navigator as any)?.connection) {
      (navigator as any).connection.addEventListener("change", handleConnectionChange);

      return () => {
        (navigator as any).connection.removeEventListener("change", handleConnectionChange);
      };
    }
  }, []);

  return capabilities;
};

export default useResponsive;
