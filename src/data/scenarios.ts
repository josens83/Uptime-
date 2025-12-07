import { Phase } from '../types';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  icon: string;
  initialState: {
    money: number;
    users: number;
    uptime: number;
    reputation: number;
    techDebt: number;
    phase: Phase;
    day: number;
  };
  objectives: ScenarioObjective[];
  timeLimit?: number; // days
  modifiers?: {
    eventFrequency?: number; // multiplier
    ticketFrequency?: number;
    uptimeDecay?: number;
    revenueMultiplier?: number;
  };
  rewards?: {
    achievement?: string;
    money?: number;
  };
  premium?: boolean;
}

export interface ScenarioObjective {
  id: string;
  description: string;
  type: 'reach' | 'maintain' | 'survive' | 'avoid';
  target: {
    metric: 'users' | 'money' | 'uptime' | 'reputation' | 'day' | 'phase' | 'techDebt';
    value: number | string;
    duration?: number; // days for 'maintain' type
  };
  completed?: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'normal' | 'hard';
  objectives: ScenarioObjective[];
  rewards: {
    money?: number;
    reputation?: number;
    achievement?: string;
  };
  expiresAt?: Date;
  premium?: boolean;
}

export const scenarios: Scenario[] = [
  // Tutorial / Easy scenarios
  {
    id: 'first_steps',
    name: '첫 걸음',
    description: '웹사이트 운영의 기초를 배워봅시다.',
    difficulty: 'easy',
    icon: '🎯',
    initialState: {
      money: 2000,
      users: 100,
      uptime: 100,
      reputation: 50,
      techDebt: 0,
      phase: 'web',
      day: 1
    },
    objectives: [
      { id: 'obj1', description: '10일 생존하기', type: 'survive', target: { metric: 'day', value: 10 } },
      { id: 'obj2', description: '사용자 500명 달성', type: 'reach', target: { metric: 'users', value: 500 } }
    ],
    timeLimit: 15,
    rewards: { achievement: 'first_scenario_complete' }
  },
  {
    id: 'budget_challenge',
    name: '예산 관리',
    description: '제한된 예산으로 서비스를 성장시켜보세요.',
    difficulty: 'easy',
    icon: '💰',
    initialState: {
      money: 500,
      users: 50,
      uptime: 100,
      reputation: 30,
      techDebt: 0,
      phase: 'web',
      day: 1
    },
    objectives: [
      { id: 'obj1', description: '$5000 보유하기', type: 'reach', target: { metric: 'money', value: 5000 } },
      { id: 'obj2', description: '파산하지 않고 20일 버티기', type: 'survive', target: { metric: 'day', value: 20 } }
    ],
    rewards: { achievement: 'budget_master' }
  },

  // Normal difficulty
  {
    id: 'growth_spurt',
    name: '급성장',
    description: '빠른 성장의 압박 속에서 서비스를 관리하세요.',
    difficulty: 'normal',
    icon: '📈',
    initialState: {
      money: 1000,
      users: 200,
      uptime: 95,
      reputation: 60,
      techDebt: 20,
      phase: 'web',
      day: 10
    },
    objectives: [
      { id: 'obj1', description: '사용자 5000명 달성', type: 'reach', target: { metric: 'users', value: 5000 } },
      { id: 'obj2', description: '업타임 95% 이상 유지 (10일)', type: 'maintain', target: { metric: 'uptime', value: 95, duration: 10 } }
    ],
    modifiers: { eventFrequency: 1.5 },
    rewards: { achievement: 'growth_hacker', money: 5000 }
  },
  {
    id: 'startup_life',
    name: '스타트업 라이프',
    description: '투자 유치부터 앱 출시까지, 스타트업의 여정을 경험하세요.',
    difficulty: 'normal',
    icon: '🚀',
    initialState: {
      money: 3000,
      users: 500,
      uptime: 98,
      reputation: 50,
      techDebt: 10,
      phase: 'web',
      day: 1
    },
    objectives: [
      { id: 'obj1', description: 'App 페이즈 달성', type: 'reach', target: { metric: 'phase', value: 'app' } },
      { id: 'obj2', description: '평판 80 이상 달성', type: 'reach', target: { metric: 'reputation', value: 80 } },
      { id: 'obj3', description: '$50,000 보유하기', type: 'reach', target: { metric: 'money', value: 50000 } }
    ],
    timeLimit: 60,
    rewards: { achievement: 'startup_founder' }
  },

  // Hard difficulty
  {
    id: 'crisis_management',
    name: '위기 관리',
    description: '대규모 보안 사고가 발생했습니다. 서비스를 정상화하세요.',
    difficulty: 'hard',
    icon: '🔥',
    initialState: {
      money: 500,
      users: 3000,
      uptime: 60,
      reputation: 20,
      techDebt: 50,
      phase: 'mobile',
      day: 30
    },
    objectives: [
      { id: 'obj1', description: '업타임 99% 복구', type: 'reach', target: { metric: 'uptime', value: 99 } },
      { id: 'obj2', description: '평판 70 이상 회복', type: 'reach', target: { metric: 'reputation', value: 70 } },
      { id: 'obj3', description: '기술부채 20 이하로 감소', type: 'reach', target: { metric: 'techDebt', value: 20 } }
    ],
    timeLimit: 30,
    modifiers: { eventFrequency: 2, ticketFrequency: 1.5 },
    rewards: { achievement: 'crisis_manager', money: 10000 }
  },
  {
    id: 'legacy_rescue',
    name: '레거시 구출',
    description: '오래된 레거시 시스템을 현대화하세요.',
    difficulty: 'hard',
    icon: '🏚️',
    initialState: {
      money: 2000,
      users: 5000,
      uptime: 85,
      reputation: 40,
      techDebt: 80,
      phase: 'web',
      day: 50
    },
    objectives: [
      { id: 'obj1', description: '기술부채 0으로 만들기', type: 'reach', target: { metric: 'techDebt', value: 0 } },
      { id: 'obj2', description: '사용자 이탈 막기 (5000명 이상 유지)', type: 'maintain', target: { metric: 'users', value: 5000, duration: 20 } }
    ],
    rewards: { achievement: 'legacy_master' },
    premium: true
  },

  // Expert difficulty
  {
    id: 'iron_man',
    name: '아이언 맨 모드',
    description: '최소 자원으로 시작해 앱까지 성장시키세요. 실패는 허용되지 않습니다.',
    difficulty: 'expert',
    icon: '🦾',
    initialState: {
      money: 100,
      users: 10,
      uptime: 100,
      reputation: 10,
      techDebt: 0,
      phase: 'web',
      day: 1
    },
    objectives: [
      { id: 'obj1', description: 'App 페이즈 달성', type: 'reach', target: { metric: 'phase', value: 'app' } },
      { id: 'obj2', description: '사용자 100,000명 달성', type: 'reach', target: { metric: 'users', value: 100000 } },
      { id: 'obj3', description: '업타임 99.9% 이상으로 마무리', type: 'reach', target: { metric: 'uptime', value: 99.9 } }
    ],
    modifiers: { eventFrequency: 2, ticketFrequency: 2, uptimeDecay: 1.5 },
    rewards: { achievement: 'iron_man', money: 50000 },
    premium: true
  },
  {
    id: 'speedrun',
    name: '스피드런',
    description: '최단 시간 내에 목표를 달성하세요.',
    difficulty: 'expert',
    icon: '⚡',
    initialState: {
      money: 5000,
      users: 1000,
      uptime: 100,
      reputation: 70,
      techDebt: 0,
      phase: 'web',
      day: 1
    },
    objectives: [
      { id: 'obj1', description: 'App 페이즈 달성', type: 'reach', target: { metric: 'phase', value: 'app' } },
      { id: 'obj2', description: '$100,000 달성', type: 'reach', target: { metric: 'money', value: 100000 } }
    ],
    timeLimit: 30,
    modifiers: { revenueMultiplier: 1.5, eventFrequency: 1.5 },
    rewards: { achievement: 'speedrunner' },
    premium: true
  }
];

