import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

// Types
export interface Guild {
  id: string;
  name: string;
  description: string;
  tag: string; // 3-4 letter tag
  icon: string;
  leaderId: string;
  leaderName: string;
  members: GuildMember[];
  stats: GuildStats;
  level: number;
  experience: number;
  settings: GuildSettings;
  createdAt: Date;
}

export interface GuildMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  joinedAt: Date;
  lastActive: Date;
}

export interface GuildStats {
  totalGames: number;
  totalScore: number;
  weeklyScore: number;
  averageUptime: number;
  bestDay: number;
  rank: number;
}

export interface GuildSettings {
  isPublic: boolean;
  minLevel: number;
  autoAccept: boolean;
}

export interface GuildInvite {
  id: string;
  guildId: string;
  guildName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

// Demo data
const demoGuilds: Guild[] = [
  {
    id: 'guild-1',
    name: 'Server Masters',
    description: '최고의 서버 운영자들의 모임',
    tag: 'SM',
    icon: '🏆',
    leaderId: 'demo-leader-1',
    leaderName: 'MasterOps',
    members: [
      { id: 'demo-leader-1', name: 'MasterOps', role: 'leader', contribution: 5000, joinedAt: new Date(), lastActive: new Date() },
      { id: 'demo-m1', name: 'DevNinja', role: 'officer', contribution: 3200, joinedAt: new Date(), lastActive: new Date() },
      { id: 'demo-m2', name: 'CloudRunner', role: 'member', contribution: 1500, joinedAt: new Date(), lastActive: new Date() }
    ],
    stats: { totalGames: 150, totalScore: 45000, weeklyScore: 5200, averageUptime: 98.5, bestDay: 120, rank: 1 },
    level: 5,
    experience: 4500,
    settings: { isPublic: true, minLevel: 0, autoAccept: false },
    createdAt: new Date()
  },
  {
    id: 'guild-2',
    name: 'Uptime Warriors',
    description: '99.99% 업타임을 향해!',
    tag: 'UW',
    icon: '⚔️',
    leaderId: 'demo-leader-2',
    leaderName: 'UptimeKing',
    members: [
      { id: 'demo-leader-2', name: 'UptimeKing', role: 'leader', contribution: 4200, joinedAt: new Date(), lastActive: new Date() },
      { id: 'demo-m3', name: 'ServerGuard', role: 'member', contribution: 2100, joinedAt: new Date(), lastActive: new Date() }
    ],
    stats: { totalGames: 98, totalScore: 32000, weeklyScore: 3800, averageUptime: 99.2, bestDay: 95, rank: 2 },
    level: 4,
    experience: 3200,
    settings: { isPublic: true, minLevel: 5, autoAccept: true },
    createdAt: new Date()
  }
];

// Guild CRUD
export const createGuild = async (
  leaderId: string,
  leaderName: string,
  guildData: {
    name: string;
    description: string;
    tag: string;
    icon: string;
  }
): Promise<string | null> => {
  if (isDemoMode()) {
    const guildId = `guild-${Date.now()}`;
    console.log('Demo: Guild created', { guildId, ...guildData });
    return guildId;
  }

  try {
    const guildId = `guild-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const guildRef = doc(db, 'guilds', guildId);

    const newGuild: Omit<Guild, 'createdAt'> & { createdAt: any } = {
      id: guildId,
      name: guildData.name,
      description: guildData.description,
      tag: guildData.tag.toUpperCase(),
      icon: guildData.icon,
      leaderId,
      leaderName,
      members: [{
        id: leaderId,
        name: leaderName,
        role: 'leader',
        contribution: 0,
        joinedAt: new Date(),
        lastActive: new Date()
      }],
      stats: {
        totalGames: 0,
        totalScore: 0,
        weeklyScore: 0,
        averageUptime: 0,
        bestDay: 0,
        rank: 0
      },
      level: 1,
      experience: 0,
      settings: {
        isPublic: true,
        minLevel: 0,
        autoAccept: false
      },
      createdAt: serverTimestamp()
    };

    await setDoc(guildRef, newGuild);

    // Update user's guild reference
    await updateDoc(doc(db, 'users', leaderId), {
      guildId,
      guildRole: 'leader'
    });

    return guildId;
  } catch (error) {
    console.error('Failed to create guild:', error);
    return null;
  }
};

export const getGuild = async (guildId: string): Promise<Guild | null> => {
  if (isDemoMode()) {
    return demoGuilds.find(g => g.id === guildId) || null;
  }

  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);

    if (guildSnap.exists()) {
      const data = guildSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Guild;
    }
    return null;
  } catch (error) {
    console.error('Failed to get guild:', error);
    return null;
  }
};

export const getTopGuilds = async (limitCount: number = 10): Promise<Guild[]> => {
  if (isDemoMode()) {
    return demoGuilds.slice(0, limitCount);
  }

  try {
    const q = query(
      collection(db, 'guilds'),
      orderBy('stats.weeklyScore', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const guilds: Guild[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      guilds.push({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Guild);
    });

    return guilds;
  } catch (error) {
    console.error('Failed to get top guilds:', error);
    return demoGuilds;
  }
};

export const searchGuilds = async (searchTerm: string): Promise<Guild[]> => {
  if (isDemoMode()) {
    return demoGuilds.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  try {
    // Simple search - in production, use Algolia or similar
    const q = query(
      collection(db, 'guilds'),
      where('settings.isPublic', '==', true),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const guilds: Guild[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.tag.toLowerCase().includes(searchTerm.toLowerCase())) {
        guilds.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Guild);
      }
    });

    return guilds;
  } catch (error) {
    console.error('Failed to search guilds:', error);
    return [];
  }
};

// Member management
export const joinGuild = async (
  guildId: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Joined guild', { guildId, userName });
    return true;
  }

  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);

    if (!guildSnap.exists()) return false;

    const guild = guildSnap.data() as Guild;
    if (guild.members.length >= 50) return false; // Max members
    if (guild.members.some(m => m.id === userId)) return true;

    const newMember: GuildMember = {
      id: userId,
      name: userName,
      role: 'member',
      contribution: 0,
      joinedAt: new Date(),
      lastActive: new Date()
    };

    await updateDoc(guildRef, {
      members: arrayUnion(newMember)
    });

    await updateDoc(doc(db, 'users', userId), {
      guildId,
      guildRole: 'member'
    });

    return true;
  } catch (error) {
    console.error('Failed to join guild:', error);
    return false;
  }
};

export const leaveGuild = async (guildId: string, userId: string): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Left guild', { guildId, userId });
    return true;
  }

  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);

    if (!guildSnap.exists()) return false;

    const guild = guildSnap.data() as Guild;

    // Leader can't leave, must transfer or disband
    if (guild.leaderId === userId) return false;

    const member = guild.members.find(m => m.id === userId);
    if (!member) return true;

    await updateDoc(guildRef, {
      members: arrayRemove(member)
    });

    await updateDoc(doc(db, 'users', userId), {
      guildId: null,
      guildRole: null
    });

    return true;
  } catch (error) {
    console.error('Failed to leave guild:', error);
    return false;
  }
};

export const promoteMembe = async (
  guildId: string,
  memberId: string,
  newRole: 'officer' | 'member'
): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Member promoted', { guildId, memberId, newRole });
    return true;
  }

  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);

    if (!guildSnap.exists()) return false;

    const guild = guildSnap.data() as Guild;
    const updatedMembers = guild.members.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    );

    await updateDoc(guildRef, { members: updatedMembers });
    return true;
  } catch (error) {
    console.error('Failed to promote member:', error);
    return false;
  }
};

// Stats updates
export const addGuildContribution = async (
  guildId: string,
  memberId: string,
  score: number
): Promise<void> => {
  if (isDemoMode()) return;

  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);

    if (!guildSnap.exists()) return;

    const guild = guildSnap.data() as Guild;
    const updatedMembers = guild.members.map(m =>
      m.id === memberId
        ? { ...m, contribution: m.contribution + score, lastActive: new Date() }
        : m
    );

    await updateDoc(guildRef, {
      members: updatedMembers,
      'stats.totalScore': increment(score),
      'stats.weeklyScore': increment(score),
      'stats.totalGames': increment(1),
      experience: increment(Math.floor(score / 10))
    });
  } catch (error) {
    console.error('Failed to add contribution:', error);
  }
};

// Experience and leveling
export const getGuildLevel = (experience: number): number => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) return i + 1;
  }
  return 1;
};

export const getGuildLevelProgress = (experience: number): number => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];
  const currentLevel = getGuildLevel(experience);
  if (currentLevel >= levels.length) return 100;

  const currentLevelXP = levels[currentLevel - 1];
  const nextLevelXP = levels[currentLevel];
  const progress = ((experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return Math.min(100, Math.max(0, progress));
};
