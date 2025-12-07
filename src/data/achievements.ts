import { Achievement, GameState } from '../types';

export const achievements: Achievement[] = [
  // Progress achievements
  {
    id: 'first_day',
    title: '첫 발걸음',
    description: '게임에서 첫 번째 날을 완료했습니다.',
    icon: '👶',
    condition: (state: GameState) => state.day >= 1
  },
  {
    id: 'week_one',
    title: '일주일 생존',
    description: '7일 동안 서비스를 운영했습니다.',
    icon: '📅',
    condition: (state: GameState) => state.day >= 7,
    reward: { money: 500 }
  },
  {
    id: 'month_one',
    title: '한 달의 여정',
    description: '30일 동안 서비스를 운영했습니다.',
    icon: '📆',
    condition: (state: GameState) => state.day >= 30,
    reward: { money: 2000 }
  },
  {
    id: 'quarter',
    title: '분기 달성',
    description: '90일 동안 서비스를 운영했습니다.',
    icon: '🗓️',
    condition: (state: GameState) => state.day >= 90,
    reward: { money: 5000, reputation: 10 }
  },
  {
    id: 'year_one',
    title: '1년 생존!',
    description: '365일 동안 서비스를 운영했습니다.',
    icon: '🎂',
    condition: (state: GameState) => state.day >= 365,
    reward: { money: 20000, reputation: 50 }
  },

  // Uptime achievements
  {
    id: 'uptime_99',
    title: '안정의 시작',
    description: '업타임 99% 이상을 달성했습니다.',
    icon: '✅',
    condition: (state: GameState) => state.uptime >= 99
  },
  {
    id: 'uptime_999',
    title: '나인스 달성',
    description: '업타임 99.9% 이상을 달성했습니다.',
    icon: '🎯',
    condition: (state: GameState) => state.uptime >= 99.9,
    reward: { reputation: 10 }
  },
  {
    id: 'uptime_perfect',
    title: '완벽한 가동',
    description: '업타임 100%를 달성했습니다.',
    icon: '💯',
    condition: (state: GameState) => state.uptime >= 100,
    reward: { money: 1000, reputation: 20 }
  },

  // User achievements
  {
    id: 'users_100',
    title: '첫 100명',
    description: '사용자 100명을 달성했습니다.',
    icon: '👥',
    condition: (state: GameState) => state.users >= 100
  },
  {
    id: 'users_1000',
    title: '천 명 돌파',
    description: '사용자 1,000명을 달성했습니다.',
    icon: '🎉',
    condition: (state: GameState) => state.users >= 1000,
    reward: { money: 1000 }
  },
  {
    id: 'users_10000',
    title: '만 명 달성',
    description: '사용자 10,000명을 달성했습니다.',
    icon: '🚀',
    condition: (state: GameState) => state.users >= 10000,
    reward: { money: 5000, reputation: 20 }
  },
  {
    id: 'users_100000',
    title: '대중화',
    description: '사용자 100,000명을 달성했습니다.',
    icon: '🌟',
    condition: (state: GameState) => state.users >= 100000,
    reward: { money: 20000, reputation: 50 }
  },
  {
    id: 'users_million',
    title: '백만 사용자',
    description: '사용자 1,000,000명을 달성했습니다.',
    icon: '👑',
    condition: (state: GameState) => state.users >= 1000000,
    reward: { money: 100000, reputation: 100 }
  },

  // Money achievements
  {
    id: 'money_10000',
    title: '만 달러 수익',
    description: '총 수익 $10,000를 달성했습니다.',
    icon: '💵',
    condition: (state: GameState) => state.totalEarnings >= 10000
  },
  {
    id: 'money_100000',
    title: '십만 달러 수익',
    description: '총 수익 $100,000를 달성했습니다.',
    icon: '💰',
    condition: (state: GameState) => state.totalEarnings >= 100000,
    reward: { reputation: 10 }
  },
  {
    id: 'money_million',
    title: '밀리어네어',
    description: '총 수익 $1,000,000를 달성했습니다.',
    icon: '🤑',
    condition: (state: GameState) => state.totalEarnings >= 1000000,
    reward: { reputation: 30 }
  },

  // Ticket achievements
  {
    id: 'tickets_10',
    title: '문제 해결사',
    description: '10개의 티켓을 해결했습니다.',
    icon: '🔧',
    condition: (state: GameState) => state.resolvedTickets >= 10
  },
  {
    id: 'tickets_100',
    title: '베테랑 개발자',
    description: '100개의 티켓을 해결했습니다.',
    icon: '⚡',
    condition: (state: GameState) => state.resolvedTickets >= 100,
    reward: { money: 500 }
  },
  {
    id: 'tickets_500',
    title: '이슈 마스터',
    description: '500개의 티켓을 해결했습니다.',
    icon: '🏆',
    condition: (state: GameState) => state.resolvedTickets >= 500,
    reward: { money: 2000, reputation: 10 }
  },
  {
    id: 'tickets_1000',
    title: '전설의 개발자',
    description: '1,000개의 티켓을 해결했습니다.',
    icon: '🌟',
    condition: (state: GameState) => state.resolvedTickets >= 1000,
    reward: { money: 5000, reputation: 25 }
  },

  // Phase achievements
  {
    id: 'phase_mobile',
    title: '모바일 진출',
    description: '모바일 페이즈에 진입했습니다.',
    icon: '📱',
    condition: (state: GameState) => state.phase === 'mobile' || state.phase === 'app',
    reward: { money: 3000, reputation: 15 }
  },
  {
    id: 'phase_app',
    title: '앱 런칭',
    description: '앱 페이즈에 진입했습니다.',
    icon: '📲',
    condition: (state: GameState) => state.phase === 'app',
    reward: { money: 10000, reputation: 30 }
  },

  // Team achievements
  {
    id: 'team_5',
    title: '작은 팀',
    description: '팀원 5명을 고용했습니다.',
    icon: '👨‍👩‍👧‍👦',
    condition: (state: GameState) =>
      state.team.developers + state.team.designers + state.team.marketers >= 5
  },
  {
    id: 'team_10',
    title: '성장하는 팀',
    description: '팀원 10명을 고용했습니다.',
    icon: '🏢',
    condition: (state: GameState) =>
      state.team.developers + state.team.designers + state.team.marketers >= 10,
    reward: { reputation: 5 }
  },
  {
    id: 'team_20',
    title: '대형 조직',
    description: '팀원 20명을 고용했습니다.',
    icon: '🏛️',
    condition: (state: GameState) =>
      state.team.developers + state.team.designers + state.team.marketers >= 20,
    reward: { reputation: 15 }
  },

  // Tech debt achievements
  {
    id: 'tech_debt_low',
    title: '클린 코드',
    description: '기술 부채를 10% 이하로 유지했습니다.',
    icon: '✨',
    condition: (state: GameState) => state.techDebt <= 10 && state.day >= 30,
    reward: { reputation: 10 }
  },
  {
    id: 'tech_debt_zero',
    title: '완벽한 코드베이스',
    description: '기술 부채 0%를 달성했습니다.',
    icon: '💎',
    condition: (state: GameState) => state.techDebt <= 0 && state.day >= 7,
    reward: { reputation: 20 }
  },

  // Reputation achievements
  {
    id: 'reputation_50',
    title: '인정받는 서비스',
    description: '평판 50점을 달성했습니다.',
    icon: '⭐',
    condition: (state: GameState) => state.reputation >= 50
  },
  {
    id: 'reputation_80',
    title: '업계 선두',
    description: '평판 80점을 달성했습니다.',
    icon: '🌟',
    condition: (state: GameState) => state.reputation >= 80,
    reward: { money: 2000 }
  },
  {
    id: 'reputation_100',
    title: '전설의 서비스',
    description: '평판 100점을 달성했습니다.',
    icon: '👑',
    condition: (state: GameState) => state.reputation >= 100,
    reward: { money: 10000 }
  },

  // Special achievements
  {
    id: 'no_failures',
    title: '무결점 운영',
    description: '30일 동안 티켓 실패 없이 운영했습니다.',
    icon: '🏅',
    condition: (state: GameState) => state.day >= 30 && state.failedTickets === 0,
    reward: { money: 5000, reputation: 25 }
  },
  {
    id: 'speed_runner',
    title: '스피드 런너',
    description: '30일 안에 앱 페이즈에 도달했습니다.',
    icon: '🏃',
    condition: (state: GameState) => state.phase === 'app' && state.day <= 30,
    reward: { money: 10000, reputation: 50 }
  },
  {
    id: 'upgrade_master',
    title: '업그레이드 마스터',
    description: '모든 업그레이드를 구매했습니다.',
    icon: '🔝',
    condition: (state: GameState) => state.purchasedUpgrades.length >= 20,
    reward: { reputation: 30 }
  }
];

