import { Upgrade } from '../types';

export type { Upgrade };

export const upgrades: Upgrade[] = [
  // Infrastructure upgrades
  {
    id: 'cdn',
    name: 'CDN 도입',
    description: '전 세계 사용자에게 빠른 콘텐츠 전송이 가능해집니다.',
    cost: 500,
    effect: { serverCapacity: 500, uptimeBonus: 1 },
    category: 'infrastructure'
  },
  {
    id: 'load_balancer',
    name: '로드 밸런서',
    description: '트래픽을 분산하여 서버 안정성을 높입니다.',
    cost: 800,
    effect: { serverCapacity: 1000, uptimeBonus: 2 },
    requires: ['cdn'],
    category: 'infrastructure'
  },
  {
    id: 'auto_scaling',
    name: '오토 스케일링',
    description: '트래픽에 따라 자동으로 서버를 확장/축소합니다.',
    cost: 1500,
    effect: { serverCapacity: 2000, uptimeBonus: 3 },
    requires: ['load_balancer'],
    category: 'infrastructure'
  },
  {
    id: 'multi_region',
    name: '멀티 리전 배포',
    description: '여러 지역에 서버를 배포하여 지연 시간을 줄입니다.',
    cost: 3000,
    effect: { serverCapacity: 5000, uptimeBonus: 5 },
    requires: ['auto_scaling'],
    category: 'infrastructure'
  },
  {
    id: 'backup_system',
    name: '백업 시스템',
    description: '자동 백업으로 데이터 손실을 방지합니다.',
    cost: 600,
    effect: { uptimeBonus: 2 },
    category: 'infrastructure'
  },
  {
    id: 'monitoring',
    name: '모니터링 대시보드',
    description: '실시간 서버 상태 모니터링이 가능해집니다.',
    cost: 400,
    effect: { uptimeBonus: 1, ticketSpeed: 0.1 },
    category: 'infrastructure'
  },
  {
    id: 'alerting',
    name: '알림 시스템',
    description: '문제 발생 시 즉시 알림을 받습니다.',
    cost: 300,
    effect: { ticketSpeed: 0.15 },
    requires: ['monitoring'],
    category: 'infrastructure'
  },

  // Team upgrades
  {
    id: 'code_review',
    name: '코드 리뷰 프로세스',
    description: '코드 품질이 향상되어 기술 부채가 쌓이는 속도가 줄어듭니다.',
    cost: 200,
    effect: { techDebtReduction: 0.1 },
    category: 'team'
  },
  {
    id: 'ci_cd',
    name: 'CI/CD 파이프라인',
    description: '자동 빌드/배포로 개발 속도가 향상됩니다.',
    cost: 500,
    effect: { ticketSpeed: 0.2, techDebtReduction: 0.05 },
    category: 'team'
  },
  {
    id: 'testing_suite',
    name: '테스트 자동화',
    description: '버그 발생 확률이 크게 줄어듭니다.',
    cost: 700,
    effect: { techDebtReduction: 0.15, uptimeBonus: 1 },
    requires: ['ci_cd'],
    category: 'team'
  },
  {
    id: 'documentation',
    name: '문서화 도구',
    description: '팀 효율성이 향상됩니다.',
    cost: 150,
    effect: { ticketSpeed: 0.1 },
    category: 'team'
  },
  {
    id: 'agile_training',
    name: '애자일 교육',
    description: '팀의 생산성이 향상됩니다.',
    cost: 400,
    effect: { ticketSpeed: 0.15 },
    category: 'team'
  },
  {
    id: 'dev_tools',
    name: '개발 도구 업그레이드',
    description: '최신 개발 도구로 생산성이 향상됩니다.',
    cost: 350,
    effect: { ticketSpeed: 0.12, techDebtReduction: 0.05 },
    category: 'team'
  },

  // Marketing upgrades
  {
    id: 'social_media',
    name: '소셜 미디어 마케팅',
    description: '소셜 미디어를 통해 사용자를 획득합니다.',
    cost: 300,
    effect: { revenueMultiplier: 0.05 },
    category: 'marketing'
  },
  {
    id: 'seo_optimization',
    name: 'SEO 최적화',
    description: '검색 엔진 노출이 향상됩니다.',
    cost: 250,
    effect: { revenueMultiplier: 0.08 },
    category: 'marketing'
  },
  {
    id: 'content_marketing',
    name: '콘텐츠 마케팅',
    description: '블로그와 콘텐츠로 유입을 늘립니다.',
    cost: 400,
    effect: { revenueMultiplier: 0.1 },
    requires: ['seo_optimization'],
    category: 'marketing'
  },
  {
    id: 'influencer_partnership',
    name: '인플루언서 파트너십',
    description: '인플루언서를 통한 홍보가 가능해집니다.',
    cost: 1000,
    effect: { revenueMultiplier: 0.2 },
    requires: ['social_media'],
    category: 'marketing'
  },
  {
    id: 'referral_program',
    name: '추천 프로그램',
    description: '사용자 추천 시스템을 도입합니다.',
    cost: 600,
    effect: { revenueMultiplier: 0.12 },
    category: 'marketing'
  },
  {
    id: 'press_release',
    name: '언론 홍보',
    description: '언론 보도를 통해 인지도를 높입니다.',
    cost: 800,
    effect: { revenueMultiplier: 0.15 },
    category: 'marketing'
  },

  // Technology upgrades
  {
    id: 'caching',
    name: '캐싱 레이어',
    description: '데이터 캐싱으로 응답 속도가 빨라집니다.',
    cost: 350,
    effect: { serverCapacity: 300, uptimeBonus: 1 },
    category: 'technology'
  },
  {
    id: 'database_optimization',
    name: '데이터베이스 최적화',
    description: 'DB 쿼리 최적화로 성능이 향상됩니다.',
    cost: 500,
    effect: { serverCapacity: 500, ticketSpeed: 0.1 },
    category: 'technology'
  },
  {
    id: 'api_gateway',
    name: 'API Gateway',
    description: 'API 관리 및 보안이 강화됩니다.',
    cost: 600,
    effect: { uptimeBonus: 1, ticketSpeed: 0.05 },
    category: 'technology'
  },
  {
    id: 'microservices',
    name: '마이크로서비스 전환',
    description: '확장성과 유지보수성이 크게 향상됩니다.',
    cost: 2000,
    effect: { serverCapacity: 2000, techDebtReduction: 0.2, uptimeBonus: 2 },
    requires: ['api_gateway', 'ci_cd'],
    category: 'technology'
  },
  {
    id: 'security_audit',
    name: '보안 감사',
    description: '정기적인 보안 점검으로 취약점을 사전에 발견합니다.',
    cost: 450,
    effect: { uptimeBonus: 1 },
    category: 'technology'
  },
  {
    id: 'performance_optimization',
    name: '성능 최적화',
    description: '코드 및 리소스 최적화로 전반적인 성능이 향상됩니다.',
    cost: 550,
    effect: { serverCapacity: 400, ticketSpeed: 0.08 },
    requires: ['caching'],
    category: 'technology'
  }
];

export const getUpgradeById = (id: string): Upgrade | undefined => {
  return upgrades.find(u => u.id === id);
};

export const getAvailableUpgrades = (purchasedIds: string[]): Upgrade[] => {
  return upgrades.filter(upgrade => {
    // Already purchased
    if (purchasedIds.includes(upgrade.id)) return false;

    // Check requirements
    if (upgrade.requires) {
      return upgrade.requires.every(reqId => purchasedIds.includes(reqId));
    }

    return true;
  });
};

export const getUpgradesByCategory = (category: Upgrade['category']): Upgrade[] => {
  return upgrades.filter(u => u.category === category);
};

export const getCategoryIcon = (category: Upgrade['category']): string => {
  switch (category) {
    case 'infrastructure': return '🖥️';
    case 'team': return '👥';
    case 'marketing': return '📢';
    case 'technology': return '⚙️';
  }
};

export const getCategoryName = (category: Upgrade['category']): string => {
  switch (category) {
    case 'infrastructure': return '인프라';
    case 'team': return '팀';
    case 'marketing': return '마케팅';
    case 'technology': return '기술';
  }
};
