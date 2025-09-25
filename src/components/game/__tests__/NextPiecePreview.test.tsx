import React from "react";
import { render, screen } from "@testing-library/react";
import { NextPiecePreview } from "../NextPiecePreview";
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

const mockOPiece: Tetromino = {
  type: "O",
  shape: [
    [false, false, false, false],
    [false, true, true, false],
    [false, true, true, false],
    [false, false, false, false],
  ],
  position: { x: 4, y: 0 },
  rotation: 0,
};

describe("NextPiecePreview", () => {
  it("renders the preview container", () => {
    render(<NextPiecePreview piece={mockTPiece} />);
    expect(screen.getByTestId("next-piece-preview")).toBeInTheDocument();
  });

  it("renders T-piece blocks correctly", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const tBlocks = screen.getAllByTestId("preview-block-T");
    expect(tBlocks).toHaveLength(4); // T-piece has 4 blocks
  });

  it("renders I-piece blocks correctly", () => {
    render(<NextPiecePreview piece={mockIPiece} />);

    const iBlocks = screen.getAllByTestId("preview-block-I");
    expect(iBlocks).toHaveLength(4); // I-piece has 4 blocks
  });

  it("renders O-piece blocks correctly", () => {
    render(<NextPiecePreview piece={mockOPiece} />);

    const oBlocks = screen.getAllByTestId("preview-block-O");
    expect(oBlocks).toHaveLength(4); // O-piece has 4 blocks
  });

  it("applies correct CSS classes for T-piece", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const tBlocks = screen.getAllByTestId("preview-block-T");
    tBlocks.forEach((block) => {
      expect(block).toHaveClass("bg-tetris-purple", "border-tetris-purple");
    });
  });

  it("applies correct CSS classes for I-piece", () => {
    render(<NextPiecePreview piece={mockIPiece} />);

    const iBlocks = screen.getAllByTestId("preview-block-I");
    iBlocks.forEach((block) => {
      expect(block).toHaveClass("bg-tetris-cyan", "border-tetris-cyan");
    });
  });

  it("applies correct CSS classes for O-piece", () => {
    render(<NextPiecePreview piece={mockOPiece} />);

    const oBlocks = screen.getAllByTestId("preview-block-O");
    oBlocks.forEach((block) => {
      expect(block).toHaveClass("bg-tetris-yellow", "border-tetris-yellow");
    });
  });

  it("applies custom className", () => {
    render(<NextPiecePreview piece={mockTPiece} className='custom-class' />);

    expect(screen.getByTestId("next-piece-preview")).toHaveClass("custom-class");
  });

  it("has correct dimensions", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const preview = screen.getByTestId("next-piece-preview");
    expect(preview).toHaveClass("w-16", "h-16");
  });

  it("centers the piece in the preview area", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const preview = screen.getByTestId("next-piece-preview");
    expect(preview).toHaveClass("flex", "items-center", "justify-center");
  });

  it("renders different piece types with different colors", () => {
    const { rerender } = render(<NextPiecePreview piece={mockTPiece} />);

    // Check T-piece color
    let blocks = screen.getAllByTestId("preview-block-T");
    expect(blocks[0]).toHaveClass("bg-tetris-purple");

    // Switch to I-piece
    rerender(<NextPiecePreview piece={mockIPiece} />);
    blocks = screen.getAllByTestId("preview-block-I");
    expect(blocks[0]).toHaveClass("bg-tetris-cyan");

    // Switch to O-piece
    rerender(<NextPiecePreview piece={mockOPiece} />);
    blocks = screen.getAllByTestId("preview-block-O");
    expect(blocks[0]).toHaveClass("bg-tetris-yellow");
  });

  it("maintains consistent block size", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const blocks = screen.getAllByTestId("preview-block-T");
    blocks.forEach((block) => {
      expect(block).toHaveClass("w-4", "h-4");
    });
  });

  it("has proper styling for preview blocks", () => {
    render(<NextPiecePreview piece={mockTPiece} />);

    const blocks = screen.getAllByTestId("preview-block-T");
    blocks.forEach((block) => {
      expect(block).toHaveClass("border", "border-gray-600", "rounded-sm");
    });
  });
});
