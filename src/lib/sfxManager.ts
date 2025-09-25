export type SoundEffectType =
  | "gameOver"
  | "caution"
  | "hardDrop"
  | "softDrop"
  | "rotate"
  | "pause"
  | "hold"
  | "single"
  | "double"
  | "triple"
  | "tetris";

interface SoundEffect {
  audio: HTMLAudioElement;
  src: string;
  volume: number;
}

class SFXManager {
  private static instance: SFXManager | null = null;
  private soundEffects: Map<SoundEffectType, SoundEffect> = new Map();
  private globalVolume = 0.6;
  private isMuted = false;
  private initialized = false;

  private constructor() {}

  static getInstance(): SFXManager {
    if (!SFXManager.instance) {
      SFXManager.instance = new SFXManager();
    }
    return SFXManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const soundMap: Record<SoundEffectType, { src: string; volume: number }> = {
      gameOver: { src: "/sfx/me_game_gameover.wav", volume: 0.8 },
      caution: { src: "/sfx/se_game_caution.wav", volume: 0.7 },
      hardDrop: { src: "/sfx/se_game_harddrop.wav", volume: 0.6 },
      softDrop: { src: "/sfx/se_game_softdrop.wav", volume: 0.4 },
      rotate: { src: "/sfx/se_game_rotate.wav", volume: 0.5 },
      pause: { src: "/sfx/se_game_pause.wav", volume: 0.7 },
      hold: { src: "/sfx/se_game_hold.wav", volume: 0.6 },
      single: { src: "/sfx/se_game_single.wav", volume: 0.6 },
      double: { src: "/sfx/se_game_double.wav", volume: 0.7 },
      triple: { src: "/sfx/se_game_triple.wav", volume: 0.7 },
      tetris: { src: "/sfx/se_game_tetris.wav", volume: 0.8 },
    };

    const loadPromises = Object.entries(soundMap).map(([key, { src, volume }]) => {
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(src);
        audio.volume = volume * this.globalVolume;
        audio.preload = "auto";

        const handleCanPlay = () => {
          this.soundEffects.set(key as SoundEffectType, { audio, src, volume });
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          resolve();
        };

        const handleError = () => {
          console.warn(`Failed to load sound effect: ${src}`);
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          resolve(); // Don't reject, just skip this sound
        };

        audio.addEventListener("canplaythrough", handleCanPlay);
        audio.addEventListener("error", handleError);
      });
    });

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  play(soundType: SoundEffectType): void {
    if (this.isMuted) return;

    const soundEffect = this.soundEffects.get(soundType);
    if (!soundEffect) {
      console.warn(`Sound effect not found: ${soundType}`);
      return;
    }

    try {
      const { audio } = soundEffect;

      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;

      // Clone the audio for overlapping sounds (like soft drops)
      if (soundType === "softDrop" || soundType === "rotate") {
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = audio.volume;
        clone.play().catch(error => {
          console.warn(`Failed to play sound effect: ${soundType}`, error);
        });
      } else {
        audio.play().catch(error => {
          console.warn(`Failed to play sound effect: ${soundType}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound effect: ${soundType}`, error);
    }
  }

  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));

    // Update all loaded sound volumes
    this.soundEffects.forEach(({ audio, volume: baseVolume }) => {
      audio.volume = baseVolume * this.globalVolume;
    });
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  getGlobalVolume(): number {
    return this.globalVolume;
  }

  dispose(): void {
    this.soundEffects.forEach(({ audio }) => {
      audio.pause();
      audio.src = "";
    });
    this.soundEffects.clear();
    this.initialized = false;
  }
}

export const sfxManager = SFXManager.getInstance();
export default sfxManager;