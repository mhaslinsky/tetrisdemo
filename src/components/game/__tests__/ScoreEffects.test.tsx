import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ScoreEffects } from "../ScoreEffects";

describe("ScoreEffects", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders without crashing", () => {
    render(<ScoreEffects />);
    expect(screen.getByTestId("score-effects")).toBeInTheDocument();
  });

  it("shows level up animation when justLeveledUp is true", () => {
    render(<ScoreEffects currentLevel={2} justLeveledUp={true} />);

    const levelUpEffect = screen.getByTestId("level-up-effect");
    expect(levelUpEffect).toBeInTheDocument();
    expect(screen.getByText("LEVEL 2!")).toBeInTheDocument();
  });

  it("hides level up animation after timeout", () => {
    render(<ScoreEffects currentLevel={2} justLeveledUp={true} />);

    expect(screen.getByTestId("level-up-effect")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByTestId("level-up-effect")).not.toBeInTheDocument();
  });

  it("shows score popup for single line clear", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    rerender(<ScoreEffects lastScore={100} linesCleared={1} />);

    expect(screen.getByTestId("score-popup-single")).toBeInTheDocument();
    expect(screen.getByText("+100")).toBeInTheDocument();
  });

  it("shows score popup for tetris", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    rerender(<ScoreEffects lastScore={800} linesCleared={4} />);

    expect(screen.getByTestId("score-popup-tetris")).toBeInTheDocument();
    expect(screen.getByText("TETRIS! +800")).toBeInTheDocument();
  });

  it("shows score popup for triple line clear", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    rerender(<ScoreEffects lastScore={500} linesCleared={3} />);

    expect(screen.getByTestId("score-popup-triple")).toBeInTheDocument();
    expect(screen.getByText("TRIPLE! +500")).toBeInTheDocument();
  });

  it("shows score popup for double line clear", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    rerender(<ScoreEffects lastScore={300} linesCleared={2} />);

    expect(screen.getByTestId("score-popup-double")).toBeInTheDocument();
    expect(screen.getByText("DOUBLE! +300")).toBeInTheDocument();
  });

  it("removes score popup after timeout", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    rerender(<ScoreEffects lastScore={100} linesCleared={1} />);

    expect(screen.getByTestId("score-popup-single")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(screen.queryByTestId("score-popup-single")).not.toBeInTheDocument();
  });

  it("handles multiple score popups", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    // First score
    rerender(<ScoreEffects lastScore={100} linesCleared={1} />);
    expect(screen.getByTestId("score-popup-single")).toBeInTheDocument();

    // Second score (simulate rapid scoring)
    rerender(<ScoreEffects lastScore={200} linesCleared={1} />);

    // Should have multiple popups
    const popups = screen.getAllByText(/^\+\d+$/);
    expect(popups.length).toBeGreaterThan(0);
  });

  it("does not show level up animation when justLeveledUp is false", () => {
    render(<ScoreEffects currentLevel={2} justLeveledUp={false} />);

    expect(screen.queryByTestId("level-up-effect")).not.toBeInTheDocument();
  });

  it("does not show score popup when lastScore is 0", () => {
    render(<ScoreEffects lastScore={0} linesCleared={1} />);

    expect(screen.queryByTestId("score-popup-single")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes for different score types", () => {
    const { rerender } = render(<ScoreEffects lastScore={0} linesCleared={0} />);

    // Test tetris styling
    rerender(<ScoreEffects lastScore={800} linesCleared={4} />);
    const tetrisPopup = screen.getByTestId("score-popup-tetris");
    expect(tetrisPopup).toHaveClass("text-yellow-400", "text-2xl", "font-bold");

    // Clean up and test single line styling
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    rerender(<ScoreEffects lastScore={100} linesCleared={1} />);
    const singlePopup = screen.getByTestId("score-popup-single");
    expect(singlePopup).toHaveClass("text-blue-400", "text-base", "font-normal");
  });

  it("handles level up animation with correct styling", () => {
    render(<ScoreEffects currentLevel={5} justLeveledUp={true} />);

    const levelUpEffect = screen.getByTestId("level-up-effect");
    const levelText = screen.getByText("LEVEL 5!");

    expect(levelText).toHaveClass("tetris-level-up", "text-4xl", "font-bold", "text-yellow-400");
  });
});
