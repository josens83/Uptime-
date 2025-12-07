import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, Ticket, Phase, TeamMember, GameEvent, Notification, User, SubscriptionTier } from '../types';
import { generateTicket } from '../data/tickets';
import { getRandomEvent } from '../data/events';
import { getUpgradeById, upgrades } from '../data/upgrades';
import { checkAchievements } from '../data/achievements';
import { v4 as uuidv4 } from 'uuid';

// Game configuration constants
const GAME_CONFIG = {
  baseTicketInterval: 15000, // 15 seconds
  baseEventInterval: 60000, // 60 seconds
  uptimeDecayRate: 0.01,
  techDebtThreshold: 50,
  userGrowthRate: 0.001,
  serverCosts: [0, 50, 100, 200, 400, 800], // Cost per day per tier
  serverCapacity: [100, 500, 2000, 5000, 15000, 50000], // Max users per tier
  salaries: {
    developer: 100,
    designer: 80,
    marketer: 70
  },
  hiringCosts: {
    developer: 500,
    designer: 400,
    marketer: 300
  },
  phaseRequirements: {
    mobile: { users: 1000, money: 5000, reputation: 30 },
    app: { users: 5000, money: 20000, reputation: 60 }
  }
};

const initialGameState: GameState = {
  uptime: 100,
  money: 1000,
  users: 10,
  reputation: 20,
  phase: 'web',
  day: 1,
  hour: 0,
  techDebt: 0,
  team: {
    developers: 1,
    designers: 0,
    marketers: 0
  },
  teamMembers: [],
  serverTier: 1,
  purchasedUpgrades: [],
  tickets: [],
  resolvedTickets: 0,
  failedTickets: 0,
  achievements: [],
  totalEarnings: 0,
  totalSpent: 0,
  peakUsers: 10,
  longestUptime: 100,
  isPaused: true,
  gameSpeed: 1,
  tutorialCompleted: false,
  tutorialStep: 0
};

interface GameStore extends GameState {
  // User state
  user: User | null;
  notifications: Notification[];
  currentEvent: GameEvent | null;

  // Actions
  setUser: (user: User | null) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  setGameSpeed: (speed: number) => void;

  // Game tick
  gameTick: () => void;

  // Ticket actions
  addTicket: (ticket: Ticket) => void;
  resolveTicket: (ticketId: string) => void;
  failTicket: (ticketId: string) => void;
  updateTicketTimers: () => void;

  // Event actions
  triggerEvent: (event: GameEvent) => void;
  handleEventChoice: (choiceIndex: number) => void;
  dismissEvent: () => void;

  // Resource actions
  updateMoney: (amount: number) => void;
  updateUsers: (amount: number) => void;
  updateUptime: (amount: number) => void;
  updateReputation: (amount: number) => void;
  updateTechDebt: (amount: number) => void;

  // Team actions
  hireTeamMember: (type: 'developer' | 'designer' | 'marketer') => boolean;
  fireTeamMember: (type: 'developer' | 'designer' | 'marketer') => void;

  // Upgrade actions
  purchaseUpgrade: (upgradeId: string) => boolean;
  upgradeServer: () => boolean;

  // Phase actions
  canAdvancePhase: () => boolean;
  advancePhase: () => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Save/Load
  exportSave: () => string;
  importSave: (saveData: string) => boolean;

  // Tutorial
  completeTutorialStep: () => void;
  skipTutorial: () => void;

  // Computed getters
  getServerCapacity: () => number;
  getServerCost: () => number;
  getTeamSalary: () => number;
  getRevenuePerHour: () => number;
  getTicketSpeed: () => number;
  getUptimeBonus: () => number;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState,
      user: null,
      notifications: [],
      currentEvent: null,

      setUser: (user) => set({ user }),

      startGame: () => {
        set({ isPaused: false });
      },

      pauseGame: () => {
        set({ isPaused: true });
      },

      resumeGame: () => {
        set({ isPaused: false });
      },

      resetGame: () => {
        set({
          ...initialGameState,
          user: get().user, // Keep user logged in
          notifications: [],
          currentEvent: null
        });
      },

      setGameSpeed: (speed) => {
        const maxSpeed = get().user?.subscription === 'enterprise' ? 3 :
                         get().user?.subscription === 'pro' ? 2 :
                         get().user?.subscription === 'starter' ? 1.5 : 1;
        set({ gameSpeed: Math.min(speed, maxSpeed) });
      },