export const checkAchievements = (
  state: GameState,
  currentAchievements: string[]
): { newAchievements: Achievement[]; rewards: { money: number; reputation: number } } => {
  const newAchievements: Achievement[] = [];
  let totalMoney = 0;
  let totalReputation = 0;

  for (const achievement of achievements) {
    if (currentAchievements.includes(achievement.id)) continue;

    if (achievement.condition(state)) {
      newAchievements.push(achievement);
      if (achievement.reward) {
        totalMoney += achievement.reward.money || 0;
        totalReputation += achievement.reward.reputation || 0;
      }
    }
  }

  return {
    newAchievements,
    rewards: { money: totalMoney, reputation: totalReputation }
  };
};

export const getAchievementProgress = (
  achievement: Achievement,
  state: GameState
): number => {
  // Calculate progress percentage for certain achievements
  const progressMap: Record<string, () => number> = {
    first_day: () => Math.min(state.day / 1, 1),
    week_one: () => Math.min(state.day / 7, 1),
    month_one: () => Math.min(state.day / 30, 1),
    quarter: () => Math.min(state.day / 90, 1),
    year_one: () => Math.min(state.day / 365, 1),
    users_100: () => Math.min(state.users / 100, 1),
    users_1000: () => Math.min(state.users / 1000, 1),
    users_10000: () => Math.min(state.users / 10000, 1),
    users_100000: () => Math.min(state.users / 100000, 1),
    users_million: () => Math.min(state.users / 1000000, 1),
    tickets_10: () => Math.min(state.resolvedTickets / 10, 1),
    tickets_100: () => Math.min(state.resolvedTickets / 100, 1),
    tickets_500: () => Math.min(state.resolvedTickets / 500, 1),
    tickets_1000: () => Math.min(state.resolvedTickets / 1000, 1),
    money_10000: () => Math.min(state.totalEarnings / 10000, 1),
    money_100000: () => Math.min(state.totalEarnings / 100000, 1),
    money_million: () => Math.min(state.totalEarnings / 1000000, 1),
    reputation_50: () => Math.min(state.reputation / 50, 1),
    reputation_80: () => Math.min(state.reputation / 80, 1),
    reputation_100: () => Math.min(state.reputation / 100, 1),
  };

  const progressFn = progressMap[achievement.id];
  return progressFn ? progressFn() : achievement.condition(state) ? 1 : 0;
};
