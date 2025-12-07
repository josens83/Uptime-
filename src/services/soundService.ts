import { Howl, Howler } from 'howler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'warning'
  | 'notification'
  | 'ticket_new'
  | 'ticket_resolve'
  | 'ticket_fail'
  | 'upgrade'
  | 'achievement'
  | 'level_up'
  | 'phase_change'
  | 'event'
  | 'coin';

// BGM types
export type BGMTrack =
  | 'menu'
  | 'game_calm'
  | 'game_intense'
  | 'game_critical';

// Sound URLs (using free sound effects - replace with actual URLs in production)
const SOUND_URLS: Record<SoundEffect, string> = {
  click: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',  // Placeholder
  success: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  error: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  warning: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  notification: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  ticket_new: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  ticket_resolve: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  ticket_fail: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  upgrade: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  achievement: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  level_up: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  phase_change: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  event: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...',
  coin: 'data:audio/wav;base64,UklGRl9vT19teleGF5dGV...'
};

// BGM URLs (placeholders - replace with actual URLs)
const BGM_URLS: Record<BGMTrack, string> = {
  menu: '/sounds/bgm/menu.mp3',
  game_calm: '/sounds/bgm/game_calm.mp3',
  game_intense: '/sounds/bgm/game_intense.mp3',
  game_critical: '/sounds/bgm/game_critical.mp3'
};

interface SoundStore {
  // Settings
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  sfxEnabled: boolean;
  bgmEnabled: boolean;

  // State
  currentBGM: BGMTrack | null;
  isInitialized: boolean;

  // Actions
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setBgmVolume: (volume: number) => void;
  toggleSfx: () => void;
  toggleBgm: () => void;
  initialize: () => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      masterVolume: 0.7,
      sfxVolume: 0.8,
      bgmVolume: 0.5,
      sfxEnabled: true,
      bgmEnabled: true,
      currentBGM: null,
      isInitialized: false,

      setMasterVolume: (volume) => {
        set({ masterVolume: volume });
        Howler.volume(volume);
      },

      setSfxVolume: (volume) => {
        set({ sfxVolume: volume });
      },

      setBgmVolume: (volume) => {
        set({ bgmVolume: volume });
        if (currentBGMHowl) {
          currentBGMHowl.volume(volume * get().masterVolume);
        }
      },

      toggleSfx: () => {
        set((state) => ({ sfxEnabled: !state.sfxEnabled }));
      },

      toggleBgm: () => {
        const newState = !get().bgmEnabled;
        set({ bgmEnabled: newState });

        if (!newState && currentBGMHowl) {
          currentBGMHowl.pause();
        } else if (newState && currentBGMHowl) {
          currentBGMHowl.play();
        }
      },

      initialize: () => {
        if (get().isInitialized) return;

        Howler.volume(get().masterVolume);
        set({ isInitialized: true });
      }
    }),
    {
      name: 'uptime-sound-settings',
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        sfxVolume: state.sfxVolume,
        bgmVolume: state.bgmVolume,
        sfxEnabled: state.sfxEnabled,
        bgmEnabled: state.bgmEnabled
      })
    }
  )
);

// Sound effect cache
const soundCache: Map<SoundEffect, Howl> = new Map();

// Current BGM instance
let currentBGMHowl: Howl | null = null;

// Generate simple sounds using Web Audio API (since we don't have actual sound files)
const createSynthSound = (type: SoundEffect): Howl => {
  // Create a simple beep sound using base64 encoded WAV
  // This is a placeholder - in production, use actual sound files
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Different frequencies for different sound types
  const frequencies: Record<SoundEffect, number> = {
    click: 800,
    success: 600,
    error: 200,
    warning: 400,
    notification: 880,
    ticket_new: 440,
    ticket_resolve: 660,
    ticket_fail: 220,
    upgrade: 880,
    achievement: 1000,
    level_up: 1200,
    phase_change: 500,
    event: 700,
    coin: 1400
  };

  // Create a simple oscillator-based sound
  const createBeep = (frequency: number, duration: number): string => {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate sine wave with envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8); // Decay
      const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const url = createBeep(frequencies[type], 0.15);

  return new Howl({
    src: [url],
    volume: 0.5,
    preload: true
  });
};

// Play a sound effect
export const playSfx = (effect: SoundEffect): void => {
  const store = useSoundStore.getState();

  if (!store.sfxEnabled) return;

  let sound = soundCache.get(effect);

  if (!sound) {
    sound = createSynthSound(effect);
    soundCache.set(effect, sound);
  }

  sound.volume(store.sfxVolume * store.masterVolume);
  sound.play();
};

// Play BGM
export const playBGM = (track: BGMTrack): void => {
  const store = useSoundStore.getState();

  if (!store.bgmEnabled) return;

  // Stop current BGM
  if (currentBGMHowl) {
    currentBGMHowl.stop();
  }

  // For now, we'll skip BGM since we don't have actual files
  // In production, uncomment this:
  /*
  currentBGMHowl = new Howl({
    src: [BGM_URLS[track]],
    volume: store.bgmVolume * store.masterVolume,
    loop: true,
    preload: true
  });

  currentBGMHowl.play();
  */

  useSoundStore.setState({ currentBGM: track });
};

// Stop BGM
export const stopBGM = (): void => {
  if (currentBGMHowl) {
    currentBGMHowl.stop();
    currentBGMHowl = null;
  }
  useSoundStore.setState({ currentBGM: null });
};

// Pause BGM
export const pauseBGM = (): void => {
  if (currentBGMHowl) {
    currentBGMHowl.pause();
  }
};

// Resume BGM
export const resumeBGM = (): void => {
  const store = useSoundStore.getState();
  if (currentBGMHowl && store.bgmEnabled) {
    currentBGMHowl.play();
  }
};

// Fade BGM
export const fadeBGM = (to: number, duration: number = 1000): void => {
  if (currentBGMHowl) {
    const store = useSoundStore.getState();
    currentBGMHowl.fade(
      currentBGMHowl.volume(),
      to * store.masterVolume,
      duration
    );
  }
};

// Change BGM based on game state
export const updateBGMForGameState = (uptime: number, ticketCount: number): void => {
  const store = useSoundStore.getState();

  let newTrack: BGMTrack;

  if (uptime < 70) {
    newTrack = 'game_critical';
  } else if (uptime < 85 || ticketCount > 5) {
    newTrack = 'game_intense';
  } else {
    newTrack = 'game_calm';
  }

  if (store.currentBGM !== newTrack) {
    playBGM(newTrack);
  }
};

// Utility: Play sound on button click
export const withClickSound = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    playSfx('click');
    return fn(...args);
  }) as T;
};
