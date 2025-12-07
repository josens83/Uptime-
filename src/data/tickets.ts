import { Ticket, TicketType, TicketSeverity } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TicketTemplate {
  type: TicketType;
  severity: TicketSeverity;
  title: string;
  description: string;
  baseTimeLimit: number;
  baseReward: number;
  basePenalty: number;
  uptimePenalty: number;
  reputationPenalty: number;
}

const ticketTemplates: TicketTemplate[] = [
  // Bug tickets
  {
    type: 'bug',
    severity: 'critical',
    title: 'DB 연결 끊김',
    description: '데이터베이스 연결이 간헐적으로 끊어지고 있습니다. 서비스 전체에 영향을 미칩니다.',
    baseTimeLimit: 120,
    baseReward: 500,
    basePenalty: 1000,
    uptimePenalty: 15,
    reputationPenalty: 10
  },
  {
    type: 'bug',
    severity: 'critical',
    title: '결제 시스템 오류',
    description: '결제 처리 중 오류가 발생하여 일부 거래가 실패하고 있습니다.',
    baseTimeLimit: 90,
    baseReward: 800,
    basePenalty: 2000,
    uptimePenalty: 20,
    reputationPenalty: 15
  },
  {
    type: 'bug',
    severity: 'high',
    title: '로그인 실패 다수 발생',
    description: '특정 브라우저에서 로그인이 되지 않는다는 신고가 다수 접수되었습니다.',
    baseTimeLimit: 180,
    baseReward: 300,
    basePenalty: 500,
    uptimePenalty: 8,
    reputationPenalty: 8
  },
  {
    type: 'bug',
    severity: 'high',
    title: '이미지 업로드 실패',
    description: '사용자들이 프로필 이미지 업로드에 실패하고 있습니다.',
    baseTimeLimit: 200,
    baseReward: 250,
    basePenalty: 400,
    uptimePenalty: 5,
    reputationPenalty: 5
  },
  {
    type: 'bug',
    severity: 'medium',
    title: '알림 미전송',
    description: '일부 사용자에게 푸시 알림이 전송되지 않고 있습니다.',
    baseTimeLimit: 300,
    baseReward: 150,
    basePenalty: 200,
    uptimePenalty: 2,
    reputationPenalty: 3
  },
  {
    type: 'bug',
    severity: 'medium',
    title: '검색 결과 오류',
    description: '검색 결과가 예상과 다르게 표시되고 있습니다.',
    baseTimeLimit: 350,
    baseReward: 120,
    basePenalty: 180,
    uptimePenalty: 1,
    reputationPenalty: 3
  },
  {
    type: 'bug',
    severity: 'low',
    title: 'UI 오타 수정',
    description: '사용자가 버튼 텍스트에서 오타를 발견했습니다.',
    baseTimeLimit: 600,
    baseReward: 50,
    basePenalty: 30,
    uptimePenalty: 0,
    reputationPenalty: 1
  },
  {
    type: 'bug',
    severity: 'low',
    title: '다크모드 색상 이슈',
    description: '다크모드에서 일부 텍스트가 잘 보이지 않습니다.',
    baseTimeLimit: 500,
    baseReward: 60,
    basePenalty: 40,
    uptimePenalty: 0,
    reputationPenalty: 1
  },

  // Feature requests
  {
    type: 'feature',
    severity: 'high',
    title: '소셜 로그인 요청',
    description: '사용자들이 Google/Apple 로그인 기능을 요청하고 있습니다.',
    baseTimeLimit: 400,
    baseReward: 400,
    basePenalty: 100,
    uptimePenalty: 0,
    reputationPenalty: 5
  },
  {
    type: 'feature',
    severity: 'medium',
    title: '다국어 지원 요청',
    description: '해외 사용자들이 영어 지원을 요청하고 있습니다.',
    baseTimeLimit: 500,
    baseReward: 300,
    basePenalty: 80,
    uptimePenalty: 0,
    reputationPenalty: 3
  },
  {
    type: 'feature',
    severity: 'medium',
    title: '데이터 내보내기 기능',
    description: '사용자 데이터를 CSV로 내보내는 기능이 필요합니다.',
    baseTimeLimit: 450,
    baseReward: 200,
    basePenalty: 60,
    uptimePenalty: 0,
    reputationPenalty: 2
  },
  {
    type: 'feature',
    severity: 'low',
    title: '테마 커스터마이징',
    description: '사용자들이 UI 테마 색상 변경을 요청하고 있습니다.',
    baseTimeLimit: 600,
    baseReward: 100,
    basePenalty: 30,
    uptimePenalty: 0,
    reputationPenalty: 1
  },

  // Security tickets
  {
    type: 'security',
    severity: 'critical',
    title: 'XSS 취약점 발견',
    description: '보안 연구원이 XSS 취약점을 제보했습니다. 즉시 패치가 필요합니다.',
    baseTimeLimit: 60,
    baseReward: 1000,
    basePenalty: 3000,
    uptimePenalty: 25,
    reputationPenalty: 20
  },
  {
    type: 'security',
    severity: 'critical',
    title: 'SQL 인젝션 가능성',
    description: '특정 입력 필드에서 SQL 인젝션 공격이 가능합니다.',
    baseTimeLimit: 75,
    baseReward: 1200,
    basePenalty: 3500,
    uptimePenalty: 30,
    reputationPenalty: 25
  },
  {
    type: 'security',
    severity: 'high',
    title: '비밀번호 정책 강화',
    description: '취약한 비밀번호로 인한 계정 탈취가 발생했습니다.',
    baseTimeLimit: 200,
    baseReward: 400,
    basePenalty: 600,
    uptimePenalty: 5,
    reputationPenalty: 10
  },
  {
    type: 'security',
    severity: 'medium',
    title: 'API 레이트 리밋 필요',
    description: 'API 남용을 방지하기 위한 레이트 리밋이 필요합니다.',
    baseTimeLimit: 350,
    baseReward: 200,
    basePenalty: 250,
    uptimePenalty: 2,
    reputationPenalty: 3
  },
  {
    type: 'security',
    severity: 'low',
    title: '보안 헤더 추가',
    description: 'HTTP 보안 헤더 설정이 누락되어 있습니다.',
    baseTimeLimit: 500,
    baseReward: 80,
    basePenalty: 50,
    uptimePenalty: 0,
    reputationPenalty: 1
  },

  // Performance tickets
  {
    type: 'performance',
    severity: 'critical',
    title: '메모리 누수 발생',
    description: '서버 메모리 사용량이 지속적으로 증가하고 있습니다.',
    baseTimeLimit: 100,
    baseReward: 600,
    basePenalty: 1500,
    uptimePenalty: 20,
    reputationPenalty: 10
  },
  {
    type: 'performance',
    severity: 'high',
    title: '페이지 로딩 5초 초과',
    description: '메인 페이지 로딩 시간이 5초를 넘어가고 있습니다.',
    baseTimeLimit: 250,
    baseReward: 350,
    basePenalty: 450,
    uptimePenalty: 5,
    reputationPenalty: 8
  },
  {
    type: 'performance',
    severity: 'high',
    title: 'DB 쿼리 최적화 필요',
    description: '느린 쿼리로 인해 응답 시간이 지연되고 있습니다.',
    baseTimeLimit: 300,
    baseReward: 400,
    basePenalty: 500,
    uptimePenalty: 8,
    reputationPenalty: 5
  },
  {
    type: 'performance',
    severity: 'medium',
    title: '이미지 최적화',
    description: '이미지 파일 크기로 인해 로딩이 느려지고 있습니다.',
    baseTimeLimit: 400,
    baseReward: 150,
    basePenalty: 150,
    uptimePenalty: 2,
    reputationPenalty: 2
  },
  {
    type: 'performance',
    severity: 'low',
    title: '캐싱 개선',
    description: '자주 요청되는 데이터에 대한 캐싱이 필요합니다.',
    baseTimeLimit: 550,
    baseReward: 100,
    basePenalty: 80,
    uptimePenalty: 1,
    reputationPenalty: 1
  }
];

