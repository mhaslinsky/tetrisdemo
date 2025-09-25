import { useEffect, useRef, useCallback } from "react";
import type { GameState, GameAction } from "@/types/game";
import { sfxManager, type SoundEffectType } from "@/lib/sfxManager";
import { getColumnHeights } from "@/lib/board";

interface UseSoundEffectsOptions {
  enabled?: boolean;
}

export function useSoundEffects(
  gameState: GameState,
  lastAction: React.MutableRefObject<GameAction | null>,
  options: UseSoundEffectsOptions = {}
) {
  const { enabled = true } = options;
  const initialized = useRef(false);
  const lastGameStatus = useRef<string>(gameState.gameStatus);
  const lastLevel = useRef<number>(gameState.level);
  const lastLinesCleared = useRef<number>(gameState.linesCleared);
  const cautionCooldown = useRef<number>(0);
  const lastHeightCheck = useRef<number>(0);

  // Initialize SFX manager
  useEffect(() => {
    if (enabled && !initialized.current) {
      sfxManager.initialize().then(() => {
        initialized.current = true;
      });
    }

    return () => {
      if (initialized.current) {
        sfxManager.dispose();
        initialized.current = false;
      }
    };
  }, [enabled]);

  // Play sound effect with cooldown and state checks
  const playSound = useCallback((soundType: SoundEffectType) => {
    if (!enabled || !initialized.current) return;
    sfxManager.play(soundType);
  }, [enabled]);

  // Handle game status changes (Game Over, Pause)
  useEffect(() => {
    if (!enabled) return;

    const currentStatus = gameState.gameStatus;
    const previousStatus = lastGameStatus.current;

    if (previousStatus !== "gameOver" && currentStatus === "gameOver") {
      playSound("gameOver");
    } else if (previousStatus !== "paused" && currentStatus === "paused") {
      playSound("pause");
    }

    lastGameStatus.current = currentStatus;
  }, [gameState.gameStatus, playSound, enabled]);

  // Handle line clears (Tetris, Triple)
  useEffect(() => {
    if (!enabled) return;

    const currentLines = gameState.linesCleared;
    const previousLines = lastLinesCleared.current;
    const linesCleared = currentLines - previousLines;

    if (linesCleared > 0) {
      switch (linesCleared) {
        case 1:
          playSound("single");
          break;
        case 2:
          playSound("double");
          break;
        case 3:
          playSound("triple");
          break;
        case 4:
          playSound("tetris");
          break;
      }
    }

    lastLinesCleared.current = currentLines;
  }, [gameState.linesCleared, playSound, enabled]);

  // Handle action-based sound effects
  useEffect(() => {
    if (!enabled || !lastAction.current) return;

    const action = lastAction.current;

    switch (action.type) {
      case "HARD_DROP":
        playSound("hardDrop");
        break;

      case "MOVE_DOWN":
        // Only play soft drop sound if the piece actually moved
        if (gameState.currentPiece) {
          playSound("softDrop");
        }
        break;

      case "ROTATE":
        playSound("rotate");
        break;

      case "HOLD_PIECE":
        playSound("hold");
        break;
    }

    // Clear the last action after processing to prevent repeated sounds
    lastAction.current = null;
  }, [gameState.currentPiece, playSound, enabled, lastAction]);

  // Handle caution sound (when pieces get close to top)
  useEffect(() => {
    if (!enabled || gameState.gameStatus !== "playing") {
      cautionCooldown.current = 0;
      return;
    }

    const currentTime = Date.now();

    // Check height every 100ms to avoid performance issues
    if (currentTime - lastHeightCheck.current < 100) return;
    lastHeightCheck.current = currentTime;

    // Check if pieces are getting dangerously high
    const columnHeights = getColumnHeights(gameState.board);
    const maxHeight = Math.max(...columnHeights);

    // Trigger caution when pieces reach row 4 from top (height > 16)
    const dangerThreshold = 16;

    if (maxHeight > dangerThreshold) {
      // Only play caution sound if we haven't played it recently (5 second cooldown)
      if (currentTime - cautionCooldown.current > 5000) {
        playSound("caution");
        cautionCooldown.current = currentTime;
      }
    } else {
      // Reset cooldown when height goes back down
      cautionCooldown.current = 0;
    }
  }, [gameState.board, gameState.gameStatus, playSound, enabled]);

  // Expose SFX control methods
  const setMuted = useCallback((muted: boolean) => {
    sfxManager.setMuted(muted);
  }, []);

  const setVolume = useCallback((volume: number) => {
    sfxManager.setGlobalVolume(volume);
  }, []);

  const isMuted = useCallback(() => {
    return sfxManager.isSoundMuted();
  }, []);

  const getVolume = useCallback(() => {
    return sfxManager.getGlobalVolume();
  }, []);

  return {
    setMuted,
    setVolume,
    isMuted,
    getVolume,
    playSound, // For manual sound triggering if needed
  };
}