// Board utilities
export {
  createEmptyBoard,
  isValidPosition,
  placePiece,
  isRowComplete,
  findCompleteRows,
  clearLines,
  isGameOver,
  getColumnHeights,
} from "./board";

// Position utilities
export {
  createPosition,
  addPositions,
  subtractPositions,
  arePositionsEqual,
  clonePosition,
  movePosition,
  manhattanDistance,
  euclideanDistance,
  isPositionInBounds,
  clampPosition,
} from "./position";

// Collision detection utilities
export {
  checkBoundaryCollision,
  checkBlockCollision,
  hasCollision,
  getWallKickOffsets,
  createRotatedPiece,
  attemptRotation,
  canMovePiece,
  findHardDropPosition,
  canSpawnPiece,
} from "./collision";

// Game state management
export {
  createRandomTetromino,
  createInitialGameState,
  isValidStateTransition,
  gameStateReducer,
} from "./gameState";

// Scoring system
export {
  calculateLineScore,
  calculateLevel,
  calculateDropSpeed,
  calculateSoftDropScore,
  calculateHardDropScore,
  processLineClearing,
  getLineClearName,
  validateScoreCalculation,
} from "./scoring";

// Movement and rotation logic
export {
  movePiece,
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  rotatePiece,
  rotatePieceCounterclockwise,
  hardDropPiece,
  canPieceMoveAnywhere,
  shouldLockPiece,
  getValidMoves,
  getGhostPiece,
} from "./movement";

// Performance monitoring utilities
export {
  PerformanceMonitor,
  performanceMonitor,
  usePerformanceMonitor,
  withPerformanceMonitoring,
  measureExecutionTime,
  debounce,
  throttle,
} from "./performance";

export type { PerformanceMetrics, PerformanceConfig } from "./performance";
