export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
  date: string;
}

export interface SubmitHighScoreRequest {
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
}

export interface HighScoreResponse {
  highScores: HighScore[];
  isNewHighScore: boolean;
  rank?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type GetHighScoresResponse = ApiResponse<HighScore[]>;
export type SubmitHighScoreResponse = ApiResponse<HighScoreResponse>;