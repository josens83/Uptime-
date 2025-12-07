import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

export interface LeaderboardEntry {
  id: string;
  username: string;
  userId: string;
  score: number;
  day: number;
  phase: 'web' | 'mobile' | 'app';
  uptime: number;
  users: number;
  money: number;
  createdAt: Date;
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  scoreField: keyof Pick<LeaderboardEntry, 'day' | 'uptime' | 'users' | 'money'>;
}

// Leaderboard categories
export const leaderboardCategories: LeaderboardCategory[] = [
  { id: 'survival', name: '생존 기간', description: '가장 오래 서비스를 운영한 플레이어', scoreField: 'day' },
  { id: 'uptime', name: '업타임', description: '가장 높은 업타임을 유지한 플레이어', scoreField: 'uptime' },
  { id: 'users', name: '사용자 수', description: '가장 많은 사용자를 확보한 플레이어', scoreField: 'users' },
  { id: 'revenue', name: '총 수익', description: '가장 많은 수익을 올린 플레이어', scoreField: 'money' }
];

// Demo data for offline/demo mode
const demoLeaderboardData: LeaderboardEntry[] = [
  { id: '1', username: 'TechMaster', userId: 'demo1', score: 150, day: 150, phase: 'app', uptime: 99.8, users: 50000, money: 1500000, createdAt: new Date() },
  { id: '2', username: 'CodeNinja', userId: 'demo2', score: 120, day: 120, phase: 'app', uptime: 99.5, users: 35000, money: 980000, createdAt: new Date() },
  { id: '3', username: 'ServerKing', userId: 'demo3', score: 100, day: 100, phase: 'mobile', uptime: 99.9, users: 28000, money: 750000, createdAt: new Date() },
  { id: '4', username: 'DevPro', userId: 'demo4', score: 85, day: 85, phase: 'mobile', uptime: 98.5, users: 22000, money: 620000, createdAt: new Date() },
  { id: '5', username: 'WebWizard', userId: 'demo5', score: 70, day: 70, phase: 'mobile', uptime: 97.8, users: 15000, money: 450000, createdAt: new Date() },
  { id: '6', username: 'CloudRunner', userId: 'demo6', score: 55, day: 55, phase: 'web', uptime: 98.2, users: 10000, money: 320000, createdAt: new Date() },
  { id: '7', username: 'DataDriven', userId: 'demo7', score: 45, day: 45, phase: 'web', uptime: 96.5, users: 8000, money: 250000, createdAt: new Date() },
  { id: '8', username: 'ScaleUp', userId: 'demo8', score: 35, day: 35, phase: 'web', uptime: 95.8, users: 5500, money: 180000, createdAt: new Date() },
  { id: '9', username: 'StartupHero', userId: 'demo9', score: 25, day: 25, phase: 'web', uptime: 94.2, users: 3200, money: 95000, createdAt: new Date() },
  { id: '10', username: 'NewDev', userId: 'demo10', score: 15, day: 15, phase: 'web', uptime: 92.5, users: 1500, money: 45000, createdAt: new Date() }
];

// Get top scores for a category
export const getLeaderboard = async (
  category: string = 'survival',
  limitCount: number = 10
): Promise<LeaderboardEntry[]> => {
  if (isDemoMode()) {
    // Return demo data sorted by the appropriate field
    const cat = leaderboardCategories.find(c => c.id === category);
    if (!cat) return demoLeaderboardData.slice(0, limitCount);

    return [...demoLeaderboardData]
      .sort((a, b) => b[cat.scoreField] - a[cat.scoreField])
      .slice(0, limitCount);
  }

  try {
    const cat = leaderboardCategories.find(c => c.id === category);
    const scoreField = cat?.scoreField || 'day';

    const q = query(
      collection(db, 'leaderboard'),
      orderBy(scoreField, 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        username: data.username,
        userId: data.userId,
        score: data[scoreField],
        day: data.day,
        phase: data.phase,
        uptime: data.uptime,
        users: data.users,
        money: data.money,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    return entries;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return demoLeaderboardData.slice(0, limitCount);
  }
};

// Submit a score to the leaderboard
export const submitScore = async (
  userId: string,
  username: string,
  gameState: {
    day: number;
    phase: 'web' | 'mobile' | 'app';
    uptime: number;
    users: number;
    money: number;
  }
): Promise<string | null> => {
  if (isDemoMode()) {
    console.log('Demo mode: Score would be submitted', { userId, username, gameState });
    return `demo-${Date.now()}`;
  }

  try {
    const docRef = await addDoc(collection(db, 'leaderboard'), {
      userId,
      username,
      day: gameState.day,
      phase: gameState.phase,
      uptime: gameState.uptime,
      users: gameState.users,
      money: gameState.money,
      createdAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Failed to submit score:', error);
    return null;
  }
};

// Get user's best scores
export const getUserBestScores = async (
  userId: string
): Promise<LeaderboardEntry[]> => {
  if (isDemoMode()) {
    return demoLeaderboardData.filter(e => e.userId === userId);
  }

  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('userId', '==', userId),
      orderBy('day', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        username: data.username,
        userId: data.userId,
        score: data.day,
        day: data.day,
        phase: data.phase,
        uptime: data.uptime,
        users: data.users,
        money: data.money,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    return entries;
  } catch (error) {
    console.error('Failed to fetch user scores:', error);
    return [];
  }
};

// Get user's rank for a specific category
export const getUserRank = async (
  userId: string,
  category: string = 'survival'
): Promise<number | null> => {
  if (isDemoMode()) {
    const cat = leaderboardCategories.find(c => c.id === category);
    if (!cat) return null;

    const sorted = [...demoLeaderboardData].sort((a, b) => b[cat.scoreField] - a[cat.scoreField]);
    const index = sorted.findIndex(e => e.userId === userId);
    return index >= 0 ? index + 1 : null;
  }

  try {
    // This is a simplified approach - in production, you might want to use
    // Cloud Functions to maintain rank indices for efficiency
    const entries = await getLeaderboard(category, 1000);
    const index = entries.findIndex(e => e.userId === userId);
    return index >= 0 ? index + 1 : null;
  } catch (error) {
    console.error('Failed to get user rank:', error);
    return null;
  }
};

// Get weekly leaderboard
export const getWeeklyLeaderboard = async (
  category: string = 'survival',
  limitCount: number = 10
): Promise<LeaderboardEntry[]> => {
  if (isDemoMode()) {
    return getLeaderboard(category, limitCount);
  }

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const cat = leaderboardCategories.find(c => c.id === category);
    const scoreField = cat?.scoreField || 'day';

    const q = query(
      collection(db, 'leaderboard'),
      where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo)),
      orderBy('createdAt', 'desc'),
      orderBy(scoreField, 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        username: data.username,
        userId: data.userId,
        score: data[scoreField],
        day: data.day,
        phase: data.phase,
        uptime: data.uptime,
        users: data.users,
        money: data.money,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    return entries;
  } catch (error) {
    console.error('Failed to fetch weekly leaderboard:', error);
    return demoLeaderboardData.slice(0, limitCount);
  }
};
