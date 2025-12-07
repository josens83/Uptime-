import {
  collection,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

export interface GlobalStats {
  totalGames: number;
  totalPlayTime: number; // in minutes
  averageDay: number;
  totalUsers: number; // total simulated users across all games
  totalRevenue: number;
  highestDay: number;
  highestUsers: number;
  highestUptime: number;
  gamesThisWeek: number;
  lastUpdated: Date;
}

// Demo stats for offline mode
const demoGlobalStats: GlobalStats = {
  totalGames: 15420,
  totalPlayTime: 892560,
  averageDay: 42,
  totalUsers: 125000000,
  totalRevenue: 850000000,
  highestDay: 365,
  highestUsers: 500000,
  highestUptime: 99.99,
  gamesThisWeek: 1250,
  lastUpdated: new Date()
};

// Get global game statistics
export const getGlobalStats = async (): Promise<GlobalStats> => {
  if (isDemoMode()) {
    return demoGlobalStats;
  }

  try {
    const docRef = doc(db, 'stats', 'global');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        totalGames: data.totalGames || 0,
        totalPlayTime: data.totalPlayTime || 0,
        averageDay: data.averageDay || 0,
        totalUsers: data.totalUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        highestDay: data.highestDay || 0,
        highestUsers: data.highestUsers || 0,
        highestUptime: data.highestUptime || 0,
        gamesThisWeek: data.gamesThisWeek || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    }

    return demoGlobalStats;
  } catch (error) {
    console.error('Failed to get global stats:', error);
    return demoGlobalStats;
  }
};

// Update global stats when a game ends
export const updateGlobalStats = async (gameData: {
  day: number;
  users: number;
  uptime: number;
  totalRevenue: number;
  playTime: number; // in minutes
}): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo mode: Stats would be updated', gameData);
    return;
  }

  try {
    const docRef = doc(db, 'stats', 'global');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const newTotalGames = (currentData.totalGames || 0) + 1;
      const currentTotalDays = (currentData.averageDay || 0) * (currentData.totalGames || 0);

      await setDoc(docRef, {
        totalGames: increment(1),
        totalPlayTime: increment(gameData.playTime),
        averageDay: Math.round((currentTotalDays + gameData.day) / newTotalGames),
        totalUsers: increment(gameData.users),
        totalRevenue: increment(gameData.totalRevenue),
        highestDay: Math.max(currentData.highestDay || 0, gameData.day),
        highestUsers: Math.max(currentData.highestUsers || 0, gameData.users),
        highestUptime: Math.max(currentData.highestUptime || 0, gameData.uptime),
        gamesThisWeek: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } else {
      // Create initial stats document
      await setDoc(docRef, {
        totalGames: 1,
        totalPlayTime: gameData.playTime,
        averageDay: gameData.day,
        totalUsers: gameData.users,
        totalRevenue: gameData.totalRevenue,
        highestDay: gameData.day,
        highestUsers: gameData.users,
        highestUptime: gameData.uptime,
        gamesThisWeek: 1,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Failed to update global stats:', error);
  }
};

// Get user-specific statistics
export interface UserGameStats {
  totalGames: number;
  totalPlayTime: number;
  bestDay: number;
  bestUptime: number;
  bestUsers: number;
  totalRevenue: number;
  achievementsUnlocked: number;
  lastPlayed: Date;
}

export const getUserStats = async (userId: string): Promise<UserGameStats> => {
  const defaultStats: UserGameStats = {
    totalGames: 0,
    totalPlayTime: 0,
    bestDay: 0,
    bestUptime: 0,
    bestUsers: 0,
    totalRevenue: 0,
    achievementsUnlocked: 0,
    lastPlayed: new Date()
  };

  if (isDemoMode()) {
    return defaultStats;
  }

  try {
    const docRef = doc(db, 'users', userId, 'stats', 'game');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        totalGames: data.totalGames || 0,
        totalPlayTime: data.totalPlayTime || 0,
        bestDay: data.bestDay || 0,
        bestUptime: data.bestUptime || 0,
        bestUsers: data.bestUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        achievementsUnlocked: data.achievementsUnlocked || 0,
        lastPlayed: data.lastPlayed?.toDate() || new Date()
      };
    }

    return defaultStats;
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return defaultStats;
  }
};

// Update user stats after a game
export const updateUserStats = async (
  userId: string,
  gameData: {
    day: number;
    users: number;
    uptime: number;
    totalRevenue: number;
    playTime: number;
    achievementsUnlocked: number;
  }
): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo mode: User stats would be updated', { userId, gameData });
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'stats', 'game');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentData = docSnap.data();
      await setDoc(docRef, {
        totalGames: increment(1),
        totalPlayTime: increment(gameData.playTime),
        bestDay: Math.max(currentData.bestDay || 0, gameData.day),
        bestUptime: Math.max(currentData.bestUptime || 0, gameData.uptime),
        bestUsers: Math.max(currentData.bestUsers || 0, gameData.users),
        totalRevenue: increment(gameData.totalRevenue),
        achievementsUnlocked: Math.max(currentData.achievementsUnlocked || 0, gameData.achievementsUnlocked),
        lastPlayed: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        totalGames: 1,
        totalPlayTime: gameData.playTime,
        bestDay: gameData.day,
        bestUptime: gameData.uptime,
        bestUsers: gameData.users,
        totalRevenue: gameData.totalRevenue,
        achievementsUnlocked: gameData.achievementsUnlocked,
        lastPlayed: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Failed to update user stats:', error);
  }
};
