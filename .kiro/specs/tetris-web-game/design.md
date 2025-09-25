# Tetris Web Game Design Document

## Overview

The Tetris web game will be built as a single-page application using Next.js with React components. The architecture follows a clean separation between game logic, state management, and UI rendering. The game will use a component-based architecture with custom hooks for game state management and pure functions for game logic calculations.

The core game loop will be managed through React's useEffect and requestAnimationFrame for smooth 60fps gameplay. State management will utilize React's built-in hooks (useState, useReducer) with immutable state updates to ensure predictable behavior and easy debugging.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│                     React Components                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   GameUI    │  │  GameBoard  │  │    GameControls     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Custom Hooks                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │useGameState │  │useGameLoop  │  │   useKeyboardInput  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Game Logic Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Collision  │  │  Rotation   │  │    Line Clearing    │ │
│  │  Detection  │  │   Logic     │  │      & Scoring      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Data Models                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  GameState  │  │ Tetromino   │  │      Board          │ │
│  │   Types     │  │   Shapes    │  │    Utilities        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (page.tsx)
├── GameContainer
    ├── GameBoard
    │   ├── BoardGrid
    │   ├── ActivePiece
    │   └── PlacedBlocks
    ├── GameSidebar
    │   ├── ScoreDisplay
    │   ├── NextPiecePreview
    │   ├── HoldPiecePreview
    │   └── GameStats
    ├── GameControls
    │   ├── PauseButton
    │   ├── RestartButton
    │   └── ControlsHelp
    └── GameOverModal
```

## Components and Interfaces

### Core Data Types

```typescript
// Game State Types
interface GameState {
  board: Board;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino;
  heldPiece: Tetromino | null;
  canHold: boolean;
  score: number;
  level: number;
  linesCleared: number;
  gameStatus: "playing" | "paused" | "gameOver" | "ready";
  dropTimer: number;
  lastDropTime: number;
}

// Board Representation
type Board = (TetrominoType | null)[][];
type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

// Tetromino Piece
interface Tetromino {
  type: TetrominoType;
  shape: boolean[][];
  position: Position;
  rotation: number;
}

interface Position {
  x: number;
  y: number;
}

// Game Actions
type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_DOWN" }
  | { type: "ROTATE" }
  | { type: "HARD_DROP" }
  | { type: "HOLD_PIECE" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "RESTART_GAME" }
  | { type: "GAME_TICK" };
```

### Key Components

#### GameContainer Component

- **Purpose**: Main game orchestrator and state container
- **Responsibilities**:
  - Manages overall game state using useReducer
  - Handles keyboard input through useKeyboardInput hook
  - Coordinates game loop timing with useGameLoop hook
  - Provides game state context to child components

#### GameBoard Component

- **Purpose**: Renders the main playing field
- **Responsibilities**:
  - Displays the 10×20 game grid
  - Renders placed blocks with appropriate colors
  - Shows the currently active falling piece
  - Handles visual effects for line clearing animations

#### GameSidebar Component

- **Purpose**: Displays game information and previews
- **Responsibilities**:
  - Shows current score, level, and lines cleared
  - Displays next piece preview
  - Shows held piece (if hold feature is enabled)
  - Provides game statistics and progress indicators

### Custom Hooks

#### useGameState Hook

```typescript
interface UseGameStateReturn {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  isGameActive: boolean;
  canMovePiece: boolean;
}
```

- Manages game state with useReducer
- Provides computed values for game status
- Handles state transitions and validation

#### useGameLoop Hook

```typescript
interface UseGameLoopReturn {
  startGameLoop: () => void;
  stopGameLoop: () => void;
  isRunning: boolean;
}
```

- Manages the main game timing loop
- Uses requestAnimationFrame for smooth 60fps updates
- Handles variable drop speeds based on level
- Coordinates automatic piece dropping

#### useKeyboardInput Hook

```typescript
interface UseKeyboardInputReturn {
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
}
```

- Handles keyboard event listeners
- Manages key press states and debouncing
- Provides clean interface for input handling
- Supports key repeat for continuous movement

## Data Models

### Board Management

The game board will be represented as a 2D array where each cell can contain either a tetromino type or null for empty cells:

```typescript
// Board initialization
const createEmptyBoard = (): Board =>
  Array(20).fill(null).map(() => Array(10).fill(null));

