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
  Timestamp,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

// Types
export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  createdAt: Date;
  lastLoginAt: Date;
}

export type AdminPermission =
  | 'users_read'
  | 'users_write'
  | 'users_delete'
  | 'games_read'
  | 'games_write'
  | 'events_manage'
  | 'analytics_read'
  | 'settings_manage'
  | 'payments_read'
  | 'payments_refund';

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  status: 'active' | 'banned' | 'suspended';
  isPremium: boolean;
  totalGames: number;
  totalSpent: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface GameEvent {
  id: string;
  type: 'announcement' | 'maintenance' | 'event' | 'update';
  title: string;
  content: string;
  startAt: Date;
  endAt?: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number; // last 24h
  totalGames: number;
  totalRevenue: number;
  averageSessionLength: number;
  retentionRate: number;
  newUsersToday: number;
  peakConcurrentUsers: number;
}

export interface PaymentRecord {
  id: string;
  oderId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  productId: string;
  productName: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
}

export interface GameSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  maxPlayersPerRoom: number;
  defaultGameSpeed: number;
  eventMultiplier: number;
  premiumBonusMultiplier: number;
  seasonEndDate: Date;
  featuredScenarioId: string;
}

// Demo Data
const demoUsers: UserListItem[] = [
  { id: '1', email: 'player1@example.com', username: 'UptimeKing', status: 'active', isPremium: true, totalGames: 150, totalSpent: 99, createdAt: new Date('2024-01-01'), lastActiveAt: new Date() },
  { id: '2', email: 'player2@example.com', username: 'ServerMaster', status: 'active', isPremium: true, totalGames: 142, totalSpent: 49, createdAt: new Date('2024-01-05'), lastActiveAt: new Date() },
  { id: '3', email: 'player3@example.com', username: 'CloudNinja', status: 'active', isPremium: false, totalGames: 138, totalSpent: 0, createdAt: new Date('2024-01-10'), lastActiveAt: new Date() },
  { id: '4', email: 'player4@example.com', username: 'DevOpsHero', status: 'suspended', isPremium: false, totalGames: 125, totalSpent: 0, createdAt: new Date('2024-01-15'), lastActiveAt: new Date(Date.now() - 86400000) },
  { id: '5', email: 'player5@example.com', username: 'InfraWizard', status: 'active', isPremium: true, totalGames: 118, totalSpent: 199, createdAt: new Date('2024-01-20'), lastActiveAt: new Date() },
  { id: '6', email: 'banned@example.com', username: 'BadActor', status: 'banned', isPremium: false, totalGames: 10, totalSpent: 0, createdAt: new Date('2024-02-01'), lastActiveAt: new Date('2024-02-05') },
];

const demoEvents: GameEvent[] = [
  { id: '1', type: 'announcement', title: '시즌 2 오픈!', content: '새로운 시즌이 시작됩니다. 새로운 보상과 챌린지가 기다리고 있어요!', startAt: new Date(), active: true, createdBy: 'admin', createdAt: new Date() },
  { id: '2', type: 'event', title: '더블 XP 주말', content: '이번 주말 동안 경험치 2배!', startAt: new Date(), endAt: new Date(Date.now() + 48 * 60 * 60 * 1000), active: true, createdBy: 'admin', createdAt: new Date() },
  { id: '3', type: 'maintenance', title: '정기 점검', content: '서버 안정화를 위한 정기 점검입니다.', startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), active: false, createdBy: 'admin', createdAt: new Date() },
];

const demoStats: SystemStats = {
  totalUsers: 12458,
  activeUsers: 3842,
  totalGames: 458293,
  totalRevenue: 124580,
  averageSessionLength: 18.5,
  retentionRate: 42.3,
  newUsersToday: 127,
  peakConcurrentUsers: 1284
};