      gameTick: () => {
        const state = get();
        if (state.isPaused) return;

        // Calculate time progression
        let newHour = state.hour + 1;
        let newDay = state.day;
        if (newHour >= 24) {
          newHour = 0;
          newDay += 1;
        }

        // Calculate income (users generate revenue)
        const revenueMultiplier = state.purchasedUpgrades.reduce((mult, id) => {
          const upgrade = getUpgradeById(id);
          return mult + (upgrade?.effect.revenueMultiplier || 0);
        }, 1);
        const hourlyRevenue = state.users * 0.01 * revenueMultiplier;

        // Calculate costs (daily, applied hourly)
        const serverCost = get().getServerCost() / 24;
        const teamSalary = get().getTeamSalary() / 24;
        const hourlyCost = serverCost + teamSalary;

        const netIncome = hourlyRevenue - hourlyCost;
        let newMoney = state.money + netIncome;
        let newTotalEarnings = state.totalEarnings + (netIncome > 0 ? netIncome : 0);
        let newTotalSpent = state.totalSpent + (hourlyCost > 0 ? hourlyCost : 0);

        // Update uptime based on tech debt and capacity
        let newUptime = state.uptime;
        const uptimeBonus = get().getUptimeBonus();

        // Tech debt causes instability
        if (state.techDebt > GAME_CONFIG.techDebtThreshold) {
          newUptime -= Math.random() * 0.1 * ((state.techDebt - 50) / 50);
        }

        // Server capacity issues
        const capacity = get().getServerCapacity();
        if (state.users > capacity) {
          newUptime -= 0.5 * ((state.users - capacity) / capacity);
        }

        // Natural uptime recovery (with bonus from upgrades)
        if (newUptime < 100) {
          newUptime = Math.min(100, newUptime + 0.02 + (uptimeBonus * 0.01));
        }

        // User growth/decline based on uptime and reputation
        let newUsers = state.users;
        const growthFactor = (state.uptime / 100) * (state.reputation / 50) - 0.5;
        const userChange = state.users * GAME_CONFIG.userGrowthRate * growthFactor;
        newUsers = Math.max(0, Math.floor(newUsers + userChange));

        // Peak users tracking
        const newPeakUsers = Math.max(state.peakUsers, newUsers);
        const newLongestUptime = Math.max(state.longestUptime, newUptime);

        // Tech debt accumulation (slight increase over time)
        let newTechDebt = state.techDebt;
        if (Math.random() < 0.05) {
          const techDebtReduction = state.purchasedUpgrades.reduce((red, id) => {
            const upgrade = getUpgradeById(id);
            return red + (upgrade?.effect.techDebtReduction || 0);
          }, 0);
          newTechDebt = Math.min(100, newTechDebt + (0.5 * (1 - techDebtReduction)));
        }

        // Check achievements
        const newState: GameState = {
          ...state,
          hour: newHour,
          day: newDay,
          money: newMoney,
          uptime: Math.max(0, Math.min(100, newUptime)),
          users: newUsers,
          techDebt: Math.max(0, newTechDebt),
          totalEarnings: newTotalEarnings,
          totalSpent: newTotalSpent,
          peakUsers: newPeakUsers,
          longestUptime: newLongestUptime
        };

        const { newAchievements, rewards } = checkAchievements(newState, state.achievements);

        if (newAchievements.length > 0) {
          newMoney += rewards.money;
          newState.money = newMoney;
          newState.reputation = Math.min(100, newState.reputation + rewards.reputation);

          newAchievements.forEach(achievement => {
            get().addNotification({
              type: 'success',
              title: '🏆 업적 달성!',
              message: `${achievement.icon} ${achievement.title}: ${achievement.description}`
            });
          });
        }

        set({
          ...newState,
          achievements: [...state.achievements, ...newAchievements.map(a => a.id)]
        });
      },

      addTicket: (ticket) => {
        set((state) => ({
          tickets: [...state.tickets, ticket]
        }));
      },

      resolveTicket: (ticketId) => {
        const state = get();
        const ticket = state.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const ticketSpeed = get().getTicketSpeed();
        const bonusMultiplier = 1 + ticketSpeed;

        set({
          tickets: state.tickets.filter(t => t.id !== ticketId),
          money: state.money + (ticket.reward * bonusMultiplier),
          resolvedTickets: state.resolvedTickets + 1,
          reputation: Math.min(100, state.reputation + 1)
        });

        get().addNotification({
          type: 'success',
          title: '✅ 티켓 해결!',
          message: `${ticket.title} - $${Math.floor(ticket.reward * bonusMultiplier)} 획득`
        });
      },

