import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HelpModal } from "../HelpModal";

describe("HelpModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("does not render when isOpen is false", () => {
    render(<HelpModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText("Game Help & Instructions")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Game Help & Instructions")).toBeInTheDocument();
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.getByText("Controls")).toBeInTheDocument();
    expect(screen.getByText("Scoring System")).toBeInTheDocument();
    expect(screen.getByText("Strategy Tips")).toBeInTheDocument();
    expect(screen.getByText("Accessibility Features")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Close help modal");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when 'Got it, let's play!' button is clicked", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    const playButton = screen.getByText("Got it, let's play!");
    fireEvent.click(playButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    // Click on the backdrop (the outer div with the backdrop click handler)
    const backdrop = screen.getByText("Game Help & Instructions").closest('[class*="fixed inset-0"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("displays all control sections", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    // Check for movement controls
    expect(screen.getByText("Move Left:")).toBeInTheDocument();
    expect(screen.getByText("Move Right:")).toBeInTheDocument();
    expect(screen.getAllByText("Soft Drop:")).toHaveLength(2); // Appears in both movement and scoring
    expect(screen.getAllByText("Hard Drop:")).toHaveLength(2); // Appears in both movement and scoring

    // Check for game controls
    expect(screen.getByText("Rotate:")).toBeInTheDocument();
    expect(screen.getByText("Hold Piece:")).toBeInTheDocument();
    expect(screen.getByText("Pause:")).toBeInTheDocument();
    expect(screen.getByText("Restart:")).toBeInTheDocument();
  });

  it("displays scoring information", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Single Line:")).toBeInTheDocument();
    expect(screen.getByText("Double Lines:")).toBeInTheDocument();
    expect(screen.getByText("Triple Lines:")).toBeInTheDocument();
    expect(screen.getByText("Tetris (4 Lines):")).toBeInTheDocument();
    expect(screen.getByText("100 × Level")).toBeInTheDocument();
    expect(screen.getByText("300 × Level")).toBeInTheDocument();
    expect(screen.getByText("500 × Level")).toBeInTheDocument();
    expect(screen.getByText("800 × Level")).toBeInTheDocument();
  });

  it("displays strategy tips", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Keep the board as flat as possible/)).toBeInTheDocument();
    expect(screen.getByText(/Save I-pieces/)).toBeInTheDocument();
    expect(screen.getByText(/Use the hold feature strategically/)).toBeInTheDocument();
  });

  it("displays accessibility features", () => {
    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Full keyboard navigation support/)).toBeInTheDocument();
    expect(screen.getByText(/Screen reader announcements/)).toBeInTheDocument();
    expect(screen.getByText(/High contrast color scheme/)).toBeInTheDocument();
  });
});
