// Accessibility testing setup
import "@testing-library/jest-dom";
import { configureAxe } from "jest-axe";

// Configure axe for accessibility testing
const axe = configureAxe({
  rules: {
    // Customize axe rules for the Tetris game
    "color-contrast": { enabled: true },
    "keyboard-navigation": { enabled: true },
    "focus-management": { enabled: true },
    "aria-labels": { enabled: true },
    "semantic-markup": { enabled: true },
  },
  tags: ["wcag2a", "wcag2aa", "wcag21aa"],
});

// Make axe available globally
global.axe = axe;

// Mock screen reader announcements
global.mockScreenReader = {
  announcements: [],

  announce(message, priority = "polite") {
    this.announcements.push({
      message,
      priority,
      timestamp: Date.now(),
    });
  },

  getAnnouncements() {
    return [...this.announcements];
  },

  getLastAnnouncement() {
    return this.announcements[this.announcements.length - 1];
  },

  clear() {
    this.announcements = [];
  },
};

// Mock media queries for accessibility preferences
global.mockMediaQuery = (query) => {
  const mediaQueries = {
    "(prefers-reduced-motion: reduce)": false,
    "(prefers-contrast: high)": false,
    "(prefers-color-scheme: dark)": false,
  };

  return {
    matches: mediaQueries[query] || false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Override matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(global.mockMediaQuery),
});

// Mock focus management
global.mockFocus = {
  focusedElement: null,
  focusHistory: [],

  setFocus(element) {
    this.focusedElement = element;
    this.focusHistory.push({
      element,
      timestamp: Date.now(),
    });
  },

  getFocusedElement() {
    return this.focusedElement;
  },

  getFocusHistory() {
    return [...this.focusHistory];
  },

  clear() {
    this.focusedElement = null;
    this.focusHistory = [];
  },
};

// Accessibility testing utilities
global.accessibilityUtils = {
  // Check if element has proper ARIA labels
  hasAriaLabel(element) {
    return (
      element.hasAttribute("aria-label") ||
      element.hasAttribute("aria-labelledby") ||
      element.hasAttribute("aria-describedby")
    );
  },

  // Check if element is keyboard accessible
  isKeyboardAccessible(element) {
    const tabIndex = element.getAttribute("tabindex");
    const isInteractive = ["button", "input", "select", "textarea", "a"].includes(element.tagName.toLowerCase());
    const hasRole = element.hasAttribute("role");

    return isInteractive || hasRole || (tabIndex !== null && tabIndex >= 0);
  },

  // Check color contrast (simplified)
  hasGoodContrast(element) {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // This is a simplified check - in real testing you'd use a proper contrast calculator
    return color !== backgroundColor && color !== "transparent" && backgroundColor !== "transparent";
  },

  // Check if text is readable
  isTextReadable(element) {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;

    // Basic readability checks
    return fontSize >= 12 && fontWeight !== "lighter";
  },
};

// Accessibility assertion helpers
global.expectAccessibility = {
  toBeKeyboardAccessible(element) {
    expect(global.accessibilityUtils.isKeyboardAccessible(element)).toBe(true);
  },

  toHaveAriaLabel(element) {
    expect(global.accessibilityUtils.hasAriaLabel(element)).toBe(true);
  },

  toHaveGoodContrast(element) {
    expect(global.accessibilityUtils.hasGoodContrast(element)).toBe(true);
  },

  toBeReadable(element) {
    expect(global.accessibilityUtils.isTextReadable(element)).toBe(true);
  },

  toAnnounceToScreenReader(message) {
    const announcements = global.mockScreenReader.getAnnouncements();
    const hasAnnouncement = announcements.some((a) => a.message.includes(message));
    expect(hasAnnouncement).toBe(true);
  },
};

// Mock keyboard events for testing
global.createKeyboardEvent = (key, options = {}) => {
  return new KeyboardEvent("keydown", {
    key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// Cleanup after each test
afterEach(() => {
  global.mockScreenReader.clear();
  global.mockFocus.clear();
  jest.clearAllMocks();
});
