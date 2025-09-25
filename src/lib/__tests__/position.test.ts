import {
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
} from "../position";
import type { Position } from "@/types";

describe("Position Utilities", () => {
  describe("createPosition", () => {
    it("should create position with correct coordinates", () => {
      const position = createPosition(5, 10);
      expect(position.x).toBe(5);
      expect(position.y).toBe(10);
    });

    it("should handle negative coordinates", () => {
      const position = createPosition(-3, -7);
      expect(position.x).toBe(-3);
      expect(position.y).toBe(-7);
    });

    it("should handle zero coordinates", () => {
      const position = createPosition(0, 0);
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe("addPositions", () => {
    it("should add two positions correctly", () => {
      const pos1 = createPosition(3, 4);
      const pos2 = createPosition(2, 1);
      const result = addPositions(pos1, pos2);

      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it("should handle negative coordinates", () => {
      const pos1 = createPosition(-2, 3);
      const pos2 = createPosition(5, -1);
      const result = addPositions(pos1, pos2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(2);
    });

    it("should not modify original positions", () => {
      const pos1 = createPosition(1, 2);
      const pos2 = createPosition(3, 4);
      const result = addPositions(pos1, pos2);

      expect(pos1.x).toBe(1);
      expect(pos1.y).toBe(2);
      expect(pos2.x).toBe(3);
      expect(pos2.y).toBe(4);
      expect(result).not.toBe(pos1);
      expect(result).not.toBe(pos2);
    });
  });

  describe("subtractPositions", () => {
    it("should subtract positions correctly", () => {
      const pos1 = createPosition(5, 7);
      const pos2 = createPosition(2, 3);
      const result = subtractPositions(pos1, pos2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it("should handle negative results", () => {
      const pos1 = createPosition(1, 2);
      const pos2 = createPosition(4, 6);
      const result = subtractPositions(pos1, pos2);

      expect(result.x).toBe(-3);
      expect(result.y).toBe(-4);
    });

    it("should not modify original positions", () => {
      const pos1 = createPosition(5, 5);
      const pos2 = createPosition(2, 2);
      const result = subtractPositions(pos1, pos2);

      expect(pos1.x).toBe(5);
      expect(pos1.y).toBe(5);
      expect(pos2.x).toBe(2);
      expect(pos2.y).toBe(2);
    });
  });

  describe("arePositionsEqual", () => {
    it("should return true for equal positions", () => {
      const pos1 = createPosition(3, 4);
      const pos2 = createPosition(3, 4);
      expect(arePositionsEqual(pos1, pos2)).toBe(true);
    });

    it("should return false for different x coordinates", () => {
      const pos1 = createPosition(3, 4);
      const pos2 = createPosition(5, 4);
      expect(arePositionsEqual(pos1, pos2)).toBe(false);
    });

    it("should return false for different y coordinates", () => {
      const pos1 = createPosition(3, 4);
      const pos2 = createPosition(3, 6);
      expect(arePositionsEqual(pos1, pos2)).toBe(false);
    });

    it("should handle negative coordinates", () => {
      const pos1 = createPosition(-2, -3);
      const pos2 = createPosition(-2, -3);
      expect(arePositionsEqual(pos1, pos2)).toBe(true);
    });
  });

  describe("clonePosition", () => {
    it("should create a copy with same coordinates", () => {
      const original = createPosition(7, 9);
      const clone = clonePosition(original);

      expect(clone.x).toBe(7);
      expect(clone.y).toBe(9);
    });

    it("should create a new object instance", () => {
      const original = createPosition(1, 2);
      const clone = clonePosition(original);

      expect(clone).not.toBe(original);
    });

    it("should not affect original when clone is modified", () => {
      const original = createPosition(5, 5);
      const clone = clonePosition(original);

      clone.x = 10;
      expect(original.x).toBe(5);
    });
  });

  describe("movePosition", () => {
    let position: Position;

    beforeEach(() => {
      position = createPosition(5, 5);
    });

    it("should move left correctly", () => {
      const result = movePosition(position, "left");
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
    });

    it("should move right correctly", () => {
      const result = movePosition(position, "right");
      expect(result.x).toBe(6);
      expect(result.y).toBe(5);
    });

    it("should move down correctly", () => {
      const result = movePosition(position, "down");
      expect(result.x).toBe(5);
      expect(result.y).toBe(6);
    });

    it("should move up correctly", () => {
      const result = movePosition(position, "up");
      expect(result.x).toBe(5);
      expect(result.y).toBe(4);
    });

    it("should handle custom distance", () => {
      const result = movePosition(position, "left", 3);
      expect(result.x).toBe(2);
      expect(result.y).toBe(5);
    });

    it("should not modify original position", () => {
      movePosition(position, "left");
      expect(position.x).toBe(5);
      expect(position.y).toBe(5);
    });

    it("should handle invalid direction gracefully", () => {
      // @ts-expect-error Testing invalid direction
      const result = movePosition(position, "invalid");
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });
  });

  describe("manhattanDistance", () => {
    it("should calculate distance correctly", () => {
      const pos1 = createPosition(0, 0);
      const pos2 = createPosition(3, 4);
      const distance = manhattanDistance(pos1, pos2);
      expect(distance).toBe(7); // |3-0| + |4-0| = 7
    });

    it("should handle negative coordinates", () => {
      const pos1 = createPosition(-2, -3);
      const pos2 = createPosition(1, 2);
      const distance = manhattanDistance(pos1, pos2);
      expect(distance).toBe(8); // |1-(-2)| + |2-(-3)| = 3 + 5 = 8
    });

    it("should return 0 for same position", () => {
      const pos1 = createPosition(5, 5);
      const pos2 = createPosition(5, 5);
      const distance = manhattanDistance(pos1, pos2);
      expect(distance).toBe(0);
    });
  });

  describe("euclideanDistance", () => {
    it("should calculate distance correctly", () => {
      const pos1 = createPosition(0, 0);
      const pos2 = createPosition(3, 4);
      const distance = euclideanDistance(pos1, pos2);
      expect(distance).toBe(5); // sqrt(3² + 4²) = 5
    });

    it("should handle negative coordinates", () => {
      const pos1 = createPosition(-1, -1);
      const pos2 = createPosition(2, 3);
      const distance = euclideanDistance(pos1, pos2);
      expect(distance).toBe(5); // sqrt(3² + 4²) = 5
    });

    it("should return 0 for same position", () => {
      const pos1 = createPosition(7, 8);
      const pos2 = createPosition(7, 8);
      const distance = euclideanDistance(pos1, pos2);
      expect(distance).toBe(0);
    });

    it("should handle decimal results", () => {
      const pos1 = createPosition(0, 0);
      const pos2 = createPosition(1, 1);
      const distance = euclideanDistance(pos1, pos2);
      expect(distance).toBeCloseTo(Math.sqrt(2), 5);
    });
  });

  describe("isPositionInBounds", () => {
    it("should return true for position within bounds", () => {
      const position = createPosition(5, 5);
      const result = isPositionInBounds(position, 0, 10, 0, 10);
      expect(result).toBe(true);
    });

    it("should return true for position on boundary", () => {
      const position = createPosition(0, 0);
      const result = isPositionInBounds(position, 0, 10, 0, 10);
      expect(result).toBe(true);
    });

    it("should return false for position outside x bounds", () => {
      const position = createPosition(15, 5);
      const result = isPositionInBounds(position, 0, 10, 0, 10);
      expect(result).toBe(false);
    });

    it("should return false for position outside y bounds", () => {
      const position = createPosition(5, 15);
      const result = isPositionInBounds(position, 0, 10, 0, 10);
      expect(result).toBe(false);
    });

    it("should handle negative bounds", () => {
      const position = createPosition(-5, -3);
      const result = isPositionInBounds(position, -10, 0, -5, 0);
      expect(result).toBe(true);
    });
  });

  describe("clampPosition", () => {
    it("should return same position when within bounds", () => {
      const position = createPosition(5, 5);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it("should clamp x coordinate to minimum", () => {
      const position = createPosition(-5, 5);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(0);
      expect(result.y).toBe(5);
    });

    it("should clamp x coordinate to maximum", () => {
      const position = createPosition(15, 5);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(10);
      expect(result.y).toBe(5);
    });

    it("should clamp y coordinate to minimum", () => {
      const position = createPosition(5, -5);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(5);
      expect(result.y).toBe(0);
    });

    it("should clamp y coordinate to maximum", () => {
      const position = createPosition(5, 15);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    it("should clamp both coordinates when necessary", () => {
      const position = createPosition(-5, 15);
      const result = clampPosition(position, 0, 10, 0, 10);
      expect(result.x).toBe(0);
      expect(result.y).toBe(10);
    });

    it("should not modify original position", () => {
      const position = createPosition(-5, 15);
      clampPosition(position, 0, 10, 0, 10);
      expect(position.x).toBe(-5);
      expect(position.y).toBe(15);
    });
  });
});
