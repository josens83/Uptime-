import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isDemoMode } from '../config/firebase';

// Types
export interface MultiplayerRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  players: RoomPlayer[];
  settings: RoomSettings;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  uptime: number;
  day: number;
  status: 'waiting' | 'playing' | 'finished' | 'disconnected';
  lastUpdate: Date;
}

export interface RoomSettings {
  duration: number; // minutes
  startingMoney: number;
  startingUsers: number;
  difficulty: 'easy' | 'normal' | 'hard';
  allowSpectators: boolean;
}

export interface LiveMatch {
  id: string;
  roomId: string;
  players: LivePlayerState[];
  startTime: Date;
  endTime?: Date;
  winner?: string;
}

export interface LivePlayerState {
  id: string;
  name: string;
  uptime: number;
  money: number;
  users: number;
  day: number;
  phase: 'web' | 'mobile' | 'app';
  isAlive: boolean;
  lastUpdate: Date;
}

// Demo data
const demoRooms: MultiplayerRoom[] = [
  {
    id: 'demo-1',
    name: '초보자 환영방',
    hostId: 'demo-host-1',
    hostName: 'GameMaster',
    status: 'waiting',
    maxPlayers: 4,
    players: [
      { id: 'demo-host-1', name: 'GameMaster', isHost: true, isReady: true, score: 0, uptime: 100, day: 0, status: 'waiting', lastUpdate: new Date() },
      { id: 'demo-p2', name: 'Player2', isHost: false, isReady: true, score: 0, uptime: 100, day: 0, status: 'waiting', lastUpdate: new Date() }
    ],
    settings: { duration: 10, startingMoney: 1000, startingUsers: 100, difficulty: 'easy', allowSpectators: true },
    createdAt: new Date()
  },
  {
    id: 'demo-2',
    name: '프로 경쟁전',
    hostId: 'demo-host-2',
    hostName: 'ProGamer',
    status: 'playing',
    maxPlayers: 6,
    players: [
      { id: 'demo-host-2', name: 'ProGamer', isHost: true, isReady: true, score: 1500, uptime: 98.5, day: 15, status: 'playing', lastUpdate: new Date() },
      { id: 'demo-p3', name: 'Challenger', isHost: false, isReady: true, score: 1200, uptime: 95.2, day: 14, status: 'playing', lastUpdate: new Date() },
      { id: 'demo-p4', name: 'Rookie', isHost: false, isReady: true, score: 800, uptime: 89.1, day: 12, status: 'playing', lastUpdate: new Date() }
    ],
    settings: { duration: 20, startingMoney: 500, startingUsers: 50, difficulty: 'hard', allowSpectators: false },
    createdAt: new Date(),
    startedAt: new Date(Date.now() - 600000)
  }
];

// Room Management
export const createRoom = async (
  hostId: string,
  hostName: string,
  roomName: string,
  settings: RoomSettings
): Promise<string | null> => {
  if (isDemoMode()) {
    const roomId = `demo-room-${Date.now()}`;
    console.log('Demo: Room created', { roomId, hostName, roomName });
    return roomId;
  }

  try {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const roomRef = doc(db, 'rooms', roomId);

    await setDoc(roomRef, {
      id: roomId,
      name: roomName,
      hostId,
      hostName,
      status: 'waiting',
      maxPlayers: settings.difficulty === 'easy' ? 4 : 6,
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        isReady: true,
        score: 0,
        uptime: 100,
        day: 0,
        status: 'waiting',
        lastUpdate: serverTimestamp()
      }],
      settings,
      createdAt: serverTimestamp()
    });

    return roomId;
  } catch (error) {
    console.error('Failed to create room:', error);
    return null;
  }
};

export const joinRoom = async (
  roomId: string,
  playerId: string,
  playerName: string
): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Joined room', { roomId, playerName });
    return true;
  }

  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return false;

    const room = roomSnap.data() as MultiplayerRoom;
    if (room.status !== 'waiting') return false;
    if (room.players.length >= room.maxPlayers) return false;
    if (room.players.some(p => p.id === playerId)) return true;

    const newPlayer: RoomPlayer = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false,
      score: 0,
      uptime: 100,
      day: 0,
      status: 'waiting',
      lastUpdate: new Date()
    };

    await updateDoc(roomRef, {
      players: [...room.players, newPlayer]
    });

    return true;
  } catch (error) {
    console.error('Failed to join room:', error);
    return false;
  }
};

