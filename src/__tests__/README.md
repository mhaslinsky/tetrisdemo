# Comprehensive Test Suite

This directory contains a comprehensive test suite for the Tetris web game, covering multiple testing strategies to ensure quality, performance, and accessibility.

## Test Structure

```
src/__tests__/
├── integration/           # Integration tests
├── e2e/                  # End-to-end tests
├── performance/          # Performance benchmarks
├── accessibility/        # Accessibility tests
├── visual/              # Visual regression tests
├── TestRunner.ts        # Test runner utilities
└── README.md           # This file
```

## Test Types

### 1. Integration Tests (`integration/`)

**Purpose**: Test component interactions and complete game flow scenarios.

**Files**:

- `GameFlow.integration.test.tsx` - Complete game session flows

**What they test**:

- Complete game sessions from start to game over
- Keyboard controls integration
- Game state persistence during pause/resume
- Error handling and edge cases
- Performance during gameplay

**Run with**: `npm run test:integration`

### 2. End-to-End Tests (`e2e/`)

**Purpose**: Test complete user journeys and full game sessions.

**Files**:

- `FullGameSession.e2e.test.tsx` - Full game lifecycle testing

**What they test**:

- Complete game lifecycle from start to finish
- High-frequency input handling (high APM gameplay)
- Extended play sessions with state consistency
- Game over scenarios and restart functionality
- Performance and stability during long sessions
- Memory efficiency during extended gameplay

**Run with**: `npm run test:e2e`

### 3. Performance Tests (`performance/`)

**Purpose**: Verify performance benchmarks and detect regressions.

**Files**:

- `PerformanceBenchmarks.test.tsx` - Performance benchmarks and regression tests
- `setup.js` - Performance testing utilities

**What they test**:

- Rendering performance (initial render, re-renders, 60fps maintenance)
- Input response time (< 16ms target)
- Game logic performance (collision detection, line clearing)
- Memory usage and leak detection
- Performance regression detection

**Run with**: `npm run test:performance`

**Performance Targets**:

- Initial render: < 50ms
- Input response: < 16ms
- Frame time: < 16.67ms (60fps)
- Collision detection: < 1ms
- Line clearing: < 2ms

### 4. Accessibility Tests (`accessibility/`)

**Purpose**: Ensure WCAG compliance and assistive technology support.

**Files**:

- `AccessibilityTests.test.tsx` - Comprehensive accessibility testing
- `setup.js` - Accessibility testing utilities

**What they test**:

- WCAG 2.1 AA compliance using jest-axe
- Keyboard navigation (full game playable without mouse)
- Screen reader support (ARIA labels, live regions)
- Focus management during state changes
- Color contrast and visual accessibility
- Motion preferences and reduced motion support
- Responsive accessibility across viewport sizes

**Run with**: `npm run test:accessibility`

**Standards**:

- WCAG 2.1 AA compliance
- Full keyboard accessibility
- Screen reader compatibility
- Proper focus management

### 5. Visual Regression Tests (`visual/`)

**Purpose**: Detect UI regressions and maintain visual consistency.

**Files**:

- `VisualRegression.test.tsx` - Visual consistency and regression testing

**What they test**:

- Visual consistency of game states (initial, playing, paused, game over)
- Component rendering consistency (GameBoard, GameSidebar)
- Responsive design across viewport sizes
- Animation and transition states
- Visual regression detection

**Run with**: `npm run test:visual`

## Test Commands

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm test`                   | Run unit tests only                               |
| `npm run test:integration`   | Run integration tests                             |
| `npm run test:e2e`           | Run end-to-end tests                              |
| `npm run test:performance`   | Run performance benchmarks                        |
| `npm run test:accessibility` | Run accessibility tests                           |
| `npm run test:visual`        | Run visual regression tests                       |
| `npm run test:comprehensive` | Run all comprehensive tests (excludes unit tests) |
| `npm run test:all`           | Run all tests with coverage                       |
| `npm run test:ci`            | Run tests in CI mode                              |

## Test Configuration

### Jest Configuration

The project uses multiple Jest configurations:

- `jest.config.js` - Default configuration for unit tests
- `jest.config.comprehensive.js` - Configuration for all test types

### Environment Variables

- `TEST_TYPE` - Specify which test type to run (unit, integration, e2e, performance, accessibility, visual, comprehensive, all)

### Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Test Utilities

### TestRunner (`TestRunner.ts`)

Provides utilities for:

- Managing different test suites
- Generating test reports
- Configuring Jest for different test types
- Formatting comprehensive test results

### Performance Utilities (`performance/setup.js`)

- Mock performance.now for consistent timing
- Performance monitoring and measurement
- Memory usage tracking
- Frame rate testing utilities

### Accessibility Utilities (`accessibility/setup.js`)

- jest-axe configuration for WCAG testing
- Screen reader announcement mocking
- Focus management testing
- Keyboard event simulation

## Running Tests

### Development

```bash
# Run tests during development
npm run test:watch

# Run specific test type
npm run test:integration
npm run test:accessibility
```

### CI/CD Pipeline

```bash
# Run all tests with coverage
npm run test:ci

# Run comprehensive tests
npm run test:comprehensive
```

### Performance Monitoring

```bash
# Run performance benchmarks
npm run test:performance

# Monitor for regressions
npm run test:performance -- --verbose
```

## Test Reports

Tests generate comprehensive reports including:

- Test execution summary
- Coverage reports (HTML, LCOV, JSON)
- Performance metrics
- Accessibility compliance results
- Visual regression detection

Reports are saved to:

- `coverage/` - Coverage reports
- `test-results/` - Test execution results
- Console output - Formatted test summaries

## Best Practices

### Writing Tests

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test component interactions and data flow
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Set clear performance budgets and test against them
5. **Accessibility Tests**: Test with real assistive technologies when possible
6. **Visual Tests**: Update baselines when UI changes are intentional

### Test Maintenance

1. Run unit tests frequently during development
2. Run integration tests before committing
3. Run comprehensive tests before releases
4. Monitor performance tests for regressions
5. Include accessibility tests in CI pipeline
6. Review and update visual baselines regularly

### Debugging Tests

1. Use `--verbose` flag for detailed output
2. Use `--watch` mode during development
3. Check coverage reports for untested code
4. Use browser dev tools for visual test debugging
5. Enable accessibility tools for a11y test debugging

## Requirements Coverage

This test suite covers the following requirements from the specification:

- **8.1, 8.2**: Performance and responsiveness testing
- **9.1, 9.2, 9.3**: Accessibility and usability testing
- **All game mechanics**: Integration and E2E testing
- **Visual consistency**: Visual regression testing
- **Error handling**: Edge case and error scenario testing

## Continuous Integration

The test suite is designed to run in CI environments with:

- Parallel test execution
- Coverage reporting
- Performance regression detection
- Accessibility compliance checking
- Visual regression detection
- Comprehensive test reporting

For CI setup, use:

```bash
npm run test:ci
```

This runs all tests with coverage and generates reports suitable for CI/CD pipelines.