export const generateTicket = (
  techDebt: number,
  day: number,
  phase: string
): Ticket => {
  // Higher tech debt = higher chance of severe tickets
  const severityWeights = {
    critical: Math.min(0.05 + (techDebt / 200), 0.25),
    high: Math.min(0.15 + (techDebt / 300), 0.35),
    medium: 0.4,
    low: 0.4 - Math.min(techDebt / 200, 0.2)
  };

  // Type weights based on phase
  const typeWeights: Record<string, Record<TicketType, number>> = {
    web: { bug: 0.4, feature: 0.25, security: 0.2, performance: 0.15 },
    mobile: { bug: 0.35, feature: 0.2, security: 0.15, performance: 0.3 },
    app: { bug: 0.3, feature: 0.25, security: 0.25, performance: 0.2 }
  };

  const weights = typeWeights[phase] || typeWeights.web;

  // Select type
  const typeRand = Math.random();
  let selectedType: TicketType = 'bug';
  let cumulative = 0;
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (typeRand < cumulative) {
      selectedType = type as TicketType;
      break;
    }
  }

  // Select severity
  const sevRand = Math.random();
  let selectedSeverity: TicketSeverity = 'medium';
  cumulative = 0;
  for (const [sev, weight] of Object.entries(severityWeights)) {
    cumulative += weight;
    if (sevRand < cumulative) {
      selectedSeverity = sev as TicketSeverity;
      break;
    }
  }

  // Find matching templates
  const matchingTemplates = ticketTemplates.filter(
    t => t.type === selectedType && t.severity === selectedSeverity
  );

  if (matchingTemplates.length === 0) {
    // Fallback to any template of the same type
    const fallbackTemplates = ticketTemplates.filter(t => t.type === selectedType);
    const template = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
    return createTicketFromTemplate(template, day);
  }

  const template = matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
  return createTicketFromTemplate(template, day);
};

const createTicketFromTemplate = (template: TicketTemplate, day: number): Ticket => {
  // Scale difficulty with game progress
  const difficultyMultiplier = 1 + (day / 100);

  return {
    id: uuidv4(),
    type: template.type,
    severity: template.severity,
    title: template.title,
    description: template.description,
    timeLimit: Math.floor(template.baseTimeLimit / difficultyMultiplier),
    maxTime: Math.floor(template.baseTimeLimit / difficultyMultiplier),
    reward: Math.floor(template.baseReward * difficultyMultiplier),
    penalty: Math.floor(template.basePenalty * difficultyMultiplier),
    uptimePenalty: template.uptimePenalty,
    reputationPenalty: template.reputationPenalty
  };
};

export const getSeverityColor = (severity: TicketSeverity): string => {
  switch (severity) {
    case 'critical': return 'text-danger-400';
    case 'high': return 'text-warning-400';
    case 'medium': return 'text-primary-400';
    case 'low': return 'text-success-400';
  }
};

export const getSeverityBadge = (severity: TicketSeverity): string => {
  switch (severity) {
    case 'critical': return 'badge-danger';
    case 'high': return 'badge-warning';
    case 'medium': return 'badge-info';
    case 'low': return 'badge-success';
  }
};

export const getTypeIcon = (type: TicketType): string => {
  switch (type) {
    case 'bug': return '🐛';
    case 'feature': return '✨';
    case 'security': return '🔒';
    case 'performance': return '⚡';
  }
};
