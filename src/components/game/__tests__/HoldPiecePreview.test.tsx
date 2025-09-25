import React from "react";
import { render, screen } from "@testing-library/react";
import { HoldPiecePreview } from "../HoldPiecePreview";
import type { Tetromino } from "@/types";

// Mock tetromino pieces for testing
const mockTPiece: Tetromino = {
  type: "T",
  shape: [
    [false, false, false, false],
    [false, true, false, false],
    [true, true, true, false],
    [false, false, false, false],
  ],
  position: { x: 4, y: 0 },
  rotation: 0,
};

const mockIPiece: Tetromino = {
  type: "I",
  shape: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  position: { x: 3, y: 0 },
  rotation: 0,
};

describe("HoldPiecePreview", () => {
  it("renders empty state when no piece is held", () => {
    render(<HoldPiecePreview piece={null} canHold={true} />);

    expect(screen.getByTestId("hold-piece-empty")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders the preview container when piece is held", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    expect(screen.getByTestId("hold-piece-preview")).toBeInTheDocument();
  });

  it("renders T-piece blocks correctly when can hold", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const tBlocks = screen.getAllByTestId("hold-block-T");
    expect(tBlocks).toHaveLength(4); // T-piece has 4 blocks
  });

  it("renders T-piece blocks as disabled when cannot hold", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={false} />);

    const disabledBlocks = screen.getAllByTestId("hold-block-T-disabled");
    expect(disabledBlocks).toHaveLength(4); // T-piece has 4 blocks
  });

  it("applies correct CSS classes for enabled T-piece", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const tBlocks = screen.getAllByTestId("hold-block-T");
    tBlocks.forEach((block) => {
      expect(block).toHaveClass("bg-tetris-purple", "border-tetris-purple");
      expect(block).not.toHaveClass("opacity-50", "grayscale");
    });
  });

  it("applies disabled styling when cannot hold", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={false} />);

    const disabledBlocks = screen.getAllByTestId("hold-block-T-disabled");
    disabledBlocks.forEach((block) => {
      expect(block).toHaveClass("opacity-50", "grayscale");
    });
  });

  it("shows USED indicator when cannot hold", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={false} />);

    expect(screen.getByText("USED")).toBeInTheDocument();
  });

  it("does not show USED indicator when can hold", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    expect(screen.queryByText("USED")).not.toBeInTheDocument();
  });

  it("renders I-piece blocks correctly", () => {
    render(<HoldPiecePreview piece={mockIPiece} canHold={true} />);

    const iBlocks = screen.getAllByTestId("hold-block-I");
    expect(iBlocks).toHaveLength(4); // I-piece has 4 blocks
  });

  it("applies correct CSS classes for I-piece", () => {
    render(<HoldPiecePreview piece={mockIPiece} canHold={true} />);

    const iBlocks = screen.getAllByTestId("hold-block-I");
    iBlocks.forEach((block) => {
      expect(block).toHaveClass("bg-tetris-cyan", "border-tetris-cyan");
    });
  });

  it("applies custom className", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} className='custom-class' />);

    expect(screen.getByTestId("hold-piece-preview")).toHaveClass("custom-class");
  });

  it("has correct dimensions", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const preview = screen.getByTestId("hold-piece-preview");
    expect(preview).toHaveClass("w-16", "h-16");
  });

  it("centers the piece in the preview area", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const preview = screen.getByTestId("hold-piece-preview");
    expect(preview).toHaveClass("flex", "items-center", "justify-center");
  });

  it("maintains consistent block size", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const blocks = screen.getAllByTestId("hold-block-T");
    blocks.forEach((block) => {
      expect(block).toHaveClass("w-4", "h-4");
    });
  });

  it("has proper styling for preview blocks", () => {
    render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    const blocks = screen.getAllByTestId("hold-block-T");
    blocks.forEach((block) => {
      expect(block).toHaveClass("border", "border-gray-600", "rounded-sm");
    });
  });

  it("transitions between can hold and cannot hold states", () => {
    const { rerender } = render(<HoldPiecePreview piece={mockTPiece} canHold={true} />);

    // Initially can hold
    expect(screen.getAllByTestId("hold-block-T")).toHaveLength(4);
    expect(screen.queryByText("USED")).not.toBeInTheDocument();

    // Switch to cannot hold
    rerender(<HoldPiecePreview piece={mockTPiece} canHold={false} />);
    expect(screen.getAllByTestId("hold-block-T-disabled")).toHaveLength(4);
    expect(screen.getByText("USED")).toBeInTheDocument();
  });

  it("transitions between empty and filled states", () => {
    const { rerender } = render(<HoldPiecePreview piece={null} canHold={true} />);

    // Initially empty
    expect(screen.getByTestId("hold-piece-empty")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();

    // Switch to filled
    rerender(<HoldPiecePreview piece={mockTPiece} canHold={true} />);
    expect(screen.getByTestId("hold-piece-preview")).toBeInTheDocument();
    expect(screen.getAllByTestId("hold-block-T")).toHaveLength(4);
  });
});
