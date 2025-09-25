const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

// Base configuration for all test types
const baseConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**/*",
    "!src/**/*.test.{ts,tsx}",
    "!src/__tests__/**/*",
  ],
  coverageReporters: ["text", "lcov", "html", "json"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Configuration for different test types
const testConfigs = {
  // Unit tests (default)
  unit: {
    ...baseConfig,
    displayName: "Unit Tests",
    testMatch: [
      "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
      "!<rootDir>/src/__tests__/integration/**/*",
      "!<rootDir>/src/__tests__/e2e/**/*",
      "!<rootDir>/src/__tests__/performance/**/*",
      "!<rootDir>/src/__tests__/accessibility/**/*",
      "!<rootDir>/src/__tests__/visual/**/*",
    ],
  },

  // Integration tests
  integration: {
    ...baseConfig,
    displayName: "Integration Tests",
    testMatch: ["<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}"],
    testTimeout: 30000, // Longer timeout for integration tests
  },

  // End-to-end tests
  e2e: {
    ...baseConfig,
    displayName: "End-to-End Tests",
    testMatch: ["<rootDir>/src/__tests__/e2e/**/*.test.{ts,tsx}"],
    testTimeout: 60000, // Longer timeout for e2e tests
  },

  // Performance tests
  performance: {
    ...baseConfig,
    displayName: "Performance Tests",
    testMatch: ["<rootDir>/src/__tests__/performance/**/*.test.{ts,tsx}"],
    testTimeout: 30000,
    // Performance tests might need special setup
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "<rootDir>/src/__tests__/performance/setup.js"],
  },

  // Accessibility tests
  accessibility: {
    ...baseConfig,
    displayName: "Accessibility Tests",
    testMatch: ["<rootDir>/src/__tests__/accessibility/**/*.test.{ts,tsx}"],
    testTimeout: 30000,
    // Accessibility tests need jest-axe
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "<rootDir>/src/__tests__/accessibility/setup.js"],
  },

  // Visual regression tests
  visual: {
    ...baseConfig,
    displayName: "Visual Regression Tests",
    testMatch: ["<rootDir>/src/__tests__/visual/**/*.test.{ts,tsx}"],
    testTimeout: 30000,
  },

  // Comprehensive (all test types)
  comprehensive: {
    ...baseConfig,
    displayName: "Comprehensive Tests",
    testMatch: [
      "<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}",
      "<rootDir>/src/__tests__/e2e/**/*.test.{ts,tsx}",
      "<rootDir>/src/__tests__/performance/**/*.test.{ts,tsx}",
      "<rootDir>/src/__tests__/accessibility/**/*.test.{ts,tsx}",
      "<rootDir>/src/__tests__/visual/**/*.test.{ts,tsx}",
    ],
    testTimeout: 60000,
  },

  // All tests (including unit tests)
  all: {
    ...baseConfig,
    displayName: "All Tests",
    testMatch: ["<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}", "<rootDir>/src/__tests__/**/*.test.{ts,tsx}"],
    testTimeout: 60000,
  },
};

// Determine which config to use based on environment variable
const testType = process.env.TEST_TYPE || "unit";
const config = testConfigs[testType] || testConfigs.unit;

module.exports = createJestConfig(config);
