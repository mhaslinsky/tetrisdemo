import React, { useEffect, useState } from "react";
import type { AnimationType } from "@/types";

interface ActionFeedbackProps {
  lastAction: AnimationType;
  className?: string;
}

/**
 * Component that provides visual feedback for user actions
 */
export const ActionFeedback: React.FC<ActionFeedbackProps> = ({ lastAction, className = "" }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (lastAction) {
      setShowFeedback(true);

      switch (lastAction) {
        case "move":
          setFeedbackText("MOVE");
          break;
        case "rotate":
          setFeedbackText("ROTATE");
          break;
        case "drop":
          setFeedbackText("SOFT DROP");
          break;
        case "hard_drop":
          setFeedbackText("HARD DROP!");
          break;
        default:
          setFeedbackText("");
      }

      // Hide feedback after animation duration
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  if (!showFeedback || !feedbackText) {
    return null;
  }

  const getFeedbackStyle = () => {
    switch (lastAction) {
      case "hard_drop":
        return "bg-red-600 animate-pulse scale-110";
      case "rotate":
        return "bg-purple-600 animate-spin";
      case "drop":
        return "bg-yellow-600 animate-bounce";
      case "move":
      default:
        return "bg-blue-600 animate-bounce";
    }
  };

  return (
    <div
      className={`
        absolute 
        top-4 
        right-4 
        text-white 
        px-3 
        py-1 
        rounded-lg 
        text-sm 
        font-bold 
        shadow-lg
        z-10
        transition-all
        duration-200
        ${getFeedbackStyle()}
        ${className}
      `}
      data-testid='action-feedback'
    >
      {feedbackText}
    </div>
  );
};

export default ActionFeedback;
