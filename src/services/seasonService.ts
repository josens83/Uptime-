import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

// Types
export interface Season {
  id: string;
  name: string;
  theme: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  rewards: SeasonReward[];
  leaderboard: SeasonPlayer[];
  challenges: SeasonChallenge[];
  specialEvents: SeasonEvent[];
}

export interface SeasonReward {
  rank: number | string; // 1, 2, 3 or "top10", "top100"
  title: string;
  rewards: {
    coins: number;
    gems: number;
    badge?: string;
    title?: string;
    theme?: string;
  };
}

export interface SeasonPlayer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  gamesPlayed: number;
  bestUptime: number;
  tier: SeasonTier;
  badges: string[];
}

export interface SeasonChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  type: 'daily' | 'weekly' | 'season';
  expiresAt?: Date;
}

export interface SeasonEvent {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  startTime: Date;
  endTime: Date;
  active: boolean;
}

export type SeasonTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';

export const tierInfo: Record<SeasonTier, { name: string; color: string; minScore: number; icon: string }> = {
  bronze: { name: '브론즈', color: '#cd7f32', minScore: 0, icon: '🥉' },
  silver: { name: '실버', color: '#c0c0c0', minScore: 1000, icon: '🥈' },
  gold: { name: '골드', color: '#ffd700', minScore: 3000, icon: '🥇' },
  platinum: { name: '플래티넘', color: '#e5e4e2', minScore: 6000, icon: '💎' },
  diamond: { name: '다이아몬드', color: '#b9f2ff', minScore: 10000, icon: '💠' },
  master: { name: '마스터', color: '#ff6b6b', minScore: 20000, icon: '🔥' },
  grandmaster: { name: '그랜드마스터', color: '#9b59b6', minScore: 50000, icon: '👑' }
};

// Get tier from score
export const getTierFromScore = (score: number): SeasonTier => {
  const tiers = Object.entries(tierInfo).reverse();
  for (const [tier, info] of tiers) {
    if (score >= info.minScore) {
      return tier as SeasonTier;
    }
  }
  return 'bronze';
};

// Demo data
const demoSeason: Season = {
  id: 'season-1',
  name: '시즌 1: 서버 런칭',
  theme: 'launch',
  description: '첫 번째 시즌! 최고의 업타임을 달성하고 특별 보상을 획득하세요.',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-03-31'),
  status: 'active',
  rewards: [
    {
      rank: 1,
      title: '시즌 챔피언',
      rewards: { coins: 10000, gems: 500, badge: '🏆', title: '서버 마스터' }
    },
    {
      rank: 2,
      title: '준우승',
      rewards: { coins: 5000, gems: 250, badge: '🥈' }
    },
    {
      rank: 3,
      title: '3위',
      rewards: { coins: 3000, gems: 150, badge: '🥉' }
    },
    {
      rank: 'top10',
      title: 'Top 10',
      rewards: { coins: 1000, gems: 50 }
    },
    {
      rank: 'top100',
      title: 'Top 100',
      rewards: { coins: 500, gems: 25 }
    }
  ],
  leaderboard: [
    { id: '1', name: 'UptimeKing', score: 52400, rank: 1, gamesPlayed: 150, bestUptime: 99.99, tier: 'grandmaster', badges: ['🏆', '🔥'] },
    { id: '2', name: 'ServerMaster', score: 48200, rank: 2, gamesPlayed: 142, bestUptime: 99.95, tier: 'master', badges: ['⚡'] },
    { id: '3', name: 'CloudNinja', score: 43800, rank: 3, gamesPlayed: 138, bestUptime: 99.90, tier: 'master', badges: ['🌟'] },
    { id: '4', name: 'DevOpsHero', score: 38500, rank: 4, gamesPlayed: 125, bestUptime: 99.85, tier: 'master', badges: [] },
    { id: '5', name: 'InfraWizard', score: 32100, rank: 5, gamesPlayed: 118, bestUptime: 99.80, tier: 'master', badges: [] },
    { id: '6', name: 'SystemAdmin', score: 28400, rank: 6, gamesPlayed: 110, bestUptime: 99.75, tier: 'master', badges: [] },
    { id: '7', name: 'CodeRunner', score: 24200, rank: 7, gamesPlayed: 102, bestUptime: 99.70, tier: 'master', badges: [] },
    { id: '8', name: 'DataFlow', score: 19800, rank: 8, gamesPlayed: 95, bestUptime: 99.65, tier: 'diamond', badges: [] },
    { id: '9', name: 'NetManager', score: 15600, rank: 9, gamesPlayed: 88, bestUptime: 99.60, tier: 'diamond', badges: [] },
    { id: '10', name: 'BackendPro', score: 12400, rank: 10, gamesPlayed: 80, bestUptime: 99.55, tier: 'diamond', badges: [] }
  ],
  challenges: [
    { id: 'daily-1', title: '일일 플레이', description: '오늘 3게임 플레이하기', target: 3, current: 1, reward: 100, type: 'daily' },
    { id: 'daily-2', title: '업타임 유지', description: '95% 이상 업타임으로 게임 완료', target: 1, current: 0, reward: 150, type: 'daily' },
    { id: 'weekly-1', title: '주간 점수', description: '이번 주 5000점 달성', target: 5000, current: 2400, reward: 500, type: 'weekly' },
    { id: 'weekly-2', title: '연속 플레이', description: '7일 연속 로그인', target: 7, current: 3, reward: 300, type: 'weekly' },
    { id: 'season-1', title: '시즌 마스터', description: '시즌 동안 100게임 플레이', target: 100, current: 45, reward: 2000, type: 'season' },
    { id: 'season-2', title: '완벽한 운영', description: '99.9% 업타임 달성', target: 1, current: 0, reward: 5000, type: 'season' }
  ],
  specialEvents: [
    {
      id: 'event-1',
      name: '더블 XP 주말',
      description: '주말 동안 경험치 2배!',
      multiplier: 2,
      startTime: new Date(),
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      active: true
    }
  ]
};

