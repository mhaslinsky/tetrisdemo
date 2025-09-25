import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameInstructions } from "../GameInstructions";

describe("GameInstructions", () => {
  it("renders with collapsed state by default", () => {
    render(<GameInstructions />);

    expect(screen.getByText("Game Instructions")).toBeInTheDocument();
    expect(screen.queryByText("Controls")).not.toBeInTheDocument();
  });

  it("expands when clicked", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText("Controls")).toBeInTheDocument();
    expect(screen.getByText("Scoring")).toBeInTheDocument();
    expect(screen.getByText("Game Rules")).toBeInTheDocument();
  });

  it("collapses when clicked again", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });

    // Expand
    fireEvent.click(toggleButton);
    expect(screen.getByText("Controls")).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText("Controls")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(toggleButton).toHaveAttribute("aria-controls", "game-instructions-content");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
  });

  it("displays all control mappings when expanded", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });
    fireEvent.click(toggleButton);

    // Check for key controls
    expect(screen.getByText("Move Left:")).toBeInTheDocument();
    expect(screen.getByText("Move Right:")).toBeInTheDocument();
    expect(screen.getAllByText("Soft Drop:")).toHaveLength(2); // Appears in controls and scoring
    expect(screen.getByText("Rotate:")).toBeInTheDocument();
    expect(screen.getAllByText("Hard Drop:")).toHaveLength(2); // Appears in controls and scoring
    expect(screen.getByText("Hold Piece:")).toBeInTheDocument();
    expect(screen.getByText("Pause:")).toBeInTheDocument();
    expect(screen.getByText("Restart:")).toBeInTheDocument();
  });

  it("displays scoring information when expanded", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText("Single Line:")).toBeInTheDocument();
    expect(screen.getByText("100 × Level")).toBeInTheDocument();
    expect(screen.getByText("Tetris (4 Lines):")).toBeInTheDocument();
    expect(screen.getByText("800 × Level")).toBeInTheDocument();
  });

  it("displays tetromino pieces information", () => {
    render(<GameInstructions />);

    const toggleButton = screen.getByRole("button", { name: /game instructions/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText("Tetromino Pieces")).toBeInTheDocument();
    expect(screen.getByText("Line Piece")).toBeInTheDocument();
    expect(screen.getByText("Square")).toBeInTheDocument();
    expect(screen.getByText("T-Shape")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<GameInstructions className='custom-class' />);

    const container = screen.getByRole("button", { name: /game instructions/i }).closest("div");
    expect(container).toHaveClass("custom-class");
  });
});