export const leaveRoom = async (roomId: string, playerId: string): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo: Left room', { roomId, playerId });
    return;
  }

  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return;

    const room = roomSnap.data() as MultiplayerRoom;
    const updatedPlayers = room.players.filter(p => p.id !== playerId);

    if (updatedPlayers.length === 0) {
      await deleteDoc(roomRef);
    } else {
      // Transfer host if needed
      if (room.hostId === playerId && updatedPlayers.length > 0) {
        updatedPlayers[0].isHost = true;
        await updateDoc(roomRef, {
          hostId: updatedPlayers[0].id,
          hostName: updatedPlayers[0].name,
          players: updatedPlayers
        });
      } else {
        await updateDoc(roomRef, { players: updatedPlayers });
      }
    }
  } catch (error) {
    console.error('Failed to leave room:', error);
  }
};

export const setPlayerReady = async (
  roomId: string,
  playerId: string,
  isReady: boolean
): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo: Set ready', { roomId, playerId, isReady });
    return;
  }

  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return;

    const room = roomSnap.data() as MultiplayerRoom;
    const updatedPlayers = room.players.map(p =>
      p.id === playerId ? { ...p, isReady } : p
    );

    await updateDoc(roomRef, { players: updatedPlayers });
  } catch (error) {
    console.error('Failed to set ready:', error);
  }
};

export const startMatch = async (roomId: string): Promise<boolean> => {
  if (isDemoMode()) {
    console.log('Demo: Match started', { roomId });
    return true;
  }

  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return false;

    const room = roomSnap.data() as MultiplayerRoom;
    if (!room.players.every(p => p.isReady)) return false;

    const updatedPlayers = room.players.map(p => ({
      ...p,
      status: 'playing' as const,
      score: 0,
      uptime: 100,
      day: 1
    }));

    await updateDoc(roomRef, {
      status: 'playing',
      players: updatedPlayers,
      startedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Failed to start match:', error);
    return false;
  }
};

// Live game updates
export const updatePlayerState = async (
  roomId: string,
  playerId: string,
  state: Partial<LivePlayerState>
): Promise<void> => {
  if (isDemoMode()) return;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return;

    const room = roomSnap.data() as MultiplayerRoom;
    const updatedPlayers = room.players.map(p =>
      p.id === playerId
        ? { ...p, ...state, lastUpdate: new Date() }
        : p
    );

    await updateDoc(roomRef, { players: updatedPlayers });
  } catch (error) {
    console.error('Failed to update player state:', error);
  }
};

// Get available rooms
export const getAvailableRooms = async (): Promise<MultiplayerRoom[]> => {
  if (isDemoMode()) {
    return demoRooms.filter(r => r.status === 'waiting');
  }

  try {
    const q = query(
      collection(db, 'rooms'),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const rooms: MultiplayerRoom[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      rooms.push({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate()
      } as MultiplayerRoom);
    });

    return rooms;
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return demoRooms.filter(r => r.status === 'waiting');
  }
};

// Subscribe to room updates
export const subscribeToRoom = (
  roomId: string,
  callback: (room: MultiplayerRoom | null) => void
): (() => void) => {
  if (isDemoMode()) {
    const room = demoRooms.find(r => r.id === roomId) || null;
    callback(room);
    return () => {};
  }

  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        endedAt: data.endedAt?.toDate()
      } as MultiplayerRoom);
    } else {
      callback(null);
    }
  });
};

// End match
export const endMatch = async (
  roomId: string,
  winnerId: string
): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo: Match ended', { roomId, winnerId });
    return;
  }

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      status: 'finished',
      endedAt: serverTimestamp(),
      winner: winnerId
    });
  } catch (error) {
    console.error('Failed to end match:', error);
  }
};