const demoPlayerStats: SeasonPlayer = {
  id: 'demo-player',
  name: 'Player',
  score: 8500,
  rank: 42,
  gamesPlayed: 35,
  bestUptime: 98.5,
  tier: 'platinum',
  badges: ['🌟']
};

// Season API
export const getCurrentSeason = async (): Promise<Season | null> => {
  if (isDemoMode()) {
    return demoSeason;
  }

  try {
    const q = query(
      collection(db, 'seasons'),
      where('status', '==', 'active'),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      ...data,
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate()
    } as Season;
  } catch (error) {
    console.error('Failed to get current season:', error);
    return demoSeason;
  }
};

export const getSeasonLeaderboard = async (seasonId: string, limitCount: number = 100): Promise<SeasonPlayer[]> => {
  if (isDemoMode()) {
    return demoSeason.leaderboard.slice(0, limitCount);
  }

  try {
    const q = query(
      collection(db, `seasons/${seasonId}/leaderboard`),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => ({
      ...doc.data(),
      rank: index + 1
    })) as SeasonPlayer[];
  } catch (error) {
    console.error('Failed to get season leaderboard:', error);
    return demoSeason.leaderboard;
  }
};

export const getPlayerSeasonStats = async (seasonId: string, playerId: string): Promise<SeasonPlayer | null> => {
  if (isDemoMode()) {
    return demoPlayerStats;
  }

  try {
    const docRef = doc(db, `seasons/${seasonId}/leaderboard`, playerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SeasonPlayer;
    }
    return null;
  } catch (error) {
    console.error('Failed to get player season stats:', error);
    return demoPlayerStats;
  }
};

export const updateSeasonScore = async (
  seasonId: string,
  playerId: string,
  playerName: string,
  scoreToAdd: number,
  uptime: number
): Promise<void> => {
  if (isDemoMode()) return;

  try {
    const docRef = doc(db, `seasons/${seasonId}/leaderboard`, playerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const current = docSnap.data() as SeasonPlayer;
      await updateDoc(docRef, {
        score: increment(scoreToAdd),
        gamesPlayed: increment(1),
        bestUptime: Math.max(current.bestUptime, uptime),
        tier: getTierFromScore(current.score + scoreToAdd)
      });
    } else {
      const newPlayer: SeasonPlayer = {
        id: playerId,
        name: playerName,
        score: scoreToAdd,
        rank: 0,
        gamesPlayed: 1,
        bestUptime: uptime,
        tier: getTierFromScore(scoreToAdd),
        badges: []
      };
      await setDoc(docRef, newPlayer);
    }
  } catch (error) {
    console.error('Failed to update season score:', error);
  }
};

export const getSeasonChallenges = async (seasonId: string, playerId: string): Promise<SeasonChallenge[]> => {
  if (isDemoMode()) {
    return demoSeason.challenges;
  }

  try {
    const q = query(
      collection(db, `seasons/${seasonId}/challenges`),
      where('playerId', '==', playerId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data()) as SeasonChallenge[];
  } catch (error) {
    console.error('Failed to get season challenges:', error);
    return demoSeason.challenges;
  }
};

export const updateChallengeProgress = async (
  seasonId: string,
  playerId: string,
  challengeId: string,
  progress: number
): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Challenge progress updated', { challengeId, progress });
    return true;
  }

  try {
    const docRef = doc(db, `seasons/${seasonId}/challenges`, `${playerId}_${challengeId}`);
    await updateDoc(docRef, {
      current: increment(progress)
    });
    return true;
  } catch (error) {
    console.error('Failed to update challenge progress:', error);
    return false;
  }
};

// Utility functions
export const getSeasonTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return '종료됨';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`;
  }
  return `${hours}시간 남음`;
};

export const getRankReward = (rank: number, rewards: SeasonReward[]): SeasonReward | null => {
  // Check exact rank match
  const exactMatch = rewards.find(r => r.rank === rank);
  if (exactMatch) return exactMatch;

  // Check tier rewards
  if (rank <= 10) {
    return rewards.find(r => r.rank === 'top10') || null;
  }
  if (rank <= 100) {
    return rewards.find(r => r.rank === 'top100') || null;
  }

  return null;
};

// Season pass (premium feature)
export interface SeasonPass {
  level: number;
  experience: number;
  rewards: SeasonPassReward[];
  isPremium: boolean;
}

export interface SeasonPassReward {
  level: number;
  freeReward?: { type: string; amount: number };
  premiumReward?: { type: string; amount: number };
  claimed: boolean;
}

export const getSeasonPass = async (seasonId: string, playerId: string): Promise<SeasonPass> => {
  const defaultPass: SeasonPass = {
    level: 15,
    experience: 7500,
    isPremium: false,
    rewards: Array.from({ length: 50 }, (_, i) => ({
      level: i + 1,
      freeReward: i % 2 === 0 ? { type: 'coins', amount: (i + 1) * 50 } : undefined,
      premiumReward: { type: i % 3 === 0 ? 'gems' : 'coins', amount: (i + 1) * 100 },
      claimed: i < 15
    }))
  };

  if (isDemoMode()) {
    return defaultPass;
  }

  try {
    const docRef = doc(db, `seasons/${seasonId}/passes`, playerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SeasonPass;
    }
    return defaultPass;
  } catch (error) {
    console.error('Failed to get season pass:', error);
    return defaultPass;
  }
};