      failTicket: (ticketId) => {
        const state = get();
        const ticket = state.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        set({
          tickets: state.tickets.filter(t => t.id !== ticketId),
          money: state.money - ticket.penalty,
          uptime: Math.max(0, state.uptime - ticket.uptimePenalty),
          reputation: Math.max(0, state.reputation - ticket.reputationPenalty),
          failedTickets: state.failedTickets + 1
        });

        get().addNotification({
          type: 'error',
          title: '❌ 티켓 실패!',
          message: `${ticket.title} - $${ticket.penalty} 손실, 업타임 -${ticket.uptimePenalty}%`
        });
      },

      updateTicketTimers: () => {
        const state = get();
        if (state.isPaused) return;

        const updatedTickets = state.tickets.map(ticket => ({
          ...ticket,
          timeLimit: ticket.timeLimit - 1
        }));

        // Check for expired tickets
        const expiredTickets = updatedTickets.filter(t => t.timeLimit <= 0);
        const activeTickets = updatedTickets.filter(t => t.timeLimit > 0);

        expiredTickets.forEach(ticket => {
          get().failTicket(ticket.id);
        });

        set({ tickets: activeTickets });
      },

      triggerEvent: (event) => {
        set({ currentEvent: event, isPaused: true });
      },

      handleEventChoice: (choiceIndex) => {
        const state = get();
        if (!state.currentEvent) return;

        const choice = state.currentEvent.choices[choiceIndex];
        if (!choice) return;

        const effects = choice.effect;
        let updates: Partial<GameState> = {};

        if (effects.money) updates.money = state.money + effects.money;
        if (effects.users) updates.users = Math.max(0, state.users + effects.users);
        if (effects.uptime) updates.uptime = Math.max(0, Math.min(100, state.uptime + effects.uptime));
        if (effects.reputation) updates.reputation = Math.max(0, Math.min(100, state.reputation + effects.reputation));
        if (effects.techDebt) updates.techDebt = Math.max(0, Math.min(100, state.techDebt + effects.techDebt));
        if (effects.day) updates.day = state.day + effects.day;

        set({
          ...updates,
          currentEvent: null,
          isPaused: false
        });

        get().addNotification({
          type: 'info',
          title: state.currentEvent.title,
          message: `선택: ${choice.text}`
        });
      },

      dismissEvent: () => {
        set({ currentEvent: null, isPaused: false });
      },

      updateMoney: (amount) => {
        set((state) => ({
          money: state.money + amount,
          totalEarnings: amount > 0 ? state.totalEarnings + amount : state.totalEarnings,
          totalSpent: amount < 0 ? state.totalSpent - amount : state.totalSpent
        }));
      },

      updateUsers: (amount) => {
        set((state) => ({
          users: Math.max(0, state.users + amount),
          peakUsers: Math.max(state.peakUsers, state.users + amount)
        }));
      },

      updateUptime: (amount) => {
        set((state) => ({
          uptime: Math.max(0, Math.min(100, state.uptime + amount)),
          longestUptime: Math.max(state.longestUptime, state.uptime + amount)
        }));
      },

      updateReputation: (amount) => {
        set((state) => ({
          reputation: Math.max(0, Math.min(100, state.reputation + amount))
        }));
      },

      updateTechDebt: (amount) => {
        set((state) => ({
          techDebt: Math.max(0, Math.min(100, state.techDebt + amount))
        }));
      },

      hireTeamMember: (type) => {
        const state = get();
        const cost = GAME_CONFIG.hiringCosts[type];

        if (state.money < cost) {
          get().addNotification({
            type: 'error',
            title: '고용 실패',
            message: '자금이 부족합니다.'
          });
          return false;
        }

        const newMember: TeamMember = {
          id: uuidv4(),
          type,
          name: `${type} ${state.team[type + 's' as keyof typeof state.team] + 1}`,
          level: 1,
          salary: GAME_CONFIG.salaries[type],
          efficiency: 1
        };

        set({
          money: state.money - cost,
          team: {
            ...state.team,
            [type + 's']: state.team[type + 's' as keyof typeof state.team] + 1
          },
          teamMembers: [...state.teamMembers, newMember]
        });

        get().addNotification({
          type: 'success',
          title: '새 팀원 고용!',
          message: `${type === 'developer' ? '개발자' : type === 'designer' ? '디자이너' : '마케터'}를 고용했습니다.`
        });

        return true;
      },

