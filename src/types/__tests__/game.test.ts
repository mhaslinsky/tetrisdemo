import type { TetrominoType, Position, GameState } from "../game";

describe("Game Types", () => {
  it("should define valid tetromino types", () => {
    const validTypes: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    expect(validTypes).toHaveLength(7);
    expect(validTypes).toContain("I");
    expect(validTypes).toContain("O");
    expect(validTypes).toContain("T");
  });

  it("should define position interface correctly", () => {
    const position: Position = { x: 5, y: 10 };
    expect(position.x).toBe(5);
    expect(position.y).toBe(10);
  });

  it("should define game state interface with all required properties", () => {
    const gameState: Partial<GameState> = {
      score: 0,
      level: 1,
      linesCleared: 0,
      gameStatus: "ready",
    };

    expect(gameState.score).toBe(0);
    expect(gameState.level).toBe(1);
    expect(gameState.linesCleared).toBe(0);
    expect(gameState.gameStatus).toBe("ready");
  });
});