// Board operations
const isValidPosition = (board: Board, piece: Tetromino): boolean;
const placePiece = (board: Board, piece: Tetromino): Board;
const clearLines = (board: Board): { newBoard: Board; linesCleared: number };
```

### Tetromino Shapes and Rotations

Each tetromino type will have predefined shapes for all four rotation states:

```typescript
const TETROMINO_SHAPES: Record<TetrominoType, boolean[][][]> = {
  I: [
    [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
    [
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
    ],
    // ... other rotations
  ],
  // ... other pieces
};
```

### Collision Detection System

The collision detection will use a comprehensive checking system:

```typescript
interface CollisionChecker {
  checkBoundaries: (piece: Tetromino) => boolean;
  checkBlockCollision: (board: Board, piece: Tetromino) => boolean;
  checkRotationCollision: (board: Board, piece: Tetromino, newRotation: number) => boolean;
  getWallKickOffsets: (piece: Tetromino, fromRotation: number, toRotation: number) => Position[];
}
```

## Error Handling

### Game State Validation

- Validate all piece movements before applying
- Ensure board state consistency after operations
- Handle edge cases in rotation and wall kicks
- Prevent invalid game state transitions

### Input Handling

- Debounce rapid key presses to prevent input spam
- Validate input commands against current game state
- Handle simultaneous key presses gracefully
- Provide fallback behavior for unsupported inputs

### Performance Error Handling

- Monitor frame rate and adjust game loop if needed
- Handle memory leaks in game loop cleanup
- Provide graceful degradation for slower devices
- Implement error boundaries for component failures

## Testing Strategy

### Unit Testing

- **Game Logic Functions**: Test all pure functions for piece movement, rotation, and collision detection
- **State Reducers**: Verify all game actions produce correct state transitions
- **Utility Functions**: Test board operations, scoring calculations, and line clearing logic
- **Hook Behavior**: Test custom hooks in isolation with React Testing Library

### Integration Testing

- **Component Interactions**: Test communication between GameBoard and GameContainer
- **Game Flow**: Verify complete game sessions from start to game over
- **Input Handling**: Test keyboard controls and their effects on game state
- **State Persistence**: Ensure game state remains consistent across component re-renders

### Performance Testing

- **Frame Rate Monitoring**: Ensure consistent 60fps during gameplay
- **Memory Usage**: Monitor for memory leaks during extended play sessions
- **Input Responsiveness**: Verify input lag remains under 16ms
- **Rendering Optimization**: Test that only necessary components re-render on state changes

### Accessibility Testing

- **Keyboard Navigation**: Verify all game functions work with keyboard only
- **Screen Reader Support**: Test game state announcements and descriptions
- **Color Contrast**: Validate visual elements meet WCAG guidelines
- **Focus Management**: Ensure proper focus handling throughout the game

## Performance Optimizations

### Rendering Optimizations

- Use React.memo for components that don't need frequent re-renders
- Implement useMemo for expensive calculations (collision detection, line clearing)
- Optimize board rendering to only update changed cells
- Use CSS transforms for smooth piece animations

### State Management Optimizations

- Minimize state updates by batching related changes
- Use immutable updates with structural sharing
- Implement efficient board copying strategies
- Cache computed values that don't change frequently

### Game Loop Optimizations

- Use requestAnimationFrame for consistent timing
- Implement variable timestep for different game speeds
- Separate input processing from rendering updates
- Optimize collision detection algorithms for performance

### Memory Management

- Clean up event listeners and timers on component unmount
- Avoid creating new objects in render loops
- Implement object pooling for frequently created/destroyed objects
- Monitor and prevent memory leaks in game state management
