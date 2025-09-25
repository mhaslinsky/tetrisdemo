// Core game types for Tetris

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: boolean[][];
  position: Position;
  rotation: number;
}

export type Board = (TetrominoType | null)[][];

export type GameStatus = "ready" | "playing" | "paused" | "gameOver";

export type AnimationType = "move" | "rotate" | "drop" | "hard_drop" | null;

export interface AnimationState {
  lastAction: AnimationType;
  clearingLines: number[];
  isAnimating: boolean;
}

export interface GameState {
  board: Board;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino;
  heldPiece: Tetromino | null;
  canHold: boolean;
  score: number;
  level: number;
  linesCleared: number;
  gameStatus: GameStatus;
  dropTimer: number;
  lastDropTime: number;
  animation: AnimationState;
}

export type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_DOWN" }
  | { type: "ROTATE" }
  | { type: "HARD_DROP" }
  | { type: "HOLD_PIECE" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "RESTART_GAME" }
  | { type: "GAME_TICK" }
  | { type: "LOCK_PIECE" }
  | { type: "SPAWN_PIECE" }
  | { type: "CLEAR_LINES"; payload: { linesCleared: number } }
  | { type: "START_LINE_CLEAR_ANIMATION"; payload: { lines: number[] } }
  | { type: "END_LINE_CLEAR_ANIMATION" }
  | { type: "SET_LAST_ACTION"; payload: { action: AnimationType } };

export interface GameStats {
  score: number;
  level: number;
  linesCleared: number;
  totalPieces: number;
}

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  dropSpeed: number;
  levelUpLines: number;
  scoring: {
    single: number;
    double: number;
    triple: number;
    tetris: number;
    softDrop: number;
    hardDrop: number;
  };
}
