import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  hidden: boolean;
  unlockedAt?: Date;
  progress?: number;
}

export type AchievementCategory =
  | 'uptime'      // 업타임 관련
  | 'tickets'     // 티켓 처리
  | 'money'       // 수익
  | 'events'      // 이벤트 처리
  | 'team'        // 팀 관리
  | 'upgrades'    // 업그레이드
  | 'streak'      // 연속 플레이
  | 'special'     // 특별 업적
  | 'secret';     // 숨겨진 업적

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AchievementRequirement {
  type: string;
  target: number;
  condition?: string;
}

export interface AchievementReward {
  coins?: number;
  gems?: number;
  title?: string;
  badge?: string;
  theme?: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: AchievementRequirement;
  reward: AchievementReward;
  expiresAt: Date;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// All achievements
export const achievements: Achievement[] = [
  // Uptime Category
  {
    id: 'uptime_beginner',
    name: '첫 발걸음',
    description: '업타임 50% 이상으로 게임 완료',
    icon: '🌱',
    category: 'uptime',
    tier: 'bronze',
    requirement: { type: 'uptime_min', target: 50 },
    reward: { coins: 100 },
    hidden: false
  },
  {
    id: 'uptime_stable',
    name: '안정적인 서버',
    description: '업타임 80% 이상으로 게임 완료',
    icon: '🌿',
    category: 'uptime',
    tier: 'silver',
    requirement: { type: 'uptime_min', target: 80 },
    reward: { coins: 300, badge: '🌿' },
    hidden: false
  },
  {
    id: 'uptime_reliable',
    name: '신뢰할 수 있는 서비스',
    description: '업타임 95% 이상으로 게임 완료',
    icon: '🌳',
    category: 'uptime',
    tier: 'gold',
    requirement: { type: 'uptime_min', target: 95 },
    reward: { coins: 500, gems: 10, badge: '🌳' },
    hidden: false
  },
  {
    id: 'uptime_master',
    name: '업타임 마스터',
    description: '업타임 99% 이상으로 게임 완료',
    icon: '⚡',
    category: 'uptime',
    tier: 'platinum',
    requirement: { type: 'uptime_min', target: 99 },
    reward: { coins: 1000, gems: 50, title: '업타임 마스터', badge: '⚡' },
    hidden: false
  },
  {
    id: 'uptime_perfect',
    name: '완벽한 가동',
    description: '업타임 99.99% 이상으로 게임 완료',
    icon: '💎',
    category: 'uptime',
    tier: 'diamond',
    requirement: { type: 'uptime_min', target: 99.99 },
    reward: { coins: 5000, gems: 200, title: '완벽주의자', theme: 'diamond' },
    hidden: false
  },

  // Tickets Category
  {
    id: 'ticket_10',
    name: '티켓 처리 시작',
    description: '10개의 티켓 해결',
    icon: '🎫',
    category: 'tickets',
    tier: 'bronze',
    requirement: { type: 'tickets_resolved', target: 10 },
    reward: { coins: 50 },
    hidden: false
  },
  {
    id: 'ticket_100',
    name: '티켓 헌터',
    description: '100개의 티켓 해결',
    icon: '🎯',
    category: 'tickets',
    tier: 'silver',
    requirement: { type: 'tickets_resolved', target: 100 },
    reward: { coins: 200, badge: '🎯' },
    hidden: false
  },
  {
    id: 'ticket_500',
    name: '티켓 마스터',
    description: '500개의 티켓 해결',
    icon: '🏆',
    category: 'tickets',
    tier: 'gold',
    requirement: { type: 'tickets_resolved', target: 500 },
    reward: { coins: 500, gems: 20, badge: '🏆' },
    hidden: false
  },
  {
    id: 'ticket_1000',
    name: '티켓 히어로',
    description: '1000개의 티켓 해결',
    icon: '🦸',
    category: 'tickets',
    tier: 'platinum',
    requirement: { type: 'tickets_resolved', target: 1000 },
    reward: { coins: 1000, gems: 50, title: '티켓 히어로' },
    hidden: false
  },
  {
    id: 'ticket_5000',
    name: '티켓 레전드',
    description: '5000개의 티켓 해결',
    icon: '👑',
    category: 'tickets',
    tier: 'diamond',
    requirement: { type: 'tickets_resolved', target: 5000 },
    reward: { coins: 5000, gems: 200, title: '티켓 레전드', badge: '👑' },
    hidden: false
  },
  {
    id: 'ticket_speed',
    name: '스피드 러너',
    description: '30초 내에 티켓 5개 해결',
    icon: '⏱️',
    category: 'tickets',
    tier: 'gold',
    requirement: { type: 'tickets_speed', target: 5, condition: '30s' },
    reward: { coins: 300, gems: 10 },
    hidden: false
  },

  // Money Category
  {
    id: 'money_1k',
    name: '첫 수익',
    description: '$1,000 벌기',
    icon: '💵',
    category: 'money',
    tier: 'bronze',
    requirement: { type: 'money_earned', target: 1000 },
    reward: { coins: 100 },
    hidden: false
  },
  {
    id: 'money_10k',
    name: '사업 시작',
    description: '$10,000 벌기',
    icon: '💰',
    category: 'money',
    tier: 'silver',
    requirement: { type: 'money_earned', target: 10000 },
    reward: { coins: 300 },
    hidden: false
  },
  {
    id: 'money_100k',
    name: '성장하는 기업',
    description: '$100,000 벌기',
    icon: '🏦',
    category: 'money',
    tier: 'gold',
    requirement: { type: 'money_earned', target: 100000 },
    reward: { coins: 500, gems: 20 },
    hidden: false
  },
  {
    id: 'money_1m',
    name: '백만장자',
    description: '$1,000,000 벌기',
    icon: '💎',
    category: 'money',
    tier: 'platinum',
    requirement: { type: 'money_earned', target: 1000000 },
    reward: { coins: 2000, gems: 100, title: '백만장자' },
    hidden: false
  },
  {
    id: 'money_10m',
    name: '억만장자',
    description: '$10,000,000 벌기',
    icon: '🌟',
    category: 'money',
    tier: 'diamond',
    requirement: { type: 'money_earned', target: 10000000 },
    reward: { coins: 10000, gems: 500, title: '억만장자', theme: 'gold' },
    hidden: false
  },

  // Events Category
  {
    id: 'event_10',
    name: '이벤트 핸들러',
    description: '10개의 이벤트 처리',
    icon: '🔔',
    category: 'events',
    tier: 'bronze',
    requirement: { type: 'events_handled', target: 10 },
    reward: { coins: 100 },
    hidden: false
  },
  {
    id: 'event_50',
    name: '위기 관리자',
    description: '50개의 이벤트 처리',
    icon: '🚨',
    category: 'events',
    tier: 'silver',
    requirement: { type: 'events_handled', target: 50 },
    reward: { coins: 300, badge: '🚨' },
    hidden: false
  },
  {
    id: 'event_200',
    name: '비상 대응 전문가',
    description: '200개의 이벤트 처리',
    icon: '🛡️',
    category: 'events',
    tier: 'gold',
    requirement: { type: 'events_handled', target: 200 },
    reward: { coins: 500, gems: 30 },
    hidden: false
  },
  {
    id: 'event_ddos',
    name: 'DDoS 방어자',
    description: 'DDoS 공격 5회 성공적으로 방어',
    icon: '🔒',
    category: 'events',
    tier: 'gold',
    requirement: { type: 'event_type', target: 5, condition: 'ddos' },
    reward: { coins: 500, gems: 20, badge: '🔒' },
    hidden: false
  },

  // Team Category
  {
    id: 'team_5',
    name: '팀 빌딩',
    description: '팀원 5명 고용',
    icon: '👥',
    category: 'team',
    tier: 'bronze',
    requirement: { type: 'team_size', target: 5 },
    reward: { coins: 200 },
    hidden: false
  },
  {
    id: 'team_10',
    name: '성장하는 팀',
    description: '팀원 10명 고용',
    icon: '🏢',
    category: 'team',
    tier: 'silver',
    requirement: { type: 'team_size', target: 10 },
    reward: { coins: 400, badge: '🏢' },
    hidden: false
  },
  {
    id: 'team_balanced',
    name: '밸런스 마스터',
    description: '개발자, 디자이너, 마케터 각 3명 이상 보유',
    icon: '⚖️',
    category: 'team',
    tier: 'gold',
    requirement: { type: 'team_balanced', target: 3 },
    reward: { coins: 500, gems: 20 },
    hidden: false
  },

  // Upgrades Category
  {
    id: 'upgrade_5',
    name: '개선의 시작',
    description: '5개의 업그레이드 구매',
    icon: '🔧',
    category: 'upgrades',
    tier: 'bronze',
    requirement: { type: 'upgrades_purchased', target: 5 },
    reward: { coins: 150 },
    hidden: false
  },
  {
    id: 'upgrade_15',
    name: '기술 투자자',
    description: '15개의 업그레이드 구매',
    icon: '⚙️',
    category: 'upgrades',
    tier: 'silver',
    requirement: { type: 'upgrades_purchased', target: 15 },
    reward: { coins: 400 },
    hidden: false
  },
  {
    id: 'upgrade_all',
    name: '풀 스펙',
    description: '모든 업그레이드 구매',
    icon: '🎖️',
    category: 'upgrades',
    tier: 'diamond',
    requirement: { type: 'upgrades_all', target: 1 },
    reward: { coins: 2000, gems: 100, title: '풀 스펙 엔지니어' },
    hidden: false
  },

  // Streak Category
  {
    id: 'streak_3',
    name: '꾸준한 시작',
    description: '3일 연속 플레이',
    icon: '📅',
    category: 'streak',
    tier: 'bronze',
    requirement: { type: 'streak_days', target: 3 },
    reward: { coins: 100 },
    hidden: false
  },
  {
    id: 'streak_7',
    name: '일주일의 헌신',
    description: '7일 연속 플레이',
    icon: '🗓️',
    category: 'streak',
    tier: 'silver',
    requirement: { type: 'streak_days', target: 7 },
    reward: { coins: 300, gems: 10 },
    hidden: false
  },
  {
    id: 'streak_30',
    name: '한 달의 약속',
    description: '30일 연속 플레이',
    icon: '📆',
    category: 'streak',
    tier: 'gold',
    requirement: { type: 'streak_days', target: 30 },
    reward: { coins: 1000, gems: 50, title: '철벽 수비수' },
    hidden: false
  },
  {
    id: 'streak_100',
    name: '100일의 기적',
    description: '100일 연속 플레이',
    icon: '🏅',
    category: 'streak',
    tier: 'diamond',
    requirement: { type: 'streak_days', target: 100 },
    reward: { coins: 5000, gems: 200, title: '철인', theme: 'streak' },
    hidden: false
  },

  // Special Category
  {
    id: 'first_game',
    name: '새로운 시작',
    description: '첫 번째 게임 완료',
    icon: '🎮',
    category: 'special',
    tier: 'bronze',
    requirement: { type: 'games_played', target: 1 },
    reward: { coins: 50 },
    hidden: false
  },
  {
    id: 'games_10',
    name: '익숙해지기',
    description: '10번째 게임 완료',
    icon: '🎲',
    category: 'special',
    tier: 'silver',
    requirement: { type: 'games_played', target: 10 },
    reward: { coins: 200 },
    hidden: false
  },
  {
    id: 'games_100',
    name: '베테랑',
    description: '100번째 게임 완료',
    icon: '🎯',
    category: 'special',
    tier: 'gold',
    requirement: { type: 'games_played', target: 100 },
    reward: { coins: 1000, gems: 50, title: '베테랑' },
    hidden: false
  },
  {
    id: 'phase_max',
    name: '엔드게임',
    description: '마지막 단계 도달',
    icon: '🚀',
    category: 'special',
    tier: 'platinum',
    requirement: { type: 'phase_reached', target: 5 },
    reward: { coins: 1000, gems: 50 },
    hidden: false
  },

  // Secret Category
  {
    id: 'secret_night',
    name: '야행성',
    description: '자정에서 새벽 4시 사이에 게임 완료',
    icon: '🌙',
    category: 'secret',
    tier: 'silver',
    requirement: { type: 'play_time', target: 1, condition: 'night' },
    reward: { coins: 300, badge: '🌙' },
    hidden: true
  },
  {
    id: 'secret_comeback',
    name: '기적의 컴백',
    description: '업타임 30% 이하에서 90% 이상으로 회복',
    icon: '🔥',
    category: 'secret',
    tier: 'gold',
    requirement: { type: 'comeback', target: 1 },
    reward: { coins: 500, gems: 25, badge: '🔥' },
    hidden: true
  },
  {
    id: 'secret_no_upgrade',
    name: '순수주의자',
    description: '업그레이드 없이 90% 업타임으로 완료',
    icon: '🧘',
    category: 'secret',
    tier: 'platinum',
    requirement: { type: 'no_upgrade_win', target: 1 },
    reward: { coins: 1000, gems: 50, title: '순수주의자' },
    hidden: true
  },
  {
    id: 'secret_speedrun',
    name: '스피드러너',
    description: '5분 내에 Phase 3 도달',
    icon: '⚡',
    category: 'secret',
    tier: 'gold',
    requirement: { type: 'speedrun', target: 1, condition: '5min_phase3' },
    reward: { coins: 500, gems: 30 },
    hidden: true
  }
];

// Tier info
export const tierInfo: Record<AchievementTier, { name: string; color: string; points: number }> = {
  bronze: { name: '브론즈', color: '#cd7f32', points: 10 },
  silver: { name: '실버', color: '#c0c0c0', points: 25 },
  gold: { name: '골드', color: '#ffd700', points: 50 },
  platinum: { name: '플래티넘', color: '#e5e4e2', points: 100 },
  diamond: { name: '다이아몬드', color: '#b9f2ff', points: 250 }
};

// Category info
export const categoryInfo: Record<AchievementCategory, { name: string; icon: string }> = {
  uptime: { name: '업타임', icon: '⚡' },
  tickets: { name: '티켓', icon: '🎫' },
  money: { name: '수익', icon: '💰' },
  events: { name: '이벤트', icon: '🔔' },
  team: { name: '팀', icon: '👥' },
  upgrades: { name: '업그레이드', icon: '🔧' },
  streak: { name: '연속', icon: '📅' },
  special: { name: '특별', icon: '⭐' },
  secret: { name: '비밀', icon: '🔒' }
};

// Achievement Store
interface AchievementState {
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  activeChallenges: Challenge[];
  totalPoints: number;

