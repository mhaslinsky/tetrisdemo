import { promises as fs } from "fs";
import path from "path";
import { HighScore, SubmitHighScoreRequest } from "@/types/highscore";

const HIGHSCORES_FILE = path.join(process.cwd(), ".highscores.json");
const MAX_HIGHSCORES = 10;

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Read high scores from file
async function readHighScores(): Promise<HighScore[]> {
  try {
    const data = await fs.readFile(HIGHSCORES_FILE, "utf-8");
    const scores = JSON.parse(data) as HighScore[];

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    console.log("No high scores file found or invalid format, starting fresh");
    return [];
  }
}

// Write high scores to file
async function writeHighScores(scores: HighScore[]): Promise<void> {
  try {
    // Sort by score descending and take only top 10
    const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, MAX_HIGHSCORES);

    await fs.writeFile(HIGHSCORES_FILE, JSON.stringify(sortedScores, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write high scores:", error);
    throw new Error("Failed to save high score");
  }
}

// Get all high scores
export async function getHighScores(): Promise<HighScore[]> {
  return await readHighScores();
}

// Check if score qualifies for top 10
export async function qualifiesForHighScore(score: number): Promise<{ qualifies: boolean; rank?: number }> {
  const scores = await readHighScores();

  // If we have less than 10 scores, it automatically qualifies
  if (scores.length < MAX_HIGHSCORES) {
    const rank = scores.filter((s) => s.score > score).length + 1;
    return { qualifies: true, rank };
  }

  // Check if score is higher than the lowest score
  const lowestScore = scores[scores.length - 1].score;
  if (score > lowestScore) {
    const rank = scores.filter((s) => s.score > score).length + 1;
    return { qualifies: true, rank };
  }

  return { qualifies: false };
}

// Submit a new high score
export async function submitHighScore(scoreData: SubmitHighScoreRequest): Promise<{
  highScores: HighScore[];
  isNewHighScore: boolean;
  rank?: number;
}> {
  const scores = await readHighScores();

  // Create new high score entry
  const newScore: HighScore = {
    id: generateId(),
    playerName: scoreData.playerName.trim() || "Anonymous",
    score: scoreData.score,
    level: scoreData.level,
    linesCleared: scoreData.linesCleared,
    date: new Date().toISOString(),
  };

  // Add the new score
  scores.push(newScore);

  // Sort by score descending
  const sortedScores = scores.sort((a, b) => b.score - a.score);

  // Find the rank of the new score
  const rank = sortedScores.findIndex((s) => s.id === newScore.id) + 1;

  // Check if it's a new high score (top 10)
  const isNewHighScore = rank <= MAX_HIGHSCORES;

  // Keep only top 10
  const finalScores = sortedScores.slice(0, MAX_HIGHSCORES);

  // Save to file
  await writeHighScores(finalScores);

  return {
    highScores: finalScores,
    isNewHighScore,
    rank: isNewHighScore ? rank : undefined,
  };
}

// Initialize high scores file if it doesn't exist
export async function initializeHighScores(): Promise<void> {
  try {
    await fs.access(HIGHSCORES_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    const initialHighScores: HighScore[] = [
      {
        id: generateId(),
        playerName: "Mike H",
        score: 59395,
        level: 9,
        linesCleared: 85,
        date: "2025-09-25T00:00:00.000Z",
      },
    ];
    await writeHighScores(initialHighScores);
    console.log("Initialized high scores file with hardcoded score");
    await writeHighScores([]);
  }
}
