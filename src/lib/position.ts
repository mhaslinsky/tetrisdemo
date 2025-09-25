import type { Position } from "@/types";

/**
 * Creates a new position object
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns A new Position object
 */
export function createPosition(x: number, y: number): Position {
  return { x, y };
}

/**
 * Adds two positions together
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns A new position with the sum of coordinates
 */
export function addPositions(pos1: Position, pos2: Position): Position {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y,
  };
}

/**
 * Subtracts the second position from the first
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns A new position with the difference of coordinates
 */
export function subtractPositions(pos1: Position, pos2: Position): Position {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y,
  };
}

/**
 * Checks if two positions are equal
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns true if positions are equal, false otherwise
 */
export function arePositionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Clones a position object
 * @param position - The position to clone
 * @returns A new position object with the same coordinates
 */
export function clonePosition(position: Position): Position {
  return { x: position.x, y: position.y };
}

/**
 * Moves a position in a given direction
 * @param position - The starting position
 * @param direction - The direction to move ('left', 'right', 'down', 'up')
 * @param distance - The distance to move (default: 1)
 * @returns A new position moved in the specified direction
 */
export function movePosition(
  position: Position,
  direction: "left" | "right" | "down" | "up",
  distance: number = 1
): Position {
  switch (direction) {
    case "left":
      return { x: position.x - distance, y: position.y };
    case "right":
      return { x: position.x + distance, y: position.y };
    case "down":
      return { x: position.x, y: position.y + distance };
    case "up":
      return { x: position.x, y: position.y - distance };
    default:
      return clonePosition(position);
  }
}

/**
 * Calculates the Manhattan distance between two positions
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns The Manhattan distance
 */
export function manhattanDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calculates the Euclidean distance between two positions
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns The Euclidean distance
 */
export function euclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a position is within given bounds
 * @param position - The position to check
 * @param minX - Minimum x coordinate
 * @param maxX - Maximum x coordinate
 * @param minY - Minimum y coordinate
 * @param maxY - Maximum y coordinate
 * @returns true if position is within bounds, false otherwise
 */
export function isPositionInBounds(
  position: Position,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): boolean {
  return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
}

/**
 * Clamps a position within given bounds
 * @param position - The position to clamp
 * @param minX - Minimum x coordinate
 * @param maxX - Maximum x coordinate
 * @param minY - Minimum y coordinate
 * @param maxY - Maximum y coordinate
 * @returns A new position clamped within the bounds
 */
export function clampPosition(
  position: Position,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): Position {
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}
