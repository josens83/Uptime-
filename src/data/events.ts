import { GameEvent } from '../types';

export const events: GameEvent[] = [
  // Early game events (Web phase)
  {
    id: 'traffic_spike',
    title: '🚀 트래픽 폭증!',
    description: '유명 인플루언서가 서비스를 소개했습니다. 트래픽이 10배 증가!',
    choices: [
      { text: '서버 긴급 증설 ($500)', effect: { money: -500, users: 1000, reputation: 5 } },
      { text: '그냥 버티기', effect: { uptime: -20, reputation: -10 } }
    ],
    icon: '🚀'
  },
  {
    id: 'security_breach',
    title: '🔓 보안 취약점 발견',
    description: '해커가 SQL 인젝션 취약점을 발견했습니다. 빠른 대응이 필요합니다.',
    choices: [
      { text: '즉시 패치 (기술부채 +10)', effect: { techDebt: 10 } },
      { text: '전문가 고용 ($300)', effect: { money: -300, reputation: 5 } },
      { text: '🔒 보안팀 긴급 투입 (Pro)', effect: { money: -100, reputation: 10 }, premium: true }
    ],
    icon: '🔓'
  },
  {
    id: 'bug_report_viral',
    title: '🐛 버그가 SNS에서 화제!',
    description: '사용자가 발견한 재미있는 버그가 바이럴되었습니다.',
    choices: [
      { text: '빠르게 수정 ($100)', effect: { money: -100, reputation: 5 } },
      { text: '이스터에그로 남기기', effect: { users: 200, techDebt: 5 } },
      { text: '굿즈로 만들어 판매', effect: { money: 300, reputation: 10 } }
    ],
    icon: '🐛'
  },
  {
    id: 'server_down',
    title: '💥 서버 다운!',
    description: 'AWS 리전에서 장애가 발생했습니다!',
    choices: [
      { text: '다른 리전으로 긴급 이전 ($800)', effect: { money: -800, uptime: -5 } },
      { text: '복구까지 대기', effect: { uptime: -30, users: -500, reputation: -15 } }
    ],
    icon: '💥'
  },
  {
    id: 'investor_interest',
    title: '💰 투자자 미팅 요청',
    description: '스타트업 투자자가 서비스에 관심을 보이고 있습니다.',
    choices: [
      { text: '미팅 참석 (1일 소요)', effect: { day: 1, money: 5000, reputation: 10 } },
      { text: '거절하고 개발에 집중', effect: { techDebt: -5 } }
    ],
    icon: '💰',
    minDay: 10
  },
  {
    id: 'competition_launch',
    title: '⚔️ 경쟁사 등장!',
    description: '비슷한 서비스가 런칭되어 사용자들이 이탈하고 있습니다.',
    choices: [
      { text: '마케팅 강화 ($600)', effect: { money: -600, users: 300, reputation: 5 } },
      { text: '차별화 기능 개발', effect: { techDebt: 15, users: 500 } },
      { text: '🎯 타겟 마케팅 캠페인 (Pro)', effect: { money: -300, users: 800, reputation: 10 }, premium: true }
    ],
    icon: '⚔️',
    minDay: 15
  },
  {
    id: 'feature_request_trending',
    title: '📣 기능 요청 폭주!',
    description: '사용자들이 특정 기능을 강력히 요청하고 있습니다.',
    choices: [
      { text: '즉시 구현 (기술부채 +20)', effect: { techDebt: 20, users: 400, reputation: 15 } },
      { text: '로드맵에 추가 (2일 후)', effect: { day: 2, reputation: 5 } },
      { text: '커뮤니티 투표로 결정', effect: { reputation: 10 } }
    ],
    icon: '📣'
  },
  {
    id: 'ddos_attack',
    title: '🛡️ DDoS 공격 감지!',
    description: '서비스가 대규모 DDoS 공격을 받고 있습니다.',
    choices: [
      { text: 'CloudFlare 긴급 적용 ($400)', effect: { money: -400, uptime: -5 } },
      { text: '방어 시도', effect: { uptime: -40, techDebt: 10 } },
      { text: '🛡️ 전용 보안팀 대응 (Pro)', effect: { money: -200, reputation: 5 }, premium: true }
    ],
    icon: '🛡️'
  },
  {
    id: 'media_coverage',
    title: '📺 언론 보도!',
    description: '테크 매체에서 서비스를 소개하고 싶다고 연락왔습니다.',
    choices: [
      { text: '인터뷰 수락', effect: { users: 800, reputation: 20 } },
      { text: '나중에 연락하겠다고 회신', effect: { reputation: -5 } }
    ],
    icon: '📺',
    minDay: 20
  },
  {
    id: 'tech_debt_crisis',
    title: '⚠️ 기술 부채 위기!',
    description: '누적된 기술 부채로 시스템이 불안정해지고 있습니다.',
    choices: [
      { text: '대규모 리팩토링 (3일)', effect: { day: 3, techDebt: -30 } },
      { text: '핫픽스로 버티기', effect: { techDebt: 5, uptime: -10 } },
      { text: '📊 코드 분석 도구 도입 (Pro)', effect: { money: -500, techDebt: -40 }, premium: true }
    ],
    icon: '⚠️'
  },

  // Mobile phase events
  {
    id: 'pwa_performance',
    title: '📱 PWA 성능 이슈',
    description: '모바일에서 로딩이 느리다는 리뷰가 올라오고 있습니다.',
    choices: [
      { text: '최적화 작업 ($300)', effect: { money: -300, techDebt: -10, reputation: 10 } },
      { text: '무시하기', effect: { reputation: -15, users: -200 } }
    ],
    icon: '📱',
    phase: 'mobile'
  },
  {
    id: 'mobile_bug',
    title: '📲 모바일 전용 버그',
    description: 'iOS Safari에서만 발생하는 버그가 보고되었습니다.',
    choices: [
      { text: 'Safari 전문가 고용 ($500)', effect: { money: -500, reputation: 10 } },
      { text: '내부적으로 해결', effect: { techDebt: 10, day: 2 } }
    ],
    icon: '📲',
    phase: 'mobile'
  },
  {
    id: 'push_notification',
    title: '🔔 푸시 알림 전략',
    description: '푸시 알림 기능을 어떻게 활용할지 결정해야 합니다.',
    choices: [
      { text: '적극적 알림 전략', effect: { users: 300, reputation: -5 } },
      { text: '보수적 알림 전략', effect: { users: 100, reputation: 10 } },
      { text: '🎯 AI 개인화 알림 (Pro)', effect: { users: 500, reputation: 15, money: -200 }, premium: true }
    ],
    icon: '🔔',
    phase: 'mobile'
  },

  // App phase events
  {
    id: 'app_rejection',
    title: '❌ 앱스토어 리젝!',
    description: '애플이 앱을 거부했습니다: "메타데이터 가이드라인 위반"',
    choices: [
      { text: '가이드라인 연구 후 재제출 (3일)', effect: { day: 3 } },
      { text: '변호사 상담 ($1000)', effect: { money: -1000, day: 1 } },
      { text: '📋 앱스토어 컨설턴트 (Pro)', effect: { money: -500, reputation: 5 }, premium: true }
    ],
    icon: '❌',
    phase: 'app'
  },
  {
    id: 'app_featured',
    title: '🌟 앱스토어 피처드!',
    description: '앱스토어 에디터가 앱을 피처드하고 싶어합니다!',
    choices: [
      { text: '수락하기', effect: { users: 5000, reputation: 30 } }
    ],
    icon: '🌟',
    phase: 'app',
    minDay: 50
  },
  {
    id: 'native_crash',
    title: '💢 네이티브 크래시 급증',
    description: '최신 OS 업데이트 후 크래시가 급증하고 있습니다.',
    choices: [
      { text: '긴급 패치 배포 ($400)', effect: { money: -400, uptime: -5 } },
      { text: 'OS 롤백 권장 공지', effect: { reputation: -20 } },
      { text: '🔧 크래시 분석 도구 도입 (Pro)', effect: { money: -300, techDebt: -15 }, premium: true }
    ],
    icon: '💢',
    phase: 'app'
  },
  {
    id: 'in_app_purchase',
    title: '💎 인앱결제 수익화',
    description: '인앱결제 전략을 수립해야 합니다.',
    choices: [
      { text: '공격적 수익화', effect: { money: 2000, reputation: -15, users: -300 } },
      { text: '균형잡힌 수익화', effect: { money: 1000, reputation: 5 } },
      { text: '사용자 중심 수익화', effect: { money: 500, reputation: 15, users: 200 } }
    ],
    icon: '💎',
    phase: 'app',
    minDay: 40
  },
  {
    id: 'google_play_policy',
    title: '📋 Google Play 정책 변경',
    description: '새로운 정책으로 앱 수정이 필요합니다.',
    choices: [
      { text: '즉시 대응 ($200)', effect: { money: -200, day: 1 } },
      { text: '마감 직전에 대응', effect: { techDebt: 10, day: 3 } }
    ],
    icon: '📋',
    phase: 'app'
  },
  {
    id: 'cross_platform',
    title: '🔄 크로스 플랫폼 요청',
    description: '사용자들이 다른 플랫폼 지원을 요청하고 있습니다.',
    choices: [
      { text: 'Flutter로 전환 ($2000)', effect: { money: -2000, day: 5, users: 1000 } },
      { text: 'React Native 도입 ($1500)', effect: { money: -1500, day: 4, techDebt: 10 } },
      { text: '현재 스택 유지', effect: { reputation: -10 } }
    ],
    icon: '🔄',
    phase: 'app',
    minDay: 45
  },

  // Random positive events
  {
    id: 'viral_growth',
    title: '🎉 자연 바이럴!',
    description: '서비스가 자연스럽게 입소문을 타고 있습니다!',
    choices: [
      { text: '축하하기! 🎊', effect: { users: 500, reputation: 10 } }
    ],
    icon: '🎉'
  },
  {
    id: 'positive_review',
    title: '⭐ 호평 쏟아져!',
    description: '사용자들의 긍정적인 리뷰가 쏟아지고 있습니다.',
    choices: [
      { text: '감사 이벤트 진행 ($200)', effect: { money: -200, users: 300, reputation: 15 } },
      { text: '소셜 미디어에 공유', effect: { reputation: 10 } }
    ],
    icon: '⭐'
  },
  {
    id: 'lucky_bug_fix',
    title: '🍀 우연한 버그 픽스',
    description: '다른 작업 중 오래된 버그를 발견하고 수정했습니다!',
    choices: [
      { text: '좋았어!', effect: { techDebt: -5, reputation: 5 } }
    ],
    icon: '🍀'
  },
  {
    id: 'team_morale',
    title: '💪 팀 사기 UP!',
    description: '팀원들의 사기가 높아져 생산성이 향상되었습니다.',
    choices: [
      { text: '팀 회식 ($300)', effect: { money: -300, techDebt: -10 } },
      { text: '성과급 지급 ($500)', effect: { money: -500, reputation: 5 } },
      { text: '그냥 격려만', effect: { techDebt: -5 } }
    ],
    icon: '💪',
    minDay: 15
  },

  // Challenging events
  {
    id: 'key_employee_leave',
    title: '👋 핵심 인력 이탈',
    description: '중요한 개발자가 퇴사하겠다고 합니다.',
    choices: [
      { text: '연봉 인상 제안 ($800)', effect: { money: -800, reputation: 5 } },
      { text: '떠나게 두기', effect: { techDebt: 20, reputation: -10 } },
      { text: '🎁 스톡옵션 제안 (Pro)', effect: { money: -300, reputation: 10 }, premium: true }
    ],
    icon: '👋',
    minDay: 20
  },
  {
    id: 'legal_issue',
    title: '⚖️ 법적 문제',
    description: '경쟁사가 특허 침해로 소송을 제기했습니다.',
    choices: [
      { text: '변호사 선임 ($2000)', effect: { money: -2000, day: 5 } },
      { text: '합의 시도 ($3000)', effect: { money: -3000, reputation: -5 } },
      { text: '⚖️ 법률팀 구성 (Pro)', effect: { money: -1500, reputation: 10 }, premium: true }
    ],
    icon: '⚖️',
    minDay: 30
  },
  {
    id: 'data_loss',
    title: '💾 데이터 손실 위기!',
    description: '백업 시스템에 문제가 발견되었습니다.',
    choices: [
      { text: '긴급 백업 시스템 구축 ($1000)', effect: { money: -1000 } },
      { text: '기존 시스템 수리', effect: { techDebt: 15, uptime: -10 } },
      { text: '💾 클라우드 백업 서비스 (Pro)', effect: { money: -500, reputation: 5 }, premium: true }
    ],
    icon: '💾'
  }
];

export const getRandomEvent = (phase: string, day: number, isPremium: boolean): GameEvent | null => {
  const eligibleEvents = events.filter(event => {
    // Phase check
    if (event.phase && event.phase !== phase) return false;
    // Day check
    if (event.minDay && day < event.minDay) return false;
    return true;
  });

  if (eligibleEvents.length === 0) return null;

  const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];

  // Filter premium choices if user is not premium
  if (!isPremium) {
    return {
      ...event,
      choices: event.choices.filter(choice => !choice.premium)
    };
  }

  return event;
};