  // Actions
  unlockAchievement: (id: string) => boolean;
  updateProgress: (type: string, value: number, condition?: string) => void;
  checkAchievements: (stats: GameStats) => Achievement[];
  generateDailyChallenges: () => void;
  completeChallenge: (id: string) => void;
  claimChallenge: (id: string) => AchievementReward | null;
}

export interface GameStats {
  uptime: number;
  ticketsResolved: number;
  moneyEarned: number;
  eventsHandled: number;
  teamSize: number;
  teamDevelopers: number;
  teamDesigners: number;
  teamMarketers: number;
  upgradesPurchased: number;
  gamesPlayed: number;
  streakDays: number;
  phaseReached: number;
  playTime: number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      achievementProgress: {},
      activeChallenges: [],
      totalPoints: 0,

      unlockAchievement: (id: string) => {
        const state = get();
        if (state.unlockedAchievements.includes(id)) return false;

        const achievement = achievements.find(a => a.id === id);
        if (!achievement) return false;

        const points = tierInfo[achievement.tier].points;

        set({
          unlockedAchievements: [...state.unlockedAchievements, id],
          totalPoints: state.totalPoints + points
        });

        return true;
      },

      updateProgress: (type: string, value: number, condition?: string) => {
        set(state => ({
          achievementProgress: {
            ...state.achievementProgress,
            [`${type}${condition ? `_${condition}` : ''}`]: value
          }
        }));
      },

