import { NextRequest, NextResponse } from "next/server";
import { getHighScores, submitHighScore, initializeHighScores } from "@/lib/highscores";
import { SubmitHighScoreRequest, GetHighScoresResponse, SubmitHighScoreResponse } from "@/types/highscore";

// Initialize high scores on server start
initializeHighScores().catch(console.error);

export async function GET(): Promise<NextResponse<GetHighScoresResponse>> {
  console.log("[GET /api/highscores] Request received");

  try {
    console.log("[GET /api/highscores] Fetching high scores from database");
    const highScores = await getHighScores();
    console.log("[GET /api/highscores] Successfully retrieved", highScores.length, "high scores");

    const response = {
      success: true,
      data: highScores,
    };
    console.log("[GET /api/highscores] Sending successful response with", highScores.length, "scores");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/highscores] Failed to get high scores:", error);

    const errorResponse = {
      success: false,
      error: "Failed to retrieve high scores",
    };
    console.log("[GET /api/highscores] Sending error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitHighScoreResponse>> {
  console.log("[POST /api/highscores] Request received");

  try {
    const body = await request.json();
    console.log("[POST /api/highscores] Request body:", body);

    const { playerName, score, level, linesCleared } = body as SubmitHighScoreRequest;
    console.log("[POST /api/highscores] Parsed submission data:", {
      playerName,
      score,
      level,
      linesCleared,
    });

    if (typeof score !== "number" || score < 0) {
      console.warn("[POST /api/highscores] Invalid score validation failed:", score);
      const errorResponse = {
        success: false,
        error: "Invalid score value",
      };
      console.log("[POST /api/highscores] Sending validation error response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (typeof level !== "number" || level < 1) {
      console.warn("[POST /api/highscores] Invalid level validation failed:", level);
      const errorResponse = {
        success: false,
        error: "Invalid level value",
      };
      console.log("[POST /api/highscores] Sending validation error response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (typeof linesCleared !== "number" || linesCleared < 0) {
      console.warn("[POST /api/highscores] Invalid linesCleared validation failed:", linesCleared);
      const errorResponse = {
        success: false,
        error: "Invalid lines cleared value",
      };
      console.log("[POST /api/highscores] Sending validation error response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const validPlayerName = typeof playerName === "string" ? playerName.trim().slice(0, 20) : "Anonymous";
    console.log("[POST /api/highscores] Validation passed, sanitized player name:", validPlayerName);

    const submissionData = {
      playerName: validPlayerName,
      score,
      level,
      linesCleared,
    };
    console.log("[POST /api/highscores] Submitting high score:", submissionData);

    const result = await submitHighScore(submissionData);
    console.log("[POST /api/highscores] High score submission result:", result);

    const response = {
      success: true,
      data: result,
    };
    console.log("[POST /api/highscores] Sending successful response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/highscores] Failed to submit high score:", error);

    const errorResponse = {
      success: false,
      error: "Failed to submit high score",
    };
    console.log("[POST /api/highscores] Sending error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function PUT(): Promise<NextResponse> {
  console.warn("[PUT /api/highscores] Method not allowed - PUT request received");
  const errorResponse = { success: false, error: "Method not allowed" };
  console.log("[PUT /api/highscores] Sending method not allowed response:", errorResponse);
  return NextResponse.json(errorResponse, { status: 405 });
}

export async function DELETE(): Promise<NextResponse> {
  console.warn("[DELETE /api/highscores] Method not allowed - DELETE request received");
  const errorResponse = { success: false, error: "Method not allowed" };
  console.log("[DELETE /api/highscores] Sending method not allowed response:", errorResponse);
  return NextResponse.json(errorResponse, { status: 405 });
}
