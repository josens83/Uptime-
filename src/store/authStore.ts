import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, SubscriptionTier, SaveData } from '../types';
import * as authService from '../services/authService';
import { isDemoMode } from '../config/firebase';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  saves: SaveData[];

  // Auth actions
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGithub: () => Promise<boolean>;
  register: (email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;

  // Subscription actions
  updateSubscription: (tier: SubscriptionTier, expiresAt?: number) => void;
  checkSubscription: () => boolean;

  // Save management
  createSave: (name: string, gameState: any) => SaveData | null;
  loadSave: (saveId: string) => SaveData | null;
  deleteSave: (saveId: string) => void;
  renameSave: (saveId: string, newName: string) => void;
  getSaveLimit: () => number;

  // Stats
  updateStats: (stats: Partial<User['stats']>) => Promise<void>;

  // Error handling
  clearError: () => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      saves: [],

      initialize: () => {
        // Subscribe to auth state changes
        const unsubscribe = authService.onAuthChange((user) => {
          set({ user, isInitialized: true, isLoading: false });
        });

        // For demo mode, check localStorage
        if (isDemoMode()) {
          const demoUser = localStorage.getItem('uptime_demo_user');
          if (demoUser) {
            try {
              set({ user: JSON.parse(demoUser), isInitialized: true });
            } catch {
              set({ isInitialized: true });
            }
          } else {
            set({ isInitialized: true });
          }
        }

        return unsubscribe;
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const user = await authService.loginWithEmail(email, password);

          if (isDemoMode()) {
            localStorage.setItem('uptime_demo_user', JSON.stringify(user));
          }

          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          let errorMessage = '로그인에 실패했습니다.';

          if (error.code === 'auth/user-not-found') {
            errorMessage = '등록되지 않은 이메일입니다.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = '비밀번호가 올바르지 않습니다.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '유효하지 않은 이메일 형식입니다.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          const user = await authService.loginWithGoogle();

          if (isDemoMode()) {
            localStorage.setItem('uptime_demo_user', JSON.stringify(user));
          }

          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          let errorMessage = 'Google 로그인에 실패했습니다.';

          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = '로그인이 취소되었습니다.';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.';
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      loginWithGithub: async () => {
        set({ isLoading: true, error: null });

        try {
          const user = await authService.loginWithGithub();

          if (isDemoMode()) {
            localStorage.setItem('uptime_demo_user', JSON.stringify(user));
          }

          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          let errorMessage = 'GitHub 로그인에 실패했습니다.';

          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = '로그인이 취소되었습니다.';
          } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = '이미 다른 방법으로 가입된 이메일입니다.';
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      register: async (email, password, username) => {
        set({ isLoading: true, error: null });

        try {
          const user = await authService.registerWithEmail(
            email,
            password,
            username || email.split('@')[0]
          );

          if (isDemoMode()) {
            localStorage.setItem('uptime_demo_user', JSON.stringify(user));
          }

          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          let errorMessage = '회원가입에 실패했습니다.';

          if (error.code === 'auth/email-already-in-use') {
            errorMessage = '이미 사용 중인 이메일입니다.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '유효하지 않은 이메일 형식입니다.';
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();

          if (isDemoMode()) {
            localStorage.removeItem('uptime_demo_user');
          }

          set({ user: null, error: null });
        } catch (error) {
          set({ error: '로그아웃에 실패했습니다.' });
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          await authService.resetPassword(email);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          let errorMessage = '비밀번호 재설정 이메일 발송에 실패했습니다.';

          if (error.code === 'auth/user-not-found') {
            errorMessage = '등록되지 않은 이메일입니다.';
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });

        if (isDemoMode()) {
          localStorage.setItem('uptime_demo_user', JSON.stringify(updatedUser));
        }
      },

      updateSubscription: (tier, expiresAt) => {
        const { user, updateProfile } = get();
        if (!user) return;

        const subscriptionExpiresAt = expiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000);
        updateProfile({ subscription: tier, subscriptionExpiresAt });

        // Sync with Firestore
        if (!isDemoMode()) {
          authService.updateUserSubscription(user.id, tier).catch(console.error);
        }
      },

      checkSubscription: () => {
        const { user } = get();
        if (!user) return false;
        if (user.subscription === 'free') return true;

        if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < Date.now()) {
          get().updateProfile({ subscription: 'free', subscriptionExpiresAt: undefined });
          return false;
        }

        return true;
      },

      createSave: (name, gameState) => {
        const { saves } = get();
        const limit = get().getSaveLimit();

        if (limit !== -1 && saves.length >= limit) {
          set({ error: '저장 슬롯이 가득 찼습니다. 업그레이드하거나 기존 저장을 삭제해주세요.' });
          return null;
        }

        const newSave: SaveData = {
          id: generateId(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          gameState
        };

        set({ saves: [...saves, newSave] });
        return newSave;
      },

      loadSave: (saveId) => {
        const { saves } = get();
        return saves.find(s => s.id === saveId) || null;
      },

      deleteSave: (saveId) => {
        set((state) => ({
          saves: state.saves.filter(s => s.id !== saveId)
        }));
      },

      renameSave: (saveId, newName) => {
        set((state) => ({
          saves: state.saves.map(s =>
            s.id === saveId ? { ...s, name: newName, updatedAt: Date.now() } : s
          )
        }));
      },

      getSaveLimit: () => {
        const { user } = get();
        if (!user) return 1;

        switch (user.subscription) {
          case 'free': return 1;
          case 'starter': return 3;
          case 'pro': return -1;
          case 'enterprise': return -1;
          default: return 1;
        }
      },

      updateStats: async (stats) => {
        const { user, updateProfile } = get();
        if (!user) return;

        const currentStats = user.stats || {
          totalPlayTime: 0,
          highestDay: 0,
          achievementsUnlocked: 0,
          totalRevenue: 0
        };

        const updatedStats = { ...currentStats, ...stats };
        updateProfile({ stats: updatedStats });

        if (!isDemoMode()) {
          await authService.updateUserStats(user.id, updatedStats);
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'uptime-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        saves: state.saves
      })
    }
  )
);
