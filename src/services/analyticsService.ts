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
  Timestamp,
  increment
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

// Types
export interface GameSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  finalUptime: number;
  score: number;
  eventsHandled: number;
  ticketsResolved: number;
  moneyEarned: number;
  phase: number;
}

export interface DailyStats {
  date: string;
  sessionsPlayed: number;
  totalPlayTime: number;
  averageUptime: number;
  totalScore: number;
  ticketsResolved: number;
  eventsHandled: number;
  moneyEarned: number;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalPlayTime: number; // minutes
  averageSessionLength: number;
  averageUptime: number;
  bestUptime: number;
  totalScore: number;
  highScore: number;
  totalTicketsResolved: number;
  totalEventsHandled: number;
  totalMoneyEarned: number;
  favoriteTimeOfDay: string;
  longestStreak: number;
  currentStreak: number;
  lastPlayedAt: Date;
  joinedAt: Date;
  achievements: string[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  value: number;
  achievedAt: Date;
  icon: string;
}

export interface GameTrend {
  period: 'daily' | 'weekly' | 'monthly';
  data: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  uptime: number;
  score: number;
  sessions: number;
  playTime: number;
}

export interface PerformanceMetrics {
  uptimeDistribution: { range: string; count: number }[];
  peakPlayHours: { hour: number; sessions: number }[];
  eventSuccessRate: number;
  ticketResolutionRate: number;
  averagePhaseReached: number;
  improvementRate: number; // % improvement over last 7 days
}

// Demo data
const demoAnalytics: UserAnalytics = {
  userId: 'demo-user',
  totalSessions: 127,
  totalPlayTime: 2540, // minutes
  averageSessionLength: 20,
  averageUptime: 94.5,
  bestUptime: 99.92,
  totalScore: 458200,
  highScore: 12450,
  totalTicketsResolved: 1893,
  totalEventsHandled: 642,
  totalMoneyEarned: 2847500,
  favoriteTimeOfDay: '저녁 (18-22시)',
  longestStreak: 14,
  currentStreak: 5,
  lastPlayedAt: new Date(),
  joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  achievements: ['first_game', 'uptime_master', 'ticket_hero', 'money_maker'],
  milestones: [
    { id: 'm1', name: '첫 게임', description: '첫 번째 게임 완료', value: 1, achievedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), icon: '🎮' },
    { id: 'm2', name: '100 게임', description: '100번째 게임 완료', value: 100, achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), icon: '🎯' },
    { id: 'm3', name: '업타임 99%', description: '99% 이상 업타임 달성', value: 99, achievedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), icon: '⚡' },
    { id: 'm4', name: '1000 티켓', description: '1000개 티켓 해결', value: 1000, achievedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), icon: '🎫' }
  ]
};

const demoDailyStats: DailyStats[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    sessionsPlayed: Math.floor(Math.random() * 5) + 1,
    totalPlayTime: Math.floor(Math.random() * 60) + 20,
    averageUptime: 90 + Math.random() * 9,
    totalScore: Math.floor(Math.random() * 5000) + 2000,
    ticketsResolved: Math.floor(Math.random() * 50) + 20,
    eventsHandled: Math.floor(Math.random() * 20) + 5,
    moneyEarned: Math.floor(Math.random() * 50000) + 10000
  };
});

const demoPerformance: PerformanceMetrics = {
  uptimeDistribution: [
    { range: '0-50%', count: 2 },
    { range: '50-70%', count: 8 },
    { range: '70-85%', count: 25 },
    { range: '85-95%', count: 52 },
    { range: '95-99%', count: 35 },
    { range: '99-100%', count: 5 }
  ],
  peakPlayHours: [
    { hour: 9, sessions: 12 },
    { hour: 10, sessions: 8 },
    { hour: 12, sessions: 15 },
    { hour: 13, sessions: 10 },
    { hour: 18, sessions: 25 },
    { hour: 19, sessions: 32 },
    { hour: 20, sessions: 38 },
    { hour: 21, sessions: 28 },
    { hour: 22, sessions: 18 }
  ],
  eventSuccessRate: 87.5,
  ticketResolutionRate: 94.2,
  averagePhaseReached: 3.7,
  improvementRate: 12.5
};

// Analytics API
export const getUserAnalytics = async (userId: string): Promise<UserAnalytics> => {
  if (isDemoMode()) {
    return demoAnalytics;
  }

  try {
    const docRef = doc(db, 'analytics', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastPlayedAt: data.lastPlayedAt?.toDate(),
        joinedAt: data.joinedAt?.toDate(),
        milestones: data.milestones?.map((m: any) => ({
          ...m,
          achievedAt: m.achievedAt?.toDate()
        }))
      } as UserAnalytics;
    }
    return demoAnalytics;
  } catch (error) {
    console.error('Failed to get user analytics:', error);
    return demoAnalytics;
  }
};

export const getDailyStats = async (userId: string, days: number = 30): Promise<DailyStats[]> => {
  if (isDemoMode()) {
    return demoDailyStats.slice(-days);
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, `analytics/${userId}/dailyStats`),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as DailyStats);
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return demoDailyStats;
  }
};

export const getPerformanceMetrics = async (userId: string): Promise<PerformanceMetrics> => {
  if (isDemoMode()) {
    return demoPerformance;
  }

  try {
    const docRef = doc(db, 'analytics', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().performance as PerformanceMetrics;
    }
    return demoPerformance;
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return demoPerformance;
  }
};