// Daily/Weekly challenges
export const generateDailyChallenge = (): Challenge => {
  const challenges: Omit<Challenge, 'expiresAt'>[] = [
    {
      id: 'daily_uptime',
      name: '업타임 마스터',
      description: '오늘 하루 업타임 98% 이상 유지하기',
      type: 'daily',
      difficulty: 'easy',
      objectives: [
        { id: 'obj1', description: '업타임 98% 이상 유지', type: 'maintain', target: { metric: 'uptime', value: 98, duration: 1 } }
      ],
      rewards: { money: 500 }
    },
    {
      id: 'daily_tickets',
      name: '티켓 해결사',
      description: '오늘 하루 10개 이상의 티켓 해결하기',
      type: 'daily',
      difficulty: 'normal',
      objectives: [
        { id: 'obj1', description: '티켓 10개 해결', type: 'reach', target: { metric: 'day', value: 10 } }
      ],
      rewards: { money: 800, reputation: 5 }
    },
    {
      id: 'daily_growth',
      name: '성장의 하루',
      description: '오늘 하루 사용자 100명 증가시키기',
      type: 'daily',
      difficulty: 'normal',
      objectives: [
        { id: 'obj1', description: '사용자 100명 증가', type: 'reach', target: { metric: 'users', value: 100 } }
      ],
      rewards: { money: 600, reputation: 3 }
    }
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    ...randomChallenge,
    expiresAt: tomorrow
  };
};

export const generateWeeklyChallenge = (): Challenge => {
  const challenges: Omit<Challenge, 'expiresAt'>[] = [
    {
      id: 'weekly_marathon',
      name: '주간 마라톤',
      description: '이번 주 7일 연속 플레이하기',
      type: 'weekly',
      difficulty: 'normal',
      objectives: [
        { id: 'obj1', description: '7일 생존', type: 'survive', target: { metric: 'day', value: 7 } }
      ],
      rewards: { money: 3000, reputation: 20 }
    },
    {
      id: 'weekly_growth',
      name: '주간 성장',
      description: '이번 주 사용자 1000명 증가시키기',
      type: 'weekly',
      difficulty: 'hard',
      objectives: [
        { id: 'obj1', description: '사용자 1000명 증가', type: 'reach', target: { metric: 'users', value: 1000 } }
      ],
      rewards: { money: 5000, reputation: 30 },
      premium: true
    }
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1) % 7);
  nextMonday.setHours(0, 0, 0, 0);

  return {
    ...randomChallenge,
    expiresAt: nextMonday
  };
};

export const getScenarioById = (id: string): Scenario | undefined => {
  return scenarios.find(s => s.id === id);
};

export const getScenariosByDifficulty = (difficulty: Scenario['difficulty']): Scenario[] => {
  return scenarios.filter(s => s.difficulty === difficulty);
};

export const getDifficultyColor = (difficulty: Scenario['difficulty']): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'normal': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'hard': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'expert': return 'text-red-400 bg-red-500/20 border-red-500/30';
  }
};

export const getDifficultyName = (difficulty: Scenario['difficulty']): string => {
  switch (difficulty) {
    case 'easy': return '쉬움';
    case 'normal': return '보통';
    case 'hard': return '어려움';
    case 'expert': return '전문가';
  }
};