const demoPayments: PaymentRecord[] = [
  { id: '1', oderId: '1', userEmail: 'player1@example.com', amount: 9.99, currency: 'USD', status: 'completed', productId: 'starter', productName: 'Starter Pack', createdAt: new Date() },
  { id: '2', oderId: '2', userEmail: 'player2@example.com', amount: 29.99, currency: 'USD', status: 'completed', productId: 'pro', productName: 'Pro Plan', createdAt: new Date(Date.now() - 86400000) },
  { id: '3', oderId: '5', userEmail: 'player5@example.com', amount: 99.99, currency: 'USD', status: 'completed', productId: 'enterprise', productName: 'Enterprise Plan', createdAt: new Date(Date.now() - 172800000) },
  { id: '4', oderId: '3', userEmail: 'player3@example.com', amount: 9.99, currency: 'USD', status: 'failed', productId: 'starter', productName: 'Starter Pack', createdAt: new Date(Date.now() - 259200000) },
];

const demoAuditLogs: AuditLog[] = [
  { id: '1', adminId: 'admin1', adminEmail: 'admin@uptime.game', action: 'user_banned', target: 'BadActor', details: '부정행위로 인한 영구 정지', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', adminId: 'admin1', adminEmail: 'admin@uptime.game', action: 'event_created', target: '더블 XP 주말', details: '주말 이벤트 생성', timestamp: new Date(Date.now() - 7200000) },
  { id: '3', adminId: 'admin1', adminEmail: 'admin@uptime.game', action: 'settings_updated', target: 'eventMultiplier', details: '1.0 → 2.0', timestamp: new Date(Date.now() - 10800000) },
];

const demoSettings: GameSettings = {
  maintenanceMode: false,
  maintenanceMessage: '서버 점검 중입니다. 잠시 후 다시 시도해주세요.',
  registrationEnabled: true,
  maxPlayersPerRoom: 8,
  defaultGameSpeed: 1,
  eventMultiplier: 1,
  premiumBonusMultiplier: 1.5,
  seasonEndDate: new Date('2024-03-31'),
  featuredScenarioId: 'scenario_1'
};

// Check admin permission
export const checkAdminPermission = async (userId: string, permission: AdminPermission): Promise<boolean> => {
  if (isDemoMode()) {
    return true; // Demo mode has all permissions
  }

  try {
    const docRef = doc(db, 'admins', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;

    const admin = docSnap.data() as AdminUser;
    return admin.permissions.includes(permission) || admin.role === 'super_admin';
  } catch (error) {
    console.error('Failed to check admin permission:', error);
    return false;
  }
};

// User Management
export const getUsers = async (
  page: number = 1,
  pageSize: number = 20,
  filter?: { status?: string; search?: string }
): Promise<{ users: UserListItem[]; total: number }> => {
  if (isDemoMode()) {
    let filtered = [...demoUsers];
    if (filter?.status) {
      filtered = filtered.filter(u => u.status === filter.status);
    }
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search)
      );
    }
    const start = (page - 1) * pageSize;
    return {
      users: filtered.slice(start, start + pageSize),
      total: filtered.length
    };
  }

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));

    if (filter?.status) {
      q = query(usersRef, where('status', '==', filter.status), orderBy('createdAt', 'desc'), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastActiveAt: doc.data().lastActiveAt?.toDate()
    })) as UserListItem[];

    return { users, total: users.length };
  } catch (error) {
    console.error('Failed to get users:', error);
    return { users: demoUsers, total: demoUsers.length };
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'banned' | 'suspended'): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: User status updated', { userId, status });
    return true;
  }

  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Failed to update user status:', error);
    return false;
  }
};

// Event Management
export const getGameEvents = async (): Promise<GameEvent[]> => {
  if (isDemoMode()) {
    return demoEvents;
  }

  try {
    const q = query(collection(db, 'gameEvents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startAt: doc.data().startAt?.toDate(),
      endAt: doc.data().endAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    })) as GameEvent[];
  } catch (error) {
    console.error('Failed to get game events:', error);
    return demoEvents;
  }
};

