/**
 * WebSocket Service for Real-time Features
 * Supports auto-reconnection, heartbeat, and message queuing
 */

import { monitoring } from './monitoringService';
import { networkStatus } from './pwaService';

// ===== TYPES =====

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectInterval: number;
  reconnectMaxAttempts: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  messageQueueSize: number;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  id?: string;
}

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

// ===== DEFAULT CONFIG =====

const DEFAULT_CONFIG: WebSocketConfig = {
  url: '',
  reconnect: true,
  reconnectInterval: 1000,
  reconnectMaxAttempts: 10,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  messageQueueSize: 100,
};

// ===== WEBSOCKET CLIENT =====

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, Set<(payload: unknown) => void>> = new Map();
  private eventHandlers: WebSocketEventHandlers = {};
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();

  constructor(config: Partial<WebSocketConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Listen for network status changes
    networkStatus.subscribe((status) => {
      if (status === 'online' && this.status === 'disconnected') {
        this.connect();
      }
    });
  }

  // ===== CONNECTION MANAGEMENT =====

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (!this.config.url) {
      monitoring.error('WebSocket URL not configured');
      return;
    }

    this.setStatus('connecting');
    monitoring.info('WebSocket connecting', { url: this.config.url });

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventListeners();
    } catch (error) {
      monitoring.error('WebSocket connection failed', { error });
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      monitoring.info('WebSocket connected');
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.eventHandlers.onOpen?.();
    };

    this.ws.onclose = (event) => {
      monitoring.info('WebSocket closed', { code: event.code, reason: event.reason });
      this.stopHeartbeat();
      this.eventHandlers.onClose?.(event.code, event.reason);

      if (event.code !== 1000 && this.config.reconnect) {
        this.scheduleReconnect();
      } else {
        this.setStatus('disconnected');
      }
    };

    this.ws.onerror = (event) => {
      monitoring.error('WebSocket error', { event });
      this.setStatus('error');
      this.eventHandlers.onError?.(event);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  // ===== MESSAGE HANDLING =====

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      // Handle heartbeat response
      if (message.type === 'pong') {
        this.clearHeartbeatTimeout();
        return;
      }

      monitoring.debug('WebSocket message received', { type: message.type });

      // Notify general message handler
      this.eventHandlers.onMessage?.(message);

      // Notify specific type handlers
      const handlers = this.messageHandlers.get(message.type);
      handlers?.forEach(handler => handler(message.payload));
    } catch (error) {
      monitoring.error('Failed to parse WebSocket message', { data, error });
    }
  }

  send<T>(type: string, payload: T): boolean {
    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      monitoring.debug('WebSocket message sent', { type });
      return true;
    }

    // Queue message for later
    if (this.messageQueue.length < this.config.messageQueueSize) {
      this.messageQueue.push(message as WebSocketMessage);
      monitoring.debug('WebSocket message queued', { type, queueSize: this.messageQueue.length });
    } else {
      monitoring.warn('WebSocket message queue full, dropping message', { type });
    }

    return false;
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
      monitoring.debug('WebSocket queued message sent', { type: message.type });
    }
  }

  // ===== RECONNECTION =====

  private scheduleReconnect(): void {
    if (!this.config.reconnect) return;
    if (this.reconnectAttempts >= this.config.reconnectMaxAttempts) {
      monitoring.error('WebSocket max reconnect attempts reached');
      this.setStatus('error');
      return;
    }

    this.setStatus('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    monitoring.info('WebSocket reconnecting', {
      attempt: this.reconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  // ===== HEARTBEAT =====

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
        this.startHeartbeatTimeout();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearHeartbeatTimeout();
  }

  private startHeartbeatTimeout(): void {
    this.heartbeatTimeoutTimer = setTimeout(() => {
      monitoring.warn('WebSocket heartbeat timeout');
      this.ws?.close(4000, 'Heartbeat timeout');
    }, this.config.heartbeatTimeout);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  // ===== STATUS =====

  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.eventHandlers.onStatusChange?.(status);
      this.statusListeners.forEach(listener => listener(status));
    }
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  // ===== EVENT HANDLERS =====

  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  on<T>(type: string, handler: (payload: T) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as (payload: unknown) => void);

    return () => {
      this.messageHandlers.get(type)?.delete(handler as (payload: unknown) => void);
    };
  }

  off(type: string, handler?: (payload: unknown) => void): void {
    if (handler) {
      this.messageHandlers.get(type)?.delete(handler);
    } else {
      this.messageHandlers.delete(type);
    }
  }

  onStatusChange(listener: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  // ===== UTILITIES =====

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  clearQueue(): void {
    this.messageQueue = [];
  }
}

