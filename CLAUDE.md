# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `npm test` - Run unit tests
- `npm run test:comprehensive` - Run integration, e2e, performance, accessibility, and visual tests
- `npm run test:comprehensive-report` - Generate full test report via scripts/run-comprehensive-tests.js
- `npm run test:integration` - Run component interaction tests
- `npm run test:e2e` - Run end-to-end user journey tests
- `npm run test:performance` - Run performance benchmarks
- `npm run test:accessibility` - Run WCAG compliance tests
- `npm run test:visual` - Run visual regression tests

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Architecture Overview

This is a modern Tetris game built with Next.js 14, React, TypeScript, and Tailwind CSS. The architecture follows a clean separation of concerns with custom hooks, game logic modules, and React components.

### Core Game Architecture

**Game State Management**: The game uses a centralized state management pattern with `useReducer`:
- `src/lib/gameState.ts` - Core game state reducer and initial state creation
- `src/hooks/useGameState.ts` - Custom hook wrapper providing action dispatchers and computed values
- `src/types/game.ts` - TypeScript definitions for all game entities

**Game Loop**: Real-time gameplay managed via `useGameLoop` hook with requestAnimationFrame timing system for 60fps performance.

**Input System**: Multi-modal input handling:
- `src/hooks/useKeyboardInput.ts` - Keyboard controls with proper event handling
- `src/components/game/TouchControls.tsx` - Mobile touch interface
- Both integrate with the same action dispatchers from useGameState

**Game Logic Modules** (in `src/lib/`):
- `board.ts` - Board operations, collision detection, piece placement
- `movement.ts` - Piece movement, rotation, and wall kicks
- `collision.ts` - Collision detection algorithms
- `scoring.ts` - Line clearing, scoring, level progression
- `position.ts` - Position utilities and transformations

**Performance & Accessibility**:
- `src/lib/performance.ts` - Performance monitoring with frame rate tracking
- `src/hooks/useAccessibility.ts` - Screen reader announcements and ARIA management
- `src/hooks/useResponsive.ts` - Responsive design utilities

### Component Structure

**Main Game Container**: `src/components/game/GameContainer.tsx` orchestrates all game functionality and integrates all hooks.

**Game Components**:
- `GameBoard.tsx` - Main game board rendering with piece visualization
- `GameSidebar.tsx` - Score, level, next piece, and hold piece display
- Touch controls and overlays for mobile support

**UI Components**: Error boundaries, help modals, and game instructions in `src/components/ui/`.

### Testing Architecture

The project has a comprehensive testing strategy with multiple test types:
- Unit tests alongside components and modules
- Integration tests in `src/__tests__/integration/`
- E2E tests in `src/__tests__/e2e/`
- Performance, accessibility, and visual regression tests in respective directories
- Jest configuration supports different test types via `jest.config.comprehensive.js`

### Key Patterns

**Immutable State**: Game state updates use immutable patterns via useReducer for predictable state transitions.

**Custom Hooks**: Business logic extracted into reusable hooks (useGameState, useGameLoop, useKeyboardInput, etc.) for separation of concerns.

**Performance Optimization**: Components use React.memo, useMemo, and useCallback for optimization. Performance monitoring tracks frame rates.

**Type Safety**: Comprehensive TypeScript types for game entities, actions, and state ensure type safety throughout the codebase.

## Critical Performance Considerations

### Game Loop Hook Stability
The `useGameLoop` hook requires careful management to avoid constant reinitialization:

- **Problem**: Passing changing objects (like `gameState`) directly to hooks causes them to recreate every render
- **Solution**: Use stable refs (`gameStateRef`) and stable callbacks with empty dependency arrays
- **Symptoms**: If pieces aren't falling or timers reset constantly, check for hook reinitialization in console

### useEffect Dependencies in Game Loops
Be cautious with useEffect dependencies that track frequently changing game state:

- Avoid dependencies on `gameState.currentPiece?.position.x/y` (changes every frame)
- Only track essential state changes like piece type or level
- Consider whether timer resets are actually needed or if they're causing performance issues