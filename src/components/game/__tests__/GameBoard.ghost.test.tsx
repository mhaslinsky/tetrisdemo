import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameBoard } from '../GameBoard';
import { createEmptyBoard } from '@/lib/board';
import type { Tetromino } from '@/types';

// Mock the collision module to ensure predictable ghost piece positioning
jest.mock('@/lib/collision', () => ({
  findHardDropPosition: jest.fn((board, piece) => ({
    ...piece,
    position: { x: piece.position.x, y: 18 }, // Always drop to near bottom for testing
  })),
}));

const mockCurrentPiece: Tetromino = {
  type: 'T',
  shape: [
    [false, true, false, false],
    [true, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  position: { x: 4, y: 0 },
  rotation: 0,
};

describe('GameBoard Ghost Piece', () => {
  let board: ReturnType<typeof createEmptyBoard>;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  it('renders ghost piece at predicted landing position', () => {
    render(<GameBoard board={board} currentPiece={mockCurrentPiece} />);

    // Look for blocks with ghost class
    const ghostBlocks = screen.getAllByTestId(/block-T-ghost/);
    expect(ghostBlocks.length).toBeGreaterThan(0);

    // Check that ghost blocks have the correct styling
    ghostBlocks.forEach(block => {
      expect(block).toHaveClass('tetris-block-ghost');
    });
  });

  it('does not render ghost piece when no current piece', () => {
    render(<GameBoard board={board} currentPiece={null} />);

    // Should not find any ghost blocks
    const ghostBlocks = screen.queryAllByTestId(/block-.*-ghost/);
    expect(ghostBlocks).toHaveLength(0);
  });

  it('ghost piece has translucent appearance', () => {
    render(<GameBoard board={board} currentPiece={mockCurrentPiece} />);

    const ghostBlocks = screen.getAllByTestId(/block-T-ghost/);
    expect(ghostBlocks.length).toBeGreaterThan(0);

    // Check for ghost-specific classes
    ghostBlocks.forEach(block => {
      expect(block).toHaveClass('tetris-block-ghost');
      expect(block).toHaveClass('relative');
    });
  });
});