import React from "react";
import type { Tetromino, TetrominoType } from "@/types";
import { TETROMINO_COLORS, TETROMINO_SHAPES } from "@/constants/game";

interface NextPiecePreviewProps {
  piece: Tetromino;
  className?: string;
}

interface PreviewBlockProps {
  type: TetrominoType | null;
  className?: string;
}

/**
 * Individual block component for preview rendering
 * Memoized to prevent unnecessary re-renders
 */
const PreviewBlock: React.FC<PreviewBlockProps> = React.memo(({ type, className = "" }) => {
  const baseClasses = "w-4 h-4 border border-gray-600 rounded-sm";

  if (!type) {
    return <div className={`${baseClasses} bg-transparent ${className}`} />;
  }

  const colorClasses = TETROMINO_COLORS[type];

  return <div className={`${baseClasses} ${colorClasses} ${className}`} data-testid={`preview-block-${type}`} />;
});

/**
 * Component for displaying the next tetromino piece in a preview grid
 * Memoized to prevent unnecessary re-renders when piece hasn't changed
 */
export const NextPiecePreview: React.FC<NextPiecePreviewProps> = React.memo(({ piece, className = "" }) => {
  if (!piece) {
    return (
      <div
        className={`w-16 h-16 bg-gray-900 rounded border border-gray-600 ${className}`}
        data-testid='next-piece-empty'
        role='img'
        aria-label='No next piece available'
      >
        <div className='flex items-center justify-center h-full text-gray-500 text-xs'>No piece</div>
      </div>
    );
  }

  // Memoize the trimmed shape calculation to avoid expensive operations
  const trimmedShape = React.useMemo(() => {
    // Get the shape for the current rotation (always show rotation 0 for preview)
    const shape = TETROMINO_SHAPES[piece.type][0];

    // Find the bounding box of the piece to center it properly
    let minRow = shape.length,
      maxRow = -1,
      minCol = shape[0].length,
      maxCol = -1;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    // Create a trimmed shape that only includes the actual piece
    const result: boolean[][] = [];
    for (let row = minRow; row <= maxRow; row++) {
      const trimmedRow: boolean[] = [];
      for (let col = minCol; col <= maxCol; col++) {
        trimmedRow.push(shape[row][col]);
      }
      result.push(trimmedRow);
    }

    return result;
  }, [piece.type]);

  return (
    <div
      className={`flex items-center justify-center w-16 h-16 bg-gray-900 rounded border border-gray-600 ${className}`}
      data-testid='next-piece-preview'
      role='img'
      aria-label={`Next piece: ${piece.type} tetromino`}
    >
      <div
        className='grid gap-px'
        style={{
          gridTemplateColumns: `repeat(${trimmedShape[0]?.length || 1}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${trimmedShape.length}, minmax(0, 1fr))`,
        }}
      >
        {trimmedShape.map((row, rowIndex) =>
          row.map((hasBlock, colIndex) => (
            <PreviewBlock key={`${rowIndex}-${colIndex}`} type={hasBlock ? piece.type : null} />
          ))
        )}
      </div>
    </div>
  );
});

NextPiecePreview.displayName = "NextPiecePreview";

export default NextPiecePreview;