      checkAchievements: (stats: GameStats) => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of achievements) {
          if (state.unlockedAchievements.includes(achievement.id)) continue;

          let isUnlocked = false;
          const req = achievement.requirement;

          switch (req.type) {
            case 'uptime_min':
              isUnlocked = stats.uptime >= req.target;
              break;
            case 'tickets_resolved':
              isUnlocked = stats.ticketsResolved >= req.target;
              break;
            case 'money_earned':
              isUnlocked = stats.moneyEarned >= req.target;
              break;
            case 'events_handled':
              isUnlocked = stats.eventsHandled >= req.target;
              break;
            case 'team_size':
              isUnlocked = stats.teamSize >= req.target;
              break;
            case 'team_balanced':
              isUnlocked = stats.teamDevelopers >= req.target &&
                          stats.teamDesigners >= req.target &&
                          stats.teamMarketers >= req.target;
              break;
            case 'upgrades_purchased':
              isUnlocked = stats.upgradesPurchased >= req.target;
              break;
            case 'games_played':
              isUnlocked = stats.gamesPlayed >= req.target;
              break;
            case 'streak_days':
              isUnlocked = stats.streakDays >= req.target;
              break;
            case 'phase_reached':
              isUnlocked = stats.phaseReached >= req.target;
              break;
            case 'play_time':
              if (req.condition === 'night') {
                const hour = new Date().getHours();
                isUnlocked = hour >= 0 && hour < 4;
              }
              break;
          }

          if (isUnlocked) {
            get().unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement);
          }
        }

        return newlyUnlocked;
      },

      generateDailyChallenges: () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const dailyChallenges: Challenge[] = [
          {
            id: `daily_${now.toISOString().split('T')[0]}_1`,
            name: '일일 업타임',
            description: '오늘 평균 업타임 90% 이상 유지',
            icon: '⚡',
            type: 'daily',
            requirement: { type: 'daily_uptime', target: 90 },
            reward: { coins: 100 },
            expiresAt: tomorrow,
            progress: 0,
            completed: false,
            claimed: false
          },
          {
            id: `daily_${now.toISOString().split('T')[0]}_2`,
            name: '티켓 처리',
            description: '오늘 20개의 티켓 해결',
            icon: '🎫',
            type: 'daily',
            requirement: { type: 'daily_tickets', target: 20 },
            reward: { coins: 80 },
            expiresAt: tomorrow,
            progress: 0,
            completed: false,
            claimed: false
          },
          {
            id: `daily_${now.toISOString().split('T')[0]}_3`,
            name: '3게임 플레이',
            description: '오늘 3게임 플레이',
            icon: '🎮',
            type: 'daily',
            requirement: { type: 'daily_games', target: 3 },
            reward: { coins: 120 },
            expiresAt: tomorrow,
            progress: 0,
            completed: false,
            claimed: false
          }
        ];

        const weeklyChallenges: Challenge[] = [
          {
            id: `weekly_${now.toISOString().split('T')[0]}_1`,
            name: '주간 점수',
            description: '이번 주 총 10,000점 달성',
            icon: '🏆',
            type: 'weekly',
            requirement: { type: 'weekly_score', target: 10000 },
            reward: { coins: 500, gems: 20 },
            expiresAt: nextWeek,
            progress: 0,
            completed: false,
            claimed: false
          },
          {
            id: `weekly_${now.toISOString().split('T')[0]}_2`,
            name: '연속 플레이',
            description: '7일 연속 로그인',
            icon: '📅',
            type: 'weekly',
            requirement: { type: 'weekly_streak', target: 7 },
            reward: { coins: 300, gems: 10 },
            expiresAt: nextWeek,
            progress: 0,
            completed: false,
            claimed: false
          }
        ];

        set({ activeChallenges: [...dailyChallenges, ...weeklyChallenges] });
      },

      completeChallenge: (id: string) => {
        set(state => ({
          activeChallenges: state.activeChallenges.map(c =>
            c.id === id ? { ...c, completed: true } : c
          )
        }));
      },

      claimChallenge: (id: string) => {
        const state = get();
        const challenge = state.activeChallenges.find(c => c.id === id);
        if (!challenge || !challenge.completed || challenge.claimed) return null;

        set({
          activeChallenges: state.activeChallenges.map(c =>
            c.id === id ? { ...c, claimed: true } : c
          )
        });

        return challenge.reward;
      }
    }),
    {
      name: 'achievement-storage'
    }
  )
);