      fireTeamMember: (type) => {
        const state = get();
        const key = type + 's' as keyof typeof state.team;

        if (state.team[key] <= 0) return;

        const memberToRemove = state.teamMembers.find(m => m.type === type);

        set({
          team: {
            ...state.team,
            [key]: state.team[key] - 1
          },
          teamMembers: memberToRemove
            ? state.teamMembers.filter(m => m.id !== memberToRemove.id)
            : state.teamMembers
        });
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get();
        const upgrade = getUpgradeById(upgradeId);

        if (!upgrade) return false;
        if (state.purchasedUpgrades.includes(upgradeId)) return false;
        if (state.money < upgrade.cost) {
          get().addNotification({
            type: 'error',
            title: '구매 실패',
            message: '자금이 부족합니다.'
          });
          return false;
        }

        // Check requirements
        if (upgrade.requires) {
          const hasAllRequirements = upgrade.requires.every(reqId =>
            state.purchasedUpgrades.includes(reqId)
          );
          if (!hasAllRequirements) {
            get().addNotification({
              type: 'error',
              title: '구매 실패',
              message: '선행 업그레이드가 필요합니다.'
            });
            return false;
          }
        }

        set({
          money: state.money - upgrade.cost,
          purchasedUpgrades: [...state.purchasedUpgrades, upgradeId]
        });

        get().addNotification({
          type: 'success',
          title: '업그레이드 완료!',
          message: `${upgrade.name}을(를) 구매했습니다.`
        });

        return true;
      },

      upgradeServer: () => {
        const state = get();
        if (state.serverTier >= 5) return false;

        const cost = GAME_CONFIG.serverCosts[state.serverTier + 1] * 10; // 10 days worth as upgrade cost

        if (state.money < cost) {
          get().addNotification({
            type: 'error',
            title: '업그레이드 실패',
            message: '자금이 부족합니다.'
          });
          return false;
        }

        set({
          money: state.money - cost,
          serverTier: state.serverTier + 1
        });

        get().addNotification({
          type: 'success',
          title: '서버 업그레이드!',
          message: `서버 Tier ${state.serverTier + 1}로 업그레이드했습니다.`
        });

        return true;
      },

      canAdvancePhase: () => {
        const state = get();
        if (state.phase === 'app') return false;

        const nextPhase = state.phase === 'web' ? 'mobile' : 'app';
        const requirements = GAME_CONFIG.phaseRequirements[nextPhase];

        return (
          state.users >= requirements.users &&
          state.money >= requirements.money &&
          state.reputation >= requirements.reputation
        );
      },

      advancePhase: () => {
        const state = get();
        if (!get().canAdvancePhase()) return;

        const nextPhase: Phase = state.phase === 'web' ? 'mobile' : 'app';

        set({ phase: nextPhase });

        get().addNotification({
          type: 'success',
          title: '🎉 새로운 단계!',
          message: `${nextPhase === 'mobile' ? '모바일 웹' : '네이티브 앱'} 단계로 진입했습니다!`
        });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: uuidv4(),
          createdAt: Date.now(),
          read: false
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50)
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      exportSave: () => {
        const state = get();
        const saveData = {
          gameState: {
            uptime: state.uptime,
            money: state.money,
            users: state.users,
            reputation: state.reputation,
            phase: state.phase,
            day: state.day,
            hour: state.hour,
            techDebt: state.techDebt,
            team: state.team,
            teamMembers: state.teamMembers,
            serverTier: state.serverTier,
            purchasedUpgrades: state.purchasedUpgrades,
            tickets: state.tickets,
            resolvedTickets: state.resolvedTickets,
            failedTickets: state.failedTickets,
            achievements: state.achievements,
            totalEarnings: state.totalEarnings,
            totalSpent: state.totalSpent,
            peakUsers: state.peakUsers,
            longestUptime: state.longestUptime,
            isPaused: true,
            gameSpeed: state.gameSpeed,
            tutorialCompleted: state.tutorialCompleted,
            tutorialStep: state.tutorialStep
          },
          version: '1.0.0',
          exportedAt: Date.now()
        };
        return btoa(JSON.stringify(saveData));
      },

