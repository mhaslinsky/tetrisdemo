import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Board, Tetromino, TetrominoType } from "@/types";
import { TETROMINO_COLORS, BOARD_WIDTH, BOARD_HEIGHT } from "@/constants/game";
import { findHardDropPosition } from "@/lib/collision";

interface GameBoardProps {
  board: Board;
  currentPiece?: Tetromino | null;
  className?: string;
  clearingLines?: number[];
  onLineClearAnimationComplete?: () => void;
  lastAction?: "move" | "rotate" | "drop" | "hard_drop" | null;
  isGameOver?: boolean;
  justLeveledUp?: boolean;
}

interface BlockProps {
  type: TetrominoType | null;
  isActive?: boolean;
  isClearing?: boolean;
  isDropping?: boolean;
  isHardDropping?: boolean;
  isLocking?: boolean;
  isRotating?: boolean;
  isGhost?: boolean;
  className?: string;
}

/**
 * Individual block component for rendering tetromino blocks
 * Memoized to prevent unnecessary re-renders
 */
const Block: React.FC<BlockProps> = React.memo(
  ({
    type,
    isActive = false,
    isClearing = false,
    isDropping = false,
    isHardDropping = false,
    isLocking = false,
    isRotating = false,
    isGhost = false,
    className = "",
  }) => {
    const blockClasses = useMemo(() => {
      const baseClasses = "w-full h-full border-2 transition-all duration-150";

      if (!type) {
        return `${baseClasses} bg-gray-900 border-gray-700 ${className}`;
      }

      const colorClasses = TETROMINO_COLORS[type];
      const activeClasses = isActive && !isGhost ? "brightness-110 shadow-lg scale-105" : "";
      const ghostClasses = isGhost ? "tetris-block-ghost relative" : "";
      const clearingClasses = isClearing ? "tetris-line-clear" : "";
      const droppingClasses = isDropping ? "animate-bounce" : "";
      const hardDropClasses = isHardDropping ? "tetris-hard-drop" : "";
      const lockingClasses = isLocking ? "tetris-piece-lock" : "";
      const rotatingClasses = isRotating ? "tetris-rotation" : "";

      return `${baseClasses} ${colorClasses} ${activeClasses} ${ghostClasses} ${clearingClasses} ${droppingClasses} ${hardDropClasses} ${lockingClasses} ${rotatingClasses} ${className}`;
    }, [type, isActive, isClearing, isDropping, isHardDropping, isLocking, isRotating, isGhost, className]);

    const testId = useMemo(() => {
      if (!type) return "empty-block";

      return `block-${type}${isActive ? "-active" : ""}${isGhost ? "-ghost" : ""}${isClearing ? "-clearing" : ""}${
        isDropping ? "-dropping" : ""
      }${isHardDropping ? "-hard-dropping" : ""}${isLocking ? "-locking" : ""}${isRotating ? "-rotating" : ""}`;
    }, [type, isActive, isGhost, isClearing, isDropping, isHardDropping, isLocking, isRotating]);

    return <div className={blockClasses} data-testid={testId} />;
  }
);

/**
 * Main game board component that renders the 10x20 Tetris grid
 * Memoized to prevent unnecessary re-renders when props haven't changed
 */