// Utility functions
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return achievements.filter(a => a.category === category);
};

export const getUnlockedAchievements = (unlockedIds: string[]): Achievement[] => {
  return achievements.filter(a => unlockedIds.includes(a.id));
};

export const getLockedAchievements = (unlockedIds: string[]): Achievement[] => {
  return achievements.filter(a => !unlockedIds.includes(a.id) && !a.hidden);
};

export const calculateTotalPoints = (unlockedIds: string[]): number => {
  return achievements
    .filter(a => unlockedIds.includes(a.id))
    .reduce((sum, a) => sum + tierInfo[a.tier].points, 0);
};

export const getAchievementProgress = (achievement: Achievement, stats: GameStats): number => {
  const req = achievement.requirement;
  let current = 0;

  switch (req.type) {
    case 'uptime_min':
      current = stats.uptime;
      break;
    case 'tickets_resolved':
      current = stats.ticketsResolved;
      break;
    case 'money_earned':
      current = stats.moneyEarned;
      break;
    case 'events_handled':
      current = stats.eventsHandled;
      break;
    case 'team_size':
      current = stats.teamSize;
      break;
    case 'upgrades_purchased':
      current = stats.upgradesPurchased;
      break;
    case 'games_played':
      current = stats.gamesPlayed;
      break;
    case 'streak_days':
      current = stats.streakDays;
      break;
    case 'phase_reached':
      current = stats.phaseReached;
      break;
  }

  return Math.min(100, (current / req.target) * 100);
};