export const getTrends = async (userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<TrendDataPoint[]> => {
  const dailyStats = await getDailyStats(userId, period === 'daily' ? 7 : period === 'weekly' ? 28 : 90);

  if (period === 'daily') {
    return dailyStats.map(stat => ({
      date: stat.date,
      uptime: stat.averageUptime,
      score: stat.totalScore,
      sessions: stat.sessionsPlayed,
      playTime: stat.totalPlayTime
    }));
  }

  // Aggregate for weekly/monthly
  const aggregated: TrendDataPoint[] = [];
  const chunkSize = period === 'weekly' ? 7 : 30;

  for (let i = 0; i < dailyStats.length; i += chunkSize) {
    const chunk = dailyStats.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      aggregated.push({
        date: chunk[0].date,
        uptime: chunk.reduce((sum, s) => sum + s.averageUptime, 0) / chunk.length,
        score: chunk.reduce((sum, s) => sum + s.totalScore, 0),
        sessions: chunk.reduce((sum, s) => sum + s.sessionsPlayed, 0),
        playTime: chunk.reduce((sum, s) => sum + s.totalPlayTime, 0)
      });
    }
  }

  return aggregated;
};

// Track game session
export const trackGameSession = async (
  userId: string,
  session: Omit<GameSession, 'id'>
): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo: Game session tracked', session);
    return;
  }

  try {
    const sessionId = `${userId}_${Date.now()}`;
    const sessionRef = doc(db, `analytics/${userId}/sessions`, sessionId);
    await setDoc(sessionRef, {
      ...session,
      id: sessionId,
      startTime: Timestamp.fromDate(session.startTime),
      endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null
    });

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = doc(db, `analytics/${userId}/dailyStats`, today);
    await setDoc(dailyRef, {
      date: today,
      sessionsPlayed: increment(1),
      totalPlayTime: increment(session.duration),
      totalScore: increment(session.score),
      ticketsResolved: increment(session.ticketsResolved),
      eventsHandled: increment(session.eventsHandled),
      moneyEarned: increment(session.moneyEarned)
    }, { merge: true });

    // Update user analytics
    const analyticsRef = doc(db, 'analytics', userId);
    await updateDoc(analyticsRef, {
      totalSessions: increment(1),
      totalPlayTime: increment(session.duration),
      totalScore: increment(session.score),
      totalTicketsResolved: increment(session.ticketsResolved),
      totalEventsHandled: increment(session.eventsHandled),
      totalMoneyEarned: increment(session.moneyEarned),
      lastPlayedAt: Timestamp.now(),
      highScore: session.score > (await getDoc(analyticsRef)).data()?.highScore ? session.score : increment(0),
      bestUptime: session.finalUptime > (await getDoc(analyticsRef)).data()?.bestUptime ? session.finalUptime : increment(0)
    });
  } catch (error) {
    console.error('Failed to track game session:', error);
  }
};

// Calculate insights
export const getInsights = (analytics: UserAnalytics, dailyStats: DailyStats[]): string[] => {
  const insights: string[] = [];

  // Play frequency
  if (analytics.currentStreak >= 7) {
    insights.push(`🔥 ${analytics.currentStreak}일 연속 플레이 중! 대단해요!`);
  }

  // Improvement
  if (dailyStats.length >= 7) {
    const recent = dailyStats.slice(-7);
    const older = dailyStats.slice(-14, -7);
    if (older.length > 0) {
      const recentAvg = recent.reduce((s, d) => s + d.averageUptime, 0) / recent.length;
      const olderAvg = older.reduce((s, d) => s + d.averageUptime, 0) / older.length;
      if (recentAvg > olderAvg) {
        insights.push(`📈 지난 주 대비 업타임이 ${(recentAvg - olderAvg).toFixed(1)}% 향상되었어요!`);
      }
    }
  }

  // High performance
  if (analytics.averageUptime >= 95) {
    insights.push('⚡ 평균 업타임 95% 이상! 전문가 수준이에요.');
  }

  // Ticket master
  if (analytics.totalTicketsResolved >= 1000) {
    insights.push('🎫 1000개 이상의 티켓을 해결한 베테랑이시네요!');
  }

  // Play time
  const hours = Math.floor(analytics.totalPlayTime / 60);
  if (hours >= 10) {
    insights.push(`⏱️ 총 ${hours}시간 플레이! 진정한 팬이시네요.`);
  }

  // Favorite time
  insights.push(`🕐 주로 ${analytics.favoriteTimeOfDay}에 플레이하시네요.`);

  return insights;
};

// Leaderboard comparison
export interface LeaderboardPosition {
  category: string;
  rank: number;
  total: number;
  percentile: number;
  value: number;
}

export const getLeaderboardPositions = async (userId: string): Promise<LeaderboardPosition[]> => {
  // Demo implementation
  return [
    { category: '최고 업타임', rank: 42, total: 1000, percentile: 95.8, value: 99.92 },
    { category: '총 점수', rank: 156, total: 1000, percentile: 84.4, value: 458200 },
    { category: '해결 티켓', rank: 89, total: 1000, percentile: 91.1, value: 1893 },
    { category: '연속 플레이', rank: 234, total: 1000, percentile: 76.6, value: 14 }
  ];
};

// Export data for user
export const exportUserData = async (userId: string): Promise<string> => {
  const analytics = await getUserAnalytics(userId);
  const dailyStats = await getDailyStats(userId, 365);
  const performance = await getPerformanceMetrics(userId);

  const exportData = {
    analytics,
    dailyStats,
    performance,
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(exportData, null, 2);
};
