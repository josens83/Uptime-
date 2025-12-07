import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'default' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'minimal';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  premium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    success: string;
    warning: string;
    danger: string;
  };
  preview: string; // CSS gradient for preview
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: '기본',
    description: '깔끔한 다크 테마',
    premium: false,
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#020617',
      surface: '#0f172a',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444'
    },
    preview: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
  },
  {
    id: 'ocean',
    name: '오션',
    description: '깊은 바다의 색감',
    premium: false,
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#22d3ee',
      background: '#042f2e',
      surface: '#134e4a',
      success: '#2dd4bf',
      warning: '#fbbf24',
      danger: '#f87171'
    },
    preview: 'linear-gradient(135deg, #06b6d4, #134e4a)'
  },
  {
    id: 'forest',
    name: '포레스트',
    description: '자연의 색감',
    premium: false,
    colors: {
      primary: '#22c55e',
      secondary: '#15803d',
      accent: '#84cc16',
      background: '#052e16',
      surface: '#14532d',
      success: '#4ade80',
      warning: '#facc15',
      danger: '#f87171'
    },
    preview: 'linear-gradient(135deg, #22c55e, #14532d)'
  },
  {
    id: 'sunset',
    name: '선셋',
    description: '따뜻한 노을빛',
    premium: true,
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: '#1c1917',
      surface: '#292524',
      success: '#84cc16',
      warning: '#f59e0b',
      danger: '#dc2626'
    },
    preview: 'linear-gradient(135deg, #f97316, #dc2626)'
  },
  {
    id: 'neon',
    name: '네온',
    description: '사이버펑크 스타일',
    premium: true,
    colors: {
      primary: '#f0abfc',
      secondary: '#e879f9',
      accent: '#22d3ee',
      background: '#0a0a0a',
      surface: '#171717',
      success: '#4ade80',
      warning: '#fde047',
      danger: '#fb7185'
    },
    preview: 'linear-gradient(135deg, #f0abfc, #22d3ee)'
  },
  {
    id: 'minimal',
    name: '미니멀',
    description: '심플한 모노톤',
    premium: true,
    colors: {
      primary: '#a3a3a3',
      secondary: '#737373',
      accent: '#e5e5e5',
      background: '#0a0a0a',
      surface: '#171717',
      success: '#86efac',
      warning: '#fde68a',
      danger: '#fca5a5'
    },
    preview: 'linear-gradient(135deg, #a3a3a3, #404040)'
  }
];

interface ThemeStore {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  getTheme: () => Theme;
  applyTheme: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'default',

      setTheme: (themeId) => {
        set({ currentTheme: themeId });
        get().applyTheme(themeId);
      },

      getTheme: () => {
        return themes.find(t => t.id === get().currentTheme) || themes[0];
      },

      applyTheme: (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;

        // Apply CSS custom properties
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-bg', theme.colors.background);
        root.style.setProperty('--color-surface', theme.colors.surface);
        root.style.setProperty('--color-success', theme.colors.success);
        root.style.setProperty('--color-warning', theme.colors.warning);
        root.style.setProperty('--color-danger', theme.colors.danger);

        // Store in data attribute for CSS
        root.setAttribute('data-theme', themeId);
      }
    }),
    {
      name: 'uptime-theme',
      partialize: (state) => ({ currentTheme: state.currentTheme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applyTheme(state.currentTheme);
        }
      }
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('uptime-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.currentTheme) {
        useThemeStore.getState().applyTheme(parsed.state.currentTheme);
      }
    } catch {
      useThemeStore.getState().applyTheme('default');
    }
  }
}
