import type { TetrominoType, GameConfig } from "@/types";

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Game timing
export const INITIAL_DROP_SPEED = 1000; // milliseconds
export const MIN_DROP_SPEED = 50; // milliseconds
export const LEVEL_UP_LINES = 10;

// Tetromino colors mapping
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: "bg-tetris-cyan border-tetris-cyan",
  O: "bg-tetris-yellow border-tetris-yellow",
  T: "bg-tetris-purple border-tetris-purple",
  S: "bg-tetris-green border-tetris-green",
  Z: "bg-tetris-red border-tetris-red",
  J: "bg-tetris-blue border-tetris-blue",
  L: "bg-tetris-orange border-tetris-orange",
};

// Scoring system
export const SCORING = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
} as const;

// Game configuration
export const GAME_CONFIG: GameConfig = {
  boardWidth: BOARD_WIDTH,
  boardHeight: BOARD_HEIGHT,
  dropSpeed: INITIAL_DROP_SPEED,
  levelUpLines: LEVEL_UP_LINES,
  scoring: {
    single: SCORING.SINGLE,
    double: SCORING.DOUBLE,
    triple: SCORING.TRIPLE,
    tetris: SCORING.TETRIS,
    softDrop: SCORING.SOFT_DROP,
    hardDrop: SCORING.HARD_DROP,
  },
};

// Tetromino shapes with all rotation states
// Each shape is represented as a 4x4 boolean matrix for each rotation (0, 90, 180, 270 degrees)
export const TETROMINO_SHAPES: Record<TetrominoType, boolean[][][]> = {
  I: [
    // 0 degrees
    [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
    ],
    // 270 degrees
    [
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
    ],
  ],
  O: [
    // All rotations are the same for O piece
    [
      [false, false, false, false],
      [false, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
    [
      [false, false, false, false],
      [false, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
    [
      [false, false, false, false],
      [false, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
    [
      [false, false, false, false],
      [false, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
  ],
  T: [
    // 0 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [true, true, true, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [false, true, true, false],
      [false, true, false, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, false],
      [false, true, false, false],
    ],
    // 270 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [true, true, false, false],
      [false, true, false, false],
    ],
  ],
  S: [
    // 0 degrees
    [
      [false, false, false, false],
      [false, true, true, false],
      [true, true, false, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [false, true, true, false],
      [false, false, true, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [false, true, true, false],
      [true, true, false, false],
    ],
    // 270 degrees
    [
      [false, false, false, false],
      [true, false, false, false],
      [true, true, false, false],
      [false, true, false, false],
    ],
  ],
  Z: [
    // 0 degrees
    [
      [false, false, false, false],
      [true, true, false, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, false, false],
      [false, false, true, false],
      [false, true, true, false],
      [false, true, false, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, false, false],
      [false, true, true, false],
    ],
    // 270 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [true, true, false, false],
      [true, false, false, false],
    ],
  ],
  J: [
    // 0 degrees
    [
      [false, false, false, false],
      [true, false, false, false],
      [true, true, true, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, false, false],
      [false, true, true, false],
      [false, true, false, false],
      [false, true, false, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, false],
      [false, false, true, false],
    ],
    // 270 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [true, true, false, false],
    ],
  ],
  L: [
    // 0 degrees
    [
      [false, false, false, false],
      [false, false, true, false],
      [true, true, true, false],
      [false, false, false, false],
    ],
    // 90 degrees
    [
      [false, false, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, true, true, false],
    ],
    // 180 degrees
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, false],
      [true, false, false, false],
    ],
    // 270 degrees
    [
      [false, false, false, false],
      [true, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
    ],
  ],
};

// Key mappings
export const GAME_KEYS = {
  MOVE_LEFT: "ArrowLeft",
  MOVE_RIGHT: "ArrowRight",
  SOFT_DROP: "ArrowDown",
  ROTATE: "ArrowUp",
  HARD_DROP: " ", // Spacebar
  HOLD: "KeyC",
  PAUSE: "KeyP",
  RESTART: "KeyR",
} as const;
