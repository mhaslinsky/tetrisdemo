import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ActionFeedback } from "../ActionFeedback";
import type { AnimationType } from "@/types";

describe("ActionFeedback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders nothing when lastAction is null", () => {
    render(<ActionFeedback lastAction={null} />);
    expect(screen.queryByTestId("action-feedback")).not.toBeInTheDocument();
  });

  it("displays MOVE feedback for move action", () => {
    render(<ActionFeedback lastAction='move' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("MOVE");
  });

  it("displays ROTATE feedback for rotate action", () => {
    render(<ActionFeedback lastAction='rotate' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("ROTATE");
  });

  it("displays SOFT DROP feedback for drop action", () => {
    render(<ActionFeedback lastAction='drop' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("SOFT DROP");
  });

  it("displays HARD DROP! feedback for hard_drop action", () => {
    render(<ActionFeedback lastAction='hard_drop' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("HARD DROP!");
  });

  it("hides feedback after timeout", async () => {
    const { rerender } = render(<ActionFeedback lastAction='move' />);

    expect(screen.getByTestId("action-feedback")).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(500);

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.queryByTestId("action-feedback")).not.toBeInTheDocument();
    });
  });

  it("updates feedback when lastAction changes", () => {
    const { rerender } = render(<ActionFeedback lastAction='move' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("MOVE");

    rerender(<ActionFeedback lastAction='rotate' />);
    expect(screen.getByTestId("action-feedback")).toHaveTextContent("ROTATE");
  });

  it("applies custom className", () => {
    render(<ActionFeedback lastAction='move' className='custom-class' />);
    expect(screen.getByTestId("action-feedback")).toHaveClass("custom-class");
  });

  it("has proper styling classes", () => {
    render(<ActionFeedback lastAction='move' />);
    const feedback = screen.getByTestId("action-feedback");

    expect(feedback).toHaveClass("absolute");
    expect(feedback).toHaveClass("top-4");
    expect(feedback).toHaveClass("right-4");
    expect(feedback).toHaveClass("bg-blue-600");
    expect(feedback).toHaveClass("animate-bounce");
  });
});
