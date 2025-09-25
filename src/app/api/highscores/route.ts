import { NextRequest, NextResponse } from 'next/server';
import { getHighScores, submitHighScore, initializeHighScores } from '@/lib/highscores';
import { SubmitHighScoreRequest, GetHighScoresResponse, SubmitHighScoreResponse } from '@/types/highscore';

// Initialize high scores on server start
initializeHighScores().catch(console.error);

export async function GET(): Promise<NextResponse<GetHighScoresResponse>> {
  try {
    const highScores = await getHighScores();

    return NextResponse.json({
      success: true,
      data: highScores,
    });
  } catch (error) {
    console.error('Failed to get high scores:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve high scores',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitHighScoreResponse>> {
  try {
    const body = await request.json();

    // Validate request body
    const { playerName, score, level, linesCleared } = body as SubmitHighScoreRequest;

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid score value',
        },
        { status: 400 }
      );
    }

    if (typeof level !== 'number' || level < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid level value',
        },
        { status: 400 }
      );
    }

    if (typeof linesCleared !== 'number' || linesCleared < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid lines cleared value',
        },
        { status: 400 }
      );
    }

    // Player name validation (optional field)
    const validPlayerName = typeof playerName === 'string'
      ? playerName.trim().slice(0, 20) // Limit to 20 characters
      : 'Anonymous';

    const result = await submitHighScore({
      playerName: validPlayerName,
      score,
      level,
      linesCleared,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to submit high score:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit high score',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}