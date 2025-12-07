import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, SubscriptionTier, SaveData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  saves: SaveData[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
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

  // Error handling
  clearError: () => void;
}

// Simulated user database (in production, this would be a real backend)
const mockUsers: Map<string, { password: string; user: User }> = new Map();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      saves: [],

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check mock database
        const stored = mockUsers.get(email);
        if (stored && stored.password === password) {
          set({ user: stored.user, isLoading: false });
          return true;
        }

        // Check localStorage for demo purposes
        const localUser = localStorage.getItem(`uptime_user_${email}`);
        if (localUser) {
          const userData = JSON.parse(localUser);
          if (userData.password === password) {
            set({ user: userData.user, isLoading: false });
            return true;
          }
        }

        set({ error: '이메일 또는 비밀번호가 올바르지 않습니다.', isLoading: false });
        return false;
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if user exists
        if (mockUsers.has(email) || localStorage.getItem(`uptime_user_${email}`)) {
          set({ error: '이미 존재하는 이메일입니다.', isLoading: false });
          return false;
        }

        const newUser: User = {
          id: uuidv4(),
          email,
          displayName: displayName || email.split('@')[0],
          subscription: 'free',
          createdAt: Date.now()
        };

        // Store in mock database and localStorage
        mockUsers.set(email, { password, user: newUser });
        localStorage.setItem(`uptime_user_${email}`, JSON.stringify({ password, user: newUser }));

        set({ user: newUser, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, error: null });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });

        // Update localStorage
        const localUser = localStorage.getItem(`uptime_user_${user.email}`);
        if (localUser) {
          const userData = JSON.parse(localUser);
          userData.user = updatedUser;
          localStorage.setItem(`uptime_user_${user.email}`, JSON.stringify(userData));
        }
      },

      updateSubscription: (tier, expiresAt) => {
        const { user, updateProfile } = get();
        if (!user) return;

        updateProfile({
          subscription: tier,
          subscriptionExpiresAt: expiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      },

      checkSubscription: () => {
        const { user } = get();
        if (!user) return false;
        if (user.subscription === 'free') return true;

        if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < Date.now()) {
          // Subscription expired, revert to free
          get().updateProfile({ subscription: 'free', subscriptionExpiresAt: undefined });
          return false;
        }

        return true;
      },

      createSave: (name, gameState) => {
        const { user, saves } = get();
        const limit = get().getSaveLimit();

        if (limit !== -1 && saves.length >= limit) {
          set({ error: '저장 슬롯이 가득 찼습니다. 업그레이드하거나 기존 저장을 삭제해주세요.' });
          return null;
        }

        const newSave: SaveData = {
          id: uuidv4(),
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
          case 'pro': return -1; // unlimited
          case 'enterprise': return -1;
          default: return 1;
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
