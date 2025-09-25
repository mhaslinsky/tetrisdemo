import React, { useEffect, useState } from "react";

interface ScoreEffectsProps {
  lastScore?: number;
  currentLevel?: number;
  justLeveledUp?: boolean;
  linesCleared?: number;
  className?: string;
}

interface ScorePopup {
  id: string;
  points: number;
  type: "single" | "double" | "triple" | "tetris" | "drop";
  timestamp: number;
}

/**
 * Component that shows animated score effects and level up notifications
 */
export const ScoreEffects: React.FC<ScoreEffectsProps> = ({
  lastScore = 0,
  currentLevel = 1,
  justLeveledUp = false,
  linesCleared = 0,
  className = "",
}) => {
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Handle level up animation
  useEffect(() => {
    if (justLeveledUp) {
      setShowLevelUp(true);
      const timer = setTimeout(() => {
        setShowLevelUp(false);
      }, 2000); // Show for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [justLeveledUp]);

  // Handle score popup animations
  useEffect(() => {
    if (lastScore > 0) {
      const popup: ScorePopup = {
        id: `score-${Date.now()}`,
        points: lastScore,
        type: getScoreType(linesCleared),
        timestamp: Date.now(),
      };

      setScorePopups((prev) => [...prev, popup]);

      // Remove popup after animation
      const timer = setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== popup.id));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [lastScore, linesCleared]);

  const getScoreType = (lines: number): ScorePopup["type"] => {
    switch (lines) {
      case 1:
        return "single";
      case 2:
        return "double";
      case 3:
        return "triple";
      case 4:
        return "tetris";
      default:
        return "drop";
    }
  };

  const getScorePopupStyle = (type: ScorePopup["type"]) => {
    switch (type) {
      case "tetris":
        return "text-yellow-400 text-2xl font-bold animate-bounce";
      case "triple":
        return "text-orange-400 text-xl font-semibold animate-pulse";
      case "double":
        return "text-green-400 text-lg font-medium animate-ping";
      case "single":
        return "text-blue-400 text-base font-normal animate-fade-in";
      case "drop":
        return "text-gray-400 text-sm animate-fade-in";
      default:
        return "text-white animate-fade-in";
    }
  };

  const getScoreText = (popup: ScorePopup) => {
    switch (popup.type) {
      case "tetris":
        return `TETRIS! +${popup.points}`;
      case "triple":
        return `TRIPLE! +${popup.points}`;
      case "double":
        return `DOUBLE! +${popup.points}`;
      case "single":
        return `+${popup.points}`;
      case "drop":
        return `+${popup.points}`;
      default:
        return `+${popup.points}`;
    }
  };

  return (
    <div className={`relative ${className}`} data-testid='score-effects'>
      {/* Level Up Animation */}
      {showLevelUp && (
        <div
          className='absolute top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none'
          data-testid='level-up-effect'
        >
          <div className='tetris-level-up text-4xl font-bold text-yellow-400 bg-black bg-opacity-80 px-6 py-3 rounded-lg border-2 border-yellow-400'>
            LEVEL {currentLevel}!
          </div>
        </div>
      )}

      {/* Score Popups */}
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none z-10'>
        {scorePopups.map((popup, index) => (
          <div
            key={popup.id}
            className={`
              absolute 
              top-4 
              left-4 
              transform 
              -translate-y-2
              ${getScorePopupStyle(popup.type)}
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateY(-${index * 30}px)`,
            }}
            data-testid={`score-popup-${popup.type}`}
          >
            {getScoreText(popup)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreEffects;
