// Game Phase types
export type Phase = 'web' | 'mobile' | 'app';

// Ticket types
export type TicketType = 'bug' | 'feature' | 'security' | 'performance';
export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  type: TicketType;
  severity: TicketSeverity;
  title: string;
  description: string;
  timeLimit: number; // seconds
  maxTime: number; // original time limit
  reward: number;
  penalty: number;
  uptimePenalty: number;
  reputationPenalty: number;
}

// Team types
export interface Team {
  developers: number;
  designers: number;
  marketers: number;
}

export interface TeamMember {
  id: string;
  type: 'developer' | 'designer' | 'marketer';
  name: string;
  level: number;
  salary: number;
  efficiency: number;
}

// Event types
export interface EventChoice {
  text: string;
  effect: Partial<{
    money: number;
    users: number;
    uptime: number;
    reputation: number;
    techDebt: number;
    day: number;
  }>;
  premium?: boolean; // Requires premium subscription
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  phase?: Phase;
  minDay?: number;
  icon?: string;
}

// Upgrade types
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: Partial<{
    serverCapacity: number;
    ticketSpeed: number;
    uptimeBonus: number;
    revenueMultiplier: number;
    techDebtReduction: number;
  }>;
  requires?: string[];
  category: 'infrastructure' | 'team' | 'marketing' | 'technology';
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
  reward?: {
    money?: number;
    reputation?: number;
  };
  unlocked?: boolean;
  unlockedAt?: number;
}

// User/Auth types
export interface UserStats {
  totalPlayTime: number;
  highestDay: number;
  achievementsUnlocked: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  subscription: SubscriptionTier;
  subscriptionExpiresAt?: number;
  createdAt: number | Date;
  stats?: UserStats;
}

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number; // monthly price in cents
  yearlyPrice: number;
  features: string[];
  limits: {
    saveSlots: number;
    speedMultiplier: number;
    premiumEvents: boolean;
    noAds: boolean;
    exclusiveSkins: boolean;
  };
}

// Save data types
export interface SaveData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  gameState: GameState;
  thumbnail?: string;
}

// Main game state
export interface GameState {
  // Core metrics
  uptime: number;
  money: number;
  users: number;
  reputation: number;

  // Progress
  phase: Phase;
  day: number;
  hour: number;

  // Technical
  techDebt: number;

  // Team
  team: Team;
  teamMembers: TeamMember[];

  // Infrastructure
  serverTier: number;
  purchasedUpgrades: string[];

  // Active tickets
  tickets: Ticket[];
  resolvedTickets: number;
  failedTickets: number;

  // Achievements
  achievements: string[];

  // Statistics
  totalEarnings: number;
  totalSpent: number;
  peakUsers: number;
  longestUptime: number;

  // Game settings
  isPaused: boolean;
  gameSpeed: number;

  // Tutorial/onboarding
  tutorialCompleted: boolean;
  tutorialStep: number;
}

// Game configuration
export interface GameConfig {
  baseTicketInterval: number;
  baseEventInterval: number;
  uptimeDecayRate: number;
  techDebtThreshold: number;
  userGrowthRate: number;
  serverCosts: number[];
  salaries: {
    developer: number;
    designer: number;
    marketer: number;
  };
  phaseRequirements: {
    mobile: { users: number; money: number; reputation: number };
    app: { users: number; money: number; reputation: number };
  };
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}