// ===== REAL-TIME EVENT TYPES =====

export interface GameStateUpdate {
  gameId: string;
  state: Record<string, unknown>;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  channel: string;
  timestamp: number;
}

export interface PresenceUpdate {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: number;
}

export interface LeaderboardUpdate {
  type: 'global' | 'friends' | 'guild';
  entries: Array<{
    rank: number;
    userId: string;
    username: string;
    score: number;
  }>;
}

export interface NotificationPush {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

// ===== GAME WEBSOCKET CLIENT =====

class GameWebSocketClient extends WebSocketClient {
  constructor() {
    super({
      url: import.meta.env.VITE_WS_URL || 'wss://api.uptime.game/ws',
      reconnect: true,
      reconnectInterval: 2000,
      reconnectMaxAttempts: 10,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
    });
  }

  // Game specific methods
  joinRoom(roomId: string): void {
    this.send('join_room', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId });
  }

  sendChatMessage(channel: string, message: string): void {
    this.send('chat_message', { channel, message });
  }

  updatePresence(status: 'online' | 'away'): void {
    this.send('presence', { status });
  }

  subscribeToLeaderboard(type: 'global' | 'friends' | 'guild'): void {
    this.send('subscribe_leaderboard', { type });
  }

  unsubscribeFromLeaderboard(type: 'global' | 'friends' | 'guild'): void {
    this.send('unsubscribe_leaderboard', { type });
  }

  syncGameState(state: Record<string, unknown>): void {
    this.send('game_state', state);
  }

  // Typed event handlers
  onGameStateUpdate(handler: (update: GameStateUpdate) => void): () => void {
    return this.on('game_state_update', handler);
  }

  onChatMessage(handler: (message: ChatMessage) => void): () => void {
    return this.on('chat_message', handler);
  }

  onPresenceUpdate(handler: (update: PresenceUpdate) => void): () => void {
    return this.on('presence_update', handler);
  }

  onLeaderboardUpdate(handler: (update: LeaderboardUpdate) => void): () => void {
    return this.on('leaderboard_update', handler);
  }

  onNotification(handler: (notification: NotificationPush) => void): () => void {
    return this.on('notification', handler);
  }
}

// ===== SINGLETON INSTANCE =====

export const gameWebSocket = new GameWebSocketClient();

// ===== HOOKS =====

import { useState, useEffect, useCallback } from 'react';

export function useWebSocketStatus() {
  const [status, setStatus] = useState<WebSocketStatus>(gameWebSocket.getStatus());

  useEffect(() => {
    return gameWebSocket.onStatusChange(setStatus);
  }, []);

  return status;
}

export function useWebSocketMessage<T>(type: string) {
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  useEffect(() => {
    return gameWebSocket.on<T>(type, setLastMessage);
  }, [type]);

  return lastMessage;
}

export function useChat(channel: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const status = useWebSocketStatus();

  useEffect(() => {
    return gameWebSocket.onChatMessage((message) => {
      if (message.channel === channel) {
        setMessages(prev => [...prev, message].slice(-100));
      }
    });
  }, [channel]);

  const sendMessage = useCallback((text: string) => {
    gameWebSocket.sendChatMessage(channel, text);
  }, [channel]);

  return {
    messages,
    sendMessage,
    isConnected: status === 'connected',
  };
}

export function usePresence(userIds: string[]) {
  const [presence, setPresence] = useState<Record<string, PresenceUpdate>>({});

  useEffect(() => {
    return gameWebSocket.onPresenceUpdate((update) => {
      if (userIds.includes(update.userId)) {
        setPresence(prev => ({
          ...prev,
          [update.userId]: update,
        }));
      }
    });
  }, [userIds]);

  return presence;
}

export default gameWebSocket;
