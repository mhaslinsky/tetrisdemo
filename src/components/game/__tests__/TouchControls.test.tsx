import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TouchControls } from "../TouchControls";
import type { GameAction } from "@/types";

// Mock touch events
const createTouchEvent = (type: string, touches: Touch[] = []) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: touches,
    writable: false,
  });
  return event;
};

const createTouch = (identifier: number, target: Element, clientX = 0, clientY = 0): Touch => {
  return {
    identifier,
    target,
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  };
};

describe("TouchControls", () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  describe("Rendering", () => {
    it("renders all touch control buttons", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      expect(screen.getByTestId("touch-button-move-left")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-move-right")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-rotate-piece")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-soft-drop")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-hard-drop")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-hold-piece")).toBeInTheDocument();
      expect(screen.getByTestId("touch-button-pause-game")).toBeInTheDocument();
    });

    it("displays correct button labels and icons", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("→")).toBeInTheDocument();
      expect(screen.getByText("↻")).toBeInTheDocument();
      expect(screen.getByText("↓")).toBeInTheDocument();
      expect(screen.getByText("⇓")).toBeInTheDocument();
      expect(screen.getByText("HOLD")).toBeInTheDocument();
      expect(screen.getByText("PAUSE")).toBeInTheDocument();
    });

    it("shows instructions for touch controls", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      expect(screen.getByText("Touch and hold movement buttons for continuous action")).toBeInTheDocument();
    });
  });

  describe("Touch Interactions", () => {
    it("handles touch start and end for move left", async () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const leftButton = screen.getByTestId("touch-button-move-left");
      const touch = createTouch(1, leftButton);

      fireEvent(leftButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_LEFT" });

      fireEvent(leftButton, createTouchEvent("touchend", []));
    });

    it("handles touch start and end for move right", async () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const rightButton = screen.getByTestId("touch-button-move-right");
      const touch = createTouch(1, rightButton);

      fireEvent(rightButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_RIGHT" });

      fireEvent(rightButton, createTouchEvent("touchend", []));
    });

    it("handles rotate action", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const rotateButton = screen.getByTestId("touch-button-rotate-piece");
      const touch = createTouch(1, rotateButton);

      fireEvent(rotateButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "ROTATE" });
    });

    it("handles soft drop action", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const softDropButton = screen.getByTestId("touch-button-soft-drop");
      const touch = createTouch(1, softDropButton);

      fireEvent(softDropButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_DOWN" });
    });

    it("handles hard drop action", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const hardDropButton = screen.getByTestId("touch-button-hard-drop");
      const touch = createTouch(1, hardDropButton);

      fireEvent(hardDropButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "HARD_DROP" });
    });

    it("handles hold piece action", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const holdButton = screen.getByTestId("touch-button-hold-piece");
      const touch = createTouch(1, holdButton);

      fireEvent(holdButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "HOLD_PIECE" });
    });

    it("handles pause action", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const pauseButton = screen.getByTestId("touch-button-pause-game");
      const touch = createTouch(1, pauseButton);

      fireEvent(pauseButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledWith({ type: "PAUSE_GAME" });
    });
  });

  describe("Mouse Interactions", () => {
    it("handles mouse events as fallback", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const leftButton = screen.getByTestId("touch-button-move-left");

      fireEvent.mouseDown(leftButton);
      expect(mockOnAction).toHaveBeenCalledWith({ type: "MOVE_LEFT" });

      fireEvent.mouseUp(leftButton);
    });

    it("handles mouse leave to stop continuous actions", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const leftButton = screen.getByTestId("touch-button-move-left");

      fireEvent.mouseDown(leftButton);
      fireEvent.mouseLeave(leftButton);

      // Should not continue calling the action after mouse leave
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled State", () => {
    it("disables game action buttons when game is not active", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={false} />);

      const leftButton = screen.getByTestId("touch-button-move-left");
      const rotateButton = screen.getByTestId("touch-button-rotate-piece");
      const hardDropButton = screen.getByTestId("touch-button-hard-drop");

      expect(leftButton).toBeDisabled();
      expect(rotateButton).toBeDisabled();
      expect(hardDropButton).toBeDisabled();
    });

    it("keeps pause button enabled when game is not active", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={false} />);

      const pauseButton = screen.getByTestId("touch-button-pause-game");
      expect(pauseButton).not.toBeDisabled();
    });

    it("does not trigger actions when buttons are disabled", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={false} />);

      const leftButton = screen.getByTestId("touch-button-move-left");
      const touch = createTouch(1, leftButton);

      fireEvent(leftButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });

  describe("Continuous Actions", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("repeats movement actions when held down", async () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const leftButton = screen.getByTestId("touch-button-move-left");
      const touch = createTouch(1, leftButton);

      // Start touch
      fireEvent(leftButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledTimes(1);

      // Fast forward time to trigger repeat
      jest.advanceTimersByTime(150);
      expect(mockOnAction).toHaveBeenCalledTimes(2);

      // Fast forward more
      jest.advanceTimersByTime(100);
      expect(mockOnAction).toHaveBeenCalledTimes(3);

      // End touch
      fireEvent(leftButton, createTouchEvent("touchend", []));

      // Should stop repeating
      jest.advanceTimersByTime(200);
      expect(mockOnAction).toHaveBeenCalledTimes(3);
    });

    it("does not repeat single-action buttons", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const rotateButton = screen.getByTestId("touch-button-rotate-piece");
      const touch = createTouch(1, rotateButton);

      fireEvent(rotateButton, createTouchEvent("touchstart", [touch]));
      expect(mockOnAction).toHaveBeenCalledTimes(1);

      // Fast forward time
      jest.advanceTimersByTime(200);
      expect(mockOnAction).toHaveBeenCalledTimes(1); // Should not repeat
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for all buttons", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      expect(screen.getByLabelText("Move left")).toBeInTheDocument();
      expect(screen.getByLabelText("Move right")).toBeInTheDocument();
      expect(screen.getByLabelText("Rotate piece")).toBeInTheDocument();
      expect(screen.getByLabelText("Soft drop")).toBeInTheDocument();
      expect(screen.getByLabelText("Hard drop")).toBeInTheDocument();
      expect(screen.getByLabelText("Hold piece")).toBeInTheDocument();
      expect(screen.getByLabelText("Pause game")).toBeInTheDocument();
    });

    it("has proper region label", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      expect(screen.getByRole("region", { name: "Touch game controls" })).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(<TouchControls onAction={mockOnAction} isGameActive={true} />);

      const leftButton = screen.getByTestId("touch-button-move-left");
      leftButton.focus();

      expect(leftButton).toHaveFocus();
    });
  });
});