export const createGameEvent = async (event: Omit<GameEvent, 'id' | 'createdAt'>): Promise<string | null> => {
  if (isDemoMode()) {
    console.log('Demo: Event created', event);
    return 'demo-event-id';
  }

  try {
    const docRef = doc(collection(db, 'gameEvents'));
    await setDoc(docRef, {
      ...event,
      startAt: Timestamp.fromDate(event.startAt),
      endAt: event.endAt ? Timestamp.fromDate(event.endAt) : null,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to create event:', error);
    return null;
  }
};

export const updateGameEvent = async (eventId: string, updates: Partial<GameEvent>): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Event updated', { eventId, updates });
    return true;
  }

  try {
    const docRef = doc(db, 'gameEvents', eventId);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error('Failed to update event:', error);
    return false;
  }
};

export const deleteGameEvent = async (eventId: string): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Event deleted', eventId);
    return true;
  }

  try {
    await deleteDoc(doc(db, 'gameEvents', eventId));
    return true;
  } catch (error) {
    console.error('Failed to delete event:', error);
    return false;
  }
};

// System Stats
export const getSystemStats = async (): Promise<SystemStats> => {
  if (isDemoMode()) {
    return demoStats;
  }

  try {
    const docRef = doc(db, 'system', 'stats');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SystemStats;
    }
    return demoStats;
  } catch (error) {
    console.error('Failed to get system stats:', error);
    return demoStats;
  }
};

// Payment Management
export const getPayments = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ payments: PaymentRecord[]; total: number }> => {
  if (isDemoMode()) {
    const start = (page - 1) * pageSize;
    return {
      payments: demoPayments.slice(start, start + pageSize),
      total: demoPayments.length
    };
  }

  try {
    const q = query(
      collection(db, 'payments'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);

    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as PaymentRecord[];

    return { payments, total: payments.length };
  } catch (error) {
    console.error('Failed to get payments:', error);
    return { payments: demoPayments, total: demoPayments.length };
  }
};

export const refundPayment = async (paymentId: string): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Payment refunded', paymentId);
    return true;
  }

  try {
    const docRef = doc(db, 'payments', paymentId);
    await updateDoc(docRef, { status: 'refunded' });
    return true;
  } catch (error) {
    console.error('Failed to refund payment:', error);
    return false;
  }
};

// Audit Logs
export const getAuditLogs = async (limit_count: number = 50): Promise<AuditLog[]> => {
  if (isDemoMode()) {
    return demoAuditLogs;
  }

  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as AuditLog[];
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return demoAuditLogs;
  }
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo: Audit log created', log);
    return;
  }

  try {
    const docRef = doc(collection(db, 'auditLogs'));
    await setDoc(docRef, {
      ...log,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Game Settings
export const getGameSettings = async (): Promise<GameSettings> => {
  if (isDemoMode()) {
    return demoSettings;
  }

  try {
    const docRef = doc(db, 'system', 'settings');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        seasonEndDate: data.seasonEndDate?.toDate()
      } as GameSettings;
    }
    return demoSettings;
  } catch (error) {
    console.error('Failed to get game settings:', error);
    return demoSettings;
  }
};

export const updateGameSettings = async (settings: Partial<GameSettings>): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Settings updated', settings);
    return true;
  }

  try {
    const docRef = doc(db, 'system', 'settings');
    await updateDoc(docRef, settings);
    return true;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return false;
  }
};

// Dashboard quick stats
export interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export const getQuickStats = async (): Promise<QuickStat[]> => {
  const stats = await getSystemStats();

  return [
    { label: '총 사용자', value: stats.totalUsers.toLocaleString(), change: 5.2, changeLabel: '지난주 대비' },
    { label: '활성 사용자 (24h)', value: stats.activeUsers.toLocaleString(), change: 12.3, changeLabel: '지난주 대비' },
    { label: '오늘 신규', value: stats.newUsersToday, change: -2.1, changeLabel: '어제 대비' },
    { label: '총 매출', value: `$${stats.totalRevenue.toLocaleString()}`, change: 8.7, changeLabel: '지난주 대비' },
    { label: '평균 세션', value: `${stats.averageSessionLength}분` },
    { label: '리텐션율', value: `${stats.retentionRate}%` },
    { label: '동시접속 피크', value: stats.peakConcurrentUsers.toLocaleString() },
    { label: '총 게임 수', value: stats.totalGames.toLocaleString() }
  ];
};
