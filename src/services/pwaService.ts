/**
 * PWA Service - Offline Support, Push Notifications, Background Sync
 */

import { monitoring } from './monitoringService';

// ===== TYPES =====

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export type ConnectionStatus = 'online' | 'offline' | 'slow';

// ===== NETWORK STATUS =====

class NetworkStatusManager {
  private status: ConnectionStatus = 'online';
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private slowConnectionThreshold = 2000; // ms

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => this.setStatus('online'));
    window.addEventListener('offline', () => this.setStatus('offline'));

    // Initial check
    if (!navigator.onLine) {
      this.status = 'offline';
    }

    // Check connection speed periodically
    this.checkConnectionSpeed();
    setInterval(() => this.checkConnectionSpeed(), 30000);
  }

  private async checkConnectionSpeed(): Promise<void> {
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    try {
      const start = performance.now();
      await fetch('/health', { method: 'HEAD', cache: 'no-store' });
      const duration = performance.now() - start;

      if (duration > this.slowConnectionThreshold) {
        this.setStatus('slow');
      } else {
        this.setStatus('online');
      }
    } catch {
      // If health check fails but we're "online", might be slow
      if (navigator.onLine) {
        this.setStatus('slow');
      }
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      monitoring.info('Network status changed', { status });
      this.listeners.forEach(listener => listener(status));
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.status !== 'offline';
  }

  subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const networkStatus = new NetworkStatusManager();

// ===== PUSH NOTIFICATIONS =====

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      monitoring.warn('Push notifications not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      this.subscription = await this.registration.pushManager.getSubscription();

      if (this.subscription) {
        monitoring.info('Push subscription found');
      }
    } catch (error) {
      monitoring.error('Failed to initialize push notifications', { error });
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    monitoring.info('Notification permission', { permission });
    return permission;
  }

  async subscribe(vapidPublicKey: string): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      return null;
    }

    try {
      // Unsubscribe from existing subscription
      if (this.subscription) {
        await this.subscription.unsubscribe();
      }

      // Subscribe with VAPID key
      const keyArray = this.urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray as BufferSource,
      });

      this.subscription = subscription;

      const json = subscription.toJSON();
      const data: PushSubscriptionData = {
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
      };

      monitoring.info('Push subscription created');
      return data;
    } catch (error) {
      monitoring.error('Failed to subscribe to push notifications', { error });
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      monitoring.info('Push subscription removed');
      return result;
    } catch (error) {
      monitoring.error('Failed to unsubscribe from push notifications', { error });
      return false;
    }
  }

  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Show local notification (not push)
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    if (this.registration) {
      const options: NotificationOptions & { actions?: NotificationPayload['actions']; vibrate?: number[] } = {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
      };

      // Add actions if supported
      if (payload.actions) {
        options.actions = payload.actions;
      }

      // Add vibrate pattern
      if (payload.vibrate || !payload.silent) {
        options.vibrate = payload.vibrate || [200, 100, 200];
      }

      await this.registration.showNotification(payload.title, options as NotificationOptions);
    } else {
      // Fallback to standard notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
        tag: payload.tag,
        data: payload.data,
        silent: payload.silent,
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export const pushNotifications = new PushNotificationManager();

// ===== BACKGROUND SYNC =====

interface SyncTask {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

class BackgroundSyncManager {
  private queue: SyncTask[] = [];
  private readonly STORAGE_KEY = 'uptime_sync_queue';
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.loadQueue();
    this.setupListeners();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage full or unavailable
    }
  }

  private setupListeners(): void {
    // Process queue when coming back online
    window.addEventListener('online', () => {
      this.processQueue();
    });

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // Listen for sync events from service worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data?.type === 'SYNC_COMPLETE') {
            this.onSyncComplete(event.data.taskId);
          }
        });
      });
    }
  }

  async addTask(type: string, data: unknown): Promise<string> {
    const task: SyncTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(task);
    this.saveQueue();

    // Try to process immediately if online
    if (networkStatus.isOnline()) {
      this.processQueue();
    } else {
      // Register for background sync
      await this.registerBackgroundSync();
    }

    return task.id;
  }

  private async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('uptime-sync');
        monitoring.info('Background sync registered');
      } catch {
        monitoring.warn('Background sync registration failed');
      }
    }
  }

  async processQueue(): Promise<void> {
    if (!networkStatus.isOnline() || this.queue.length === 0) {
      return;
    }

    const tasks = [...this.queue];

    for (const task of tasks) {
      try {
        await this.processTask(task);
        this.removeTask(task.id);
      } catch (error) {
        task.retries++;
        if (task.retries >= this.MAX_RETRIES) {
          monitoring.error('Sync task failed after max retries', { taskId: task.id, type: task.type });
          this.removeTask(task.id);
        } else {
          this.saveQueue();
        }
      }
    }
  }

  private async processTask(task: SyncTask): Promise<void> {
    monitoring.info('Processing sync task', { taskId: task.id, type: task.type });

    // Handle different task types
    switch (task.type) {
      case 'SAVE_GAME_STATE':
        await this.syncGameState(task.data);
        break;
      case 'SUBMIT_SCORE':
        await this.syncScore(task.data);
        break;
      case 'UPDATE_PROFILE':
        await this.syncProfile(task.data);
        break;
      default:
        monitoring.warn('Unknown sync task type', { type: task.type });
    }
  }

  private async syncGameState(data: unknown): Promise<void> {
    // Implement game state sync
    console.log('Syncing game state:', data);
  }

  private async syncScore(data: unknown): Promise<void> {
    // Implement score sync
    console.log('Syncing score:', data);
  }

  private async syncProfile(data: unknown): Promise<void> {
    // Implement profile sync
    console.log('Syncing profile:', data);
  }

  private removeTask(taskId: string): void {
    this.queue = this.queue.filter(t => t.id !== taskId);
    this.saveQueue();
  }

  private onSyncComplete(taskId: string): void {
    this.removeTask(taskId);
    monitoring.info('Sync task completed', { taskId });
  }

  getPendingTasks(): SyncTask[] {
    return [...this.queue];
  }

  hasPendingTasks(): boolean {
    return this.queue.length > 0;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const backgroundSync = new BackgroundSyncManager();

// ===== OFFLINE STORAGE =====

class OfflineStorage {
  private readonly DB_NAME = 'uptime_offline_db';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        monitoring.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        monitoring.info('IndexedDB opened');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains('gameState')) {
          db.createObjectStore('gameState', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('offline_actions')) {
          const actionsStore = db.createObjectStore('offline_actions', { keyPath: 'id', autoIncrement: true });
          actionsStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async save(storeName: string, data: unknown): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

// ===== APP INSTALL PROMPT =====

class InstallPromptManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private listeners: Set<(canInstall: boolean) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyListeners(true);
      monitoring.info('Install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyListeners(false);
      monitoring.info('App installed');
    });
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  async prompt(): Promise<'accepted' | 'dismissed' | null> {
    if (!this.deferredPrompt) {
      return null;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    this.deferredPrompt = null;
    this.notifyListeners(false);

    monitoring.info('Install prompt outcome', { outcome });
    return outcome;
  }

  subscribe(listener: (canInstall: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(canInstall: boolean): void {
    this.listeners.forEach(listener => listener(canInstall));
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const installPrompt = new InstallPromptManager();

// ===== PWA SERVICE EXPORT =====

export const pwaService = {
  networkStatus,
  pushNotifications,
  backgroundSync,
  offlineStorage,
  installPrompt,

  async init(): Promise<void> {
    await offlineStorage.init();
    await pushNotifications.init();
    monitoring.info('PWA service initialized');
  },
};

export default pwaService;
