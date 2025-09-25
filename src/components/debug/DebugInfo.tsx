import React from "react";
import type { GameState } from "@/types";

interface DebugInfoProps {
  gameState: GameState;
  isGameLoopRunning: boolean;
  canMovePiece: boolean;
  metrics?: {
    fps: number;
    averageFps: number;
    frameTime: number;
    renderTime: number;
    memoryUsage?: number;
  };
  isPerformancePoor?: boolean;
  warnings?: string[];
}

/**
 * Debug information component positioned at top-right of viewport
 * Only shown in development mode
 */
export const DebugInfo: React.FC<DebugInfoProps> = ({
  gameState,
  isGameLoopRunning,
  canMovePiece,
  metrics,
  isPerformancePoor,
  warnings = [],
}) => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg max-w-xs z-50 backdrop-blur-sm border border-gray-600">
      <div>Status: {gameState.gameStatus}</div>
      <div>Loop: {isGameLoopRunning ? "Running" : "Stopped"}</div>
      <div>Can Move: {canMovePiece ? "Yes" : "No"}</div>
      <div>Current Piece: {gameState.currentPiece?.type || "None"}</div>

      {metrics && (
        <>
          <div className="border-t border-gray-600 mt-2 pt-2">
            <div>FPS: {metrics.fps} (avg: {metrics.averageFps})</div>
            <div>Frame: {metrics.frameTime}ms</div>
            <div>Render: {metrics.renderTime}ms</div>
            {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage}MB</div>}
            {isPerformancePoor && <div className="text-red-400">⚠ Poor Performance</div>}
          </div>
        </>
      )}

      {warnings.length > 0 && (
        <div className="border-t border-gray-600 mt-2 pt-2">
          {warnings.map((warning, index) => (
            <div key={index} className="text-yellow-400 text-xs">
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};