import { promises as fs } from "fs";
import path from "path";
import { HighScore, SubmitHighScoreRequest } from "@/types/highscore";

const HIGHSCORES_FILE = path.join(process.cwd(), ".highscores.json");
const MAX_HIGHSCORES = 10;

// In-memory storage for environments with read-only file systems
let inMemoryHighScores: HighScore[] | null = null;
let isFileSystemReadOnly = false;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Read high scores from file or memory
async function readHighScores(): Promise<HighScore[]> {
  // If file system is read-only, use in-memory storage
  if (isFileSystemReadOnly) {
    console.log("[readHighScores] Using in-memory storage (read-only filesystem)");
    return inMemoryHighScores ? [...inMemoryHighScores].sort((a, b) => b.score - a.score) : [];
  }

  try {
    const data = await fs.readFile(HIGHSCORES_FILE, "utf-8");
    const scores = JSON.parse(data) as HighScore[];
    console.log("[readHighScores] Successfully read", scores.length, "scores from file");

    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    console.log("[readHighScores] No high scores file found or invalid format, starting fresh");
    return [];
  }
}

async function writeHighScores(scores: HighScore[]): Promise<void> {
  const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, MAX_HIGHSCORES);

  // If file system is read-only, store in memory
  if (isFileSystemReadOnly) {
    console.log("[writeHighScores] Storing", sortedScores.length, "scores in memory (read-only filesystem)");
    inMemoryHighScores = [...sortedScores];
    return;
  }

  try {
    await fs.writeFile(HIGHSCORES_FILE, JSON.stringify(sortedScores, null, 2), "utf-8");
    console.log("[writeHighScores] Successfully wrote", sortedScores.length, "scores to file");
  } catch (error) {
    console.error("[writeHighScores] Failed to write high scores:", error);

    // Check if it's a read-only filesystem error
    if ((error as any)?.code === "EROFS") {
      console.warn("[writeHighScores] Detected read-only filesystem, switching to in-memory storage");
      isFileSystemReadOnly = true;
      inMemoryHighScores = [...sortedScores];
      return;
    }

    throw new Error("Failed to save high score");
  }
}

export async function getHighScores(): Promise<HighScore[]> {
  return await readHighScores();
}

export async function qualifiesForHighScore(score: number): Promise<{ qualifies: boolean; rank?: number }> {
  const scores = await readHighScores();

  if (scores.length < MAX_HIGHSCORES) {
    const rank = scores.filter((s) => s.score > score).length + 1;
    return { qualifies: true, rank };
  }

  const lowestScore = scores[scores.length - 1].score;
  if (score > lowestScore) {
    const rank = scores.filter((s) => s.score > score).length + 1;
    return { qualifies: true, rank };
  }

  return { qualifies: false };
}

export async function submitHighScore(scoreData: SubmitHighScoreRequest): Promise<{
  highScores: HighScore[];
  isNewHighScore: boolean;
  rank?: number;
}> {
  const scores = await readHighScores();

  const newScore: HighScore = {
    id: generateId(),
    playerName: scoreData.playerName.trim() || "Anonymous",
    score: scoreData.score,
    level: scoreData.level,
    linesCleared: scoreData.linesCleared,
    date: new Date().toISOString(),
  };

  scores.push(newScore);

  const sortedScores = scores.sort((a, b) => b.score - a.score);

  const rank = sortedScores.findIndex((s) => s.id === newScore.id) + 1;

  const isNewHighScore = rank <= MAX_HIGHSCORES;

  const finalScores = sortedScores.slice(0, MAX_HIGHSCORES);

  await writeHighScores(finalScores);

  return {
    highScores: finalScores,
    isNewHighScore,
    rank: isNewHighScore ? rank : undefined,
  };
}

export async function initializeHighScores(): Promise<void> {
  console.log("[initializeHighScores] Checking high scores initialization");

  // If already using in-memory storage, initialize it if empty
  if (isFileSystemReadOnly) {
    if (!inMemoryHighScores || inMemoryHighScores.length === 0) {
      const initialHighScores: HighScore[] = [
        {
          id: generateId(),
          playerName: "Mike H",
          score: 59395,
          level: 9,
          linesCleared: 85,
          date: new Date().toISOString(),
        },
      ];
      inMemoryHighScores = initialHighScores;
      console.log("[initializeHighScores] Initialized in-memory high scores with hardcoded score");
    }
    return;
  }

  try {
    await fs.access(HIGHSCORES_FILE);
    console.log("[initializeHighScores] High scores file already exists");
  } catch {
    // File doesn't exist, create it with hardcoded high score
    console.log("[initializeHighScores] Creating new high scores file");
    const initialHighScores: HighScore[] = [
      {
        id: generateId(),
        playerName: "Mike H",
        score: 59395,
        level: 9,
        linesCleared: 85,
        date: new Date().toISOString(),
      },
    ];

    try {
      await writeHighScores(initialHighScores);
      console.log("[initializeHighScores] Initialized high scores file with hardcoded score");
    } catch (error) {
      console.warn("[initializeHighScores] Failed to create file, likely read-only filesystem:", error);
    }
  }
}