export const GameBoard: React.FC<GameBoardProps> = React.memo(
  ({
    board,
    currentPiece,
    className = "",
    clearingLines = [],
    onLineClearAnimationComplete,
    lastAction = null,
    isGameOver = false,
    justLeveledUp = false,
  }) => {
    const [animatingLines, setAnimatingLines] = useState<number[]>([]);
    const [pieceAnimation, setPieceAnimation] = useState<"move" | "rotate" | "drop" | "hard_drop" | null>(null);
    const [lockingPiece, setLockingPiece] = useState<boolean>(false);

    // Handle line clearing animation
    useEffect(() => {
      if (clearingLines.length > 0) {
        setAnimatingLines(clearingLines);

        // Clear animation after duration (match CSS animation)
        const timer = setTimeout(() => {
          setAnimatingLines([]);
          onLineClearAnimationComplete?.();
        }, 600); // Match lineClear animation duration

        return () => clearTimeout(timer);
      }
    }, [clearingLines, onLineClearAnimationComplete]);

    // Handle piece action animations
    useEffect(() => {
      if (lastAction && currentPiece) {
        setPieceAnimation(lastAction);

        // Handle piece locking animation
        if (lastAction === "drop") {
          setLockingPiece(true);
          const lockTimer = setTimeout(() => {
            setLockingPiece(false);
          }, 300); // Match pieceLock animation duration

          return () => clearTimeout(lockTimer);
        }

        // Clear animation after short duration
        const timer = setTimeout(
          () => {
            setPieceAnimation(null);
          },
          lastAction === "hard_drop" ? 200 : 200
        );

        return () => clearTimeout(timer);
      }
    }, [lastAction, currentPiece]);

    // Check if a line is being cleared
    const isLineClearing = useCallback(
      (row: number): boolean => {
        return animatingLines.includes(row);
      },
      [animatingLines]
    );

    // Check if a block is dropping (for soft drop animation)
    const isBlockDropping = useCallback(
      (row: number, col: number): boolean => {
        if (!currentPiece || pieceAnimation !== "drop") return false;

        const { shape, position } = currentPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol]
        );
      },
      [currentPiece, pieceAnimation]
    );

    // Check if a block is hard dropping
    const isBlockHardDropping = useCallback(
      (row: number, col: number): boolean => {
        if (!currentPiece || pieceAnimation !== "hard_drop") return false;

        const { shape, position } = currentPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol]
        );
      },
      [currentPiece, pieceAnimation]
    );

    // Check if a block is locking
    const isBlockLocking = useCallback(
      (row: number, col: number): boolean => {
        if (!currentPiece || !lockingPiece) return false;

        const { shape, position } = currentPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol]
        );
      },
      [currentPiece, lockingPiece]
    );

    // Check if a block is rotating
    const isBlockRotating = useCallback(
      (row: number, col: number): boolean => {
        if (!currentPiece || pieceAnimation !== "rotate") return false;

        const { shape, position } = currentPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol]
        );
      },
      [currentPiece, pieceAnimation]
    );
    // Calculate ghost piece position
    const ghostPiece = useMemo((): Tetromino | null => {
      if (!currentPiece) return null;
      return findHardDropPosition(board, currentPiece);
    }, [board, currentPiece]);

    // Memoize the combined board calculation to avoid expensive operations on every render
    const combinedBoard = useMemo((): (TetrominoType | null)[][] => {
      // Start with a copy of the current board
      const newBoard = board.map((row) => [...row]);

      // If there's a current piece, overlay it on the board
      if (currentPiece) {
        const { shape, position, type } = currentPiece;

        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
              const boardX = position.x + col;
              const boardY = position.y + row;

              // Only render blocks that are within the visible board
              if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                newBoard[boardY][boardX] = type;
              }
            }
          }
        }
      }

      return newBoard;
    }, [board, currentPiece]);

    // Memoize active block checker to avoid recalculating on every render
    const isActiveBlock = useCallback(
      (row: number, col: number): boolean => {
        if (!currentPiece) return false;

        const { shape, position } = currentPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol]
        );
      },
      [currentPiece]
    );

    // Check if a block is a ghost block (where piece would land)
    const isGhostBlock = useCallback(
      (row: number, col: number): boolean => {
        if (!ghostPiece || !currentPiece) return false;

        // Don't show ghost if it's at the same position as current piece
        if (ghostPiece.position.y === currentPiece.position.y) return false;

        const { shape, position } = ghostPiece;
        const relativeRow = row - position.y;
        const relativeCol = col - position.x;

        return (
          relativeRow >= 0 &&
          relativeRow < shape.length &&
          relativeCol >= 0 &&
          relativeCol < shape[relativeRow].length &&
          shape[relativeRow][relativeCol] &&
          !isActiveBlock(row, col) // Don't show ghost where current piece is
        );
      },
      [ghostPiece, currentPiece, isActiveBlock]
    );

    return (
      <div
        className={`
        inline-block 
        bg-gray-800 
        border-4 
        border-gray-600 
        rounded-lg 
        p-2
        shadow-2xl
        transition-all
        duration-300
        max-w-full
        ${isGameOver ? "tetris-game-over" : ""}
        ${justLeveledUp ? "animate-pulse" : ""}
        ${className}
      `}
        data-testid='game-board'
        role='grid'
        aria-label='Tetris game board'
        tabIndex={0}
      >
        <div className='bg-gray-700 p-1 rounded' data-testid='board-grid' role='presentation'>
          {combinedBoard.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className='flex gap-px' role='row' data-testid={`row-${rowIndex}`}>
              {row.map((cellType, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                  w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8
                  transition-all 
                  duration-200
                  ${isLineClearing(rowIndex) ? "animate-pulse scale-110" : ""}
                `}
                  data-testid={`cell-${rowIndex}-${colIndex}`}
                  role='gridcell'
                  aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}: ${
                    cellType ? `${cellType} block` : "empty"
                  }${isActiveBlock(rowIndex, colIndex) ? " (active piece)" : ""}`}
                >
                  <Block
                    type={cellType || (isGhostBlock(rowIndex, colIndex) ? ghostPiece?.type || null : null)}
                    isActive={isActiveBlock(rowIndex, colIndex)}
                    isGhost={isGhostBlock(rowIndex, colIndex)}
                    isClearing={isLineClearing(rowIndex)}
                    isDropping={isBlockDropping(rowIndex, colIndex)}
                    isHardDropping={isBlockHardDropping(rowIndex, colIndex)}
                    isLocking={isBlockLocking(rowIndex, colIndex)}
                    isRotating={isBlockRotating(rowIndex, colIndex)}
                    className='rounded-sm'
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

GameBoard.displayName = "GameBoard";

export default GameBoard;