      importSave: (saveData) => {
        try {
          const parsed = JSON.parse(atob(saveData));
          if (!parsed.gameState) return false;

          set({
            ...parsed.gameState,
            isPaused: true
          });

          get().addNotification({
            type: 'success',
            title: '저장 데이터 불러오기 완료',
            message: '게임이 복원되었습니다.'
          });

          return true;
        } catch {
          get().addNotification({
            type: 'error',
            title: '불러오기 실패',
            message: '잘못된 저장 데이터입니다.'
          });
          return false;
        }
      },

      completeTutorialStep: () => {
        set((state) => ({
          tutorialStep: state.tutorialStep + 1,
          tutorialCompleted: state.tutorialStep >= 5
        }));
      },

      skipTutorial: () => {
        set({ tutorialCompleted: true, tutorialStep: 999 });
      },

      getServerCapacity: () => {
        const state = get();
        const baseCapacity = GAME_CONFIG.serverCapacity[state.serverTier] || 100;
        const upgradeBonus = state.purchasedUpgrades.reduce((bonus, id) => {
          const upgrade = getUpgradeById(id);
          return bonus + (upgrade?.effect.serverCapacity || 0);
        }, 0);
        return baseCapacity + upgradeBonus;
      },

      getServerCost: () => {
        const state = get();
        return GAME_CONFIG.serverCosts[state.serverTier] || 0;
      },

      getTeamSalary: () => {
        const state = get();
        return (
          state.team.developers * GAME_CONFIG.salaries.developer +
          state.team.designers * GAME_CONFIG.salaries.designer +
          state.team.marketers * GAME_CONFIG.salaries.marketer
        );
      },

      getRevenuePerHour: () => {
        const state = get();
        const revenueMultiplier = state.purchasedUpgrades.reduce((mult, id) => {
          const upgrade = getUpgradeById(id);
          return mult + (upgrade?.effect.revenueMultiplier || 0);
        }, 1);
        return state.users * 0.01 * revenueMultiplier;
      },

      getTicketSpeed: () => {
        const state = get();
        return state.purchasedUpgrades.reduce((speed, id) => {
          const upgrade = getUpgradeById(id);
          return speed + (upgrade?.effect.ticketSpeed || 0);
        }, 0);
      },

      getUptimeBonus: () => {
        const state = get();
        return state.purchasedUpgrades.reduce((bonus, id) => {
          const upgrade = getUpgradeById(id);
          return bonus + (upgrade?.effect.uptimeBonus || 0);
        }, 0);
      }
    }),
    {
      name: 'uptime-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        uptime: state.uptime,
        money: state.money,
        users: state.users,
        reputation: state.reputation,
        phase: state.phase,
        day: state.day,
        hour: state.hour,
        techDebt: state.techDebt,
        team: state.team,
        teamMembers: state.teamMembers,
        serverTier: state.serverTier,
        purchasedUpgrades: state.purchasedUpgrades,
        tickets: state.tickets,
        resolvedTickets: state.resolvedTickets,
        failedTickets: state.failedTickets,
        achievements: state.achievements,
        totalEarnings: state.totalEarnings,
        totalSpent: state.totalSpent,
        peakUsers: state.peakUsers,
        longestUptime: state.longestUptime,
        gameSpeed: state.gameSpeed,
        tutorialCompleted: state.tutorialCompleted,
        tutorialStep: state.tutorialStep,
        user: state.user
      })
    }
  )
);

// Selectors for optimized re-renders
export const selectUptime = (state: GameStore) => state.uptime;
export const selectMoney = (state: GameStore) => state.money;
export const selectUsers = (state: GameStore) => state.users;
export const selectReputation = (state: GameStore) => state.reputation;
export const selectPhase = (state: GameStore) => state.phase;
export const selectDay = (state: GameStore) => state.day;
export const selectTickets = (state: GameStore) => state.tickets;
export const selectIsPaused = (state: GameStore) => state.isPaused;
export const selectCurrentEvent = (state: GameStore) => state.currentEvent;
export const selectNotifications = (state: GameStore) => state.notifications;
export const selectTechDebt = (state: GameStore) => state.techDebt;
export const selectTeam = (state: GameStore) => state.team;
export const selectServerTier = (state: GameStore) => state.serverTier;
export const selectAchievements = (state: GameStore) => state.achievements;
export const selectUser = (state: GameStore) => state.user;
