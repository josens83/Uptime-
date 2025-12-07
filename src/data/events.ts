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
  },

  // Additional events - Community
  {
    id: 'community_feedback',
    title: '💬 커뮤니티 피드백 세션',
    description: '사용자들이 직접 피드백을 주고 싶어합니다.',
    choices: [
      { text: 'AMA 세션 개최', effect: { users: 300, reputation: 20, day: 1 } },
      { text: '설문조사 진행', effect: { reputation: 10, techDebt: -5 } },
      { text: '무시하고 개발 집중', effect: { reputation: -10 } }
    ],
    icon: '💬',
    minDay: 10
  },
  {
    id: 'open_source_contribution',
    title: '🌐 오픈소스 기여 요청',
    description: '개발자 커뮤니티에서 핵심 기능의 오픈소스화를 요청합니다.',
    choices: [
      { text: '일부 기능 오픈소스화', effect: { reputation: 30, users: 500, techDebt: -10 } },
      { text: '거절', effect: { reputation: -5 } },
      { text: '🔓 전체 오픈소스화 (Pro)', effect: { reputation: 50, users: 1000 }, premium: true }
    ],
    icon: '🌐',
    minDay: 25
  },
  {
    id: 'hackathon_winner',
    title: '🏆 해커톤 우승팀 합류',
    description: '해커톤 우승팀이 서비스에 관심을 보이고 있습니다.',
    choices: [
      { text: '팀 영입 ($1500)', effect: { money: -1500, techDebt: -20, reputation: 15 } },
      { text: '파트너십 제안', effect: { users: 300, reputation: 10 } },
      { text: '관심 없음', effect: {} }
    ],
    icon: '🏆',
    minDay: 20
  },

  // Additional events - Technical
  {
    id: 'database_migration',
    title: '🗄️ 데이터베이스 마이그레이션',
    description: '성능 향상을 위해 데이터베이스 전환을 고려해야 합니다.',
    choices: [
      { text: 'PostgreSQL로 전환 ($600)', effect: { money: -600, techDebt: -15, day: 2 } },
      { text: 'MongoDB로 전환 ($500)', effect: { money: -500, techDebt: -10, day: 1 } },
      { text: '현재 DB 최적화 ($200)', effect: { money: -200, techDebt: -5 } }
    ],
    icon: '🗄️',
    minDay: 15
  },
  {
    id: 'api_rate_limit',
    title: '⏱️ API 사용량 폭증',
    description: '서드파티 API 사용량이 한도를 초과했습니다.',
    choices: [
      { text: '플랜 업그레이드 ($400/월)', effect: { money: -400 } },
      { text: '자체 솔루션 개발', effect: { techDebt: 20, day: 3 } },
      { text: '🔄 캐싱 레이어 도입 (Pro)', effect: { money: -200, techDebt: -5 }, premium: true }
    ],
    icon: '⏱️'
  },
  {
    id: 'ssl_expiry',
    title: '🔐 SSL 인증서 만료 임박',
    description: 'SSL 인증서가 곧 만료됩니다!',
    choices: [
      { text: '즉시 갱신 ($100)', effect: { money: -100 } },
      { text: "Let's Encrypt로 전환 (무료)", effect: { techDebt: 5 } },
      { text: '와일드카드 인증서 구매 ($300)', effect: { money: -300, reputation: 5 } }
    ],
    icon: '🔐'
  },
  {
    id: 'performance_audit',
    title: '📊 성능 감사 결과',
    description: '성능 감사 결과 여러 개선점이 발견되었습니다.',
    choices: [
      { text: '전체 최적화 착수', effect: { techDebt: -25, day: 3, money: -500 } },
      { text: '핵심 이슈만 해결', effect: { techDebt: -10, day: 1 } },
      { text: '📈 성능 모니터링 도입 (Pro)', effect: { money: -300, techDebt: -15 }, premium: true }
    ],
    icon: '📊',
    minDay: 12
  },

  // Additional events - Business
  {
    id: 'enterprise_client',
    title: '🏢 대기업 고객 문의',
    description: '대기업에서 엔터프라이즈 플랜에 관심을 보입니다.',
    choices: [
      { text: '맞춤 솔루션 제안', effect: { money: 5000, reputation: 20, day: 2 } },
      { text: '표준 플랜 안내', effect: { money: 2000, reputation: 5 } },
      { text: '아직 준비되지 않음', effect: { reputation: -5 } }
    ],
    icon: '🏢',
    minDay: 30
  },
  {
    id: 'partnership_offer',
    title: '🤝 파트너십 제안',
    description: '관련 분야 기업에서 파트너십을 제안했습니다.',
    choices: [
      { text: '적극적 파트너십', effect: { money: 1000, users: 800, reputation: 15 } },
      { text: '제한적 협력', effect: { money: 500, users: 300, reputation: 5 } },
      { text: '독립 유지', effect: { reputation: 5 } }
    ],
    icon: '🤝',
    minDay: 25
  },
  {
    id: 'conference_invitation',
    title: '🎤 컨퍼런스 발표 초청',
    description: '유명 테크 컨퍼런스에서 발표를 요청했습니다.',
    choices: [
      { text: '발표 수락', effect: { reputation: 30, users: 500, day: 1 } },
      { text: '온라인 참여로 대체', effect: { reputation: 15, users: 200 } },
      { text: '다음 기회에', effect: {} }
    ],
    icon: '🎤',
    minDay: 20
  },
  {
    id: 'acquisition_offer',
    title: '💼 인수 제안',
    description: '대기업에서 서비스 인수 의사를 밝혔습니다.',
    choices: [
      { text: '거절하고 독립 유지', effect: { reputation: 20 } },
      { text: '협상 테이블에 앉기', effect: { money: 10000, day: 5 } },
      { text: '🏆 전략적 투자 유치 (Pro)', effect: { money: 20000, reputation: 30 }, premium: true }
    ],
    icon: '💼',
    minDay: 60,
    phase: 'app'
  },

  // Additional events - Team
  {
    id: 'remote_work_policy',
    title: '🏠 리모트 워크 정책',
    description: '팀에서 재택근무 정책 변경을 요청합니다.',
    choices: [
      { text: '완전 재택 허용', effect: { techDebt: -5, reputation: 10 } },
      { text: '하이브리드 도입', effect: { reputation: 5, money: -200 } },
      { text: '오피스 근무 유지', effect: { reputation: -5, techDebt: 5 } }
    ],
    icon: '🏠',
    minDay: 15
  },
  {
    id: 'talent_hunt',
    title: '🔍 인재 채용 기회',
    description: '뛰어난 개발자가 지원했습니다.',
    choices: [
      { text: '경쟁력 있는 연봉 제시 ($1000)', effect: { money: -1000, techDebt: -15 } },
      { text: '스톡옵션과 함께 제안', effect: { money: -500, techDebt: -10 } },
      { text: '현재는 채용 불가', effect: {} }
    ],
    icon: '🔍',
    minDay: 10
  },
  {
    id: 'team_burnout',
    title: '😰 팀 번아웃 징후',
    description: '팀원들이 지쳐보입니다.',
    choices: [
      { text: '강제 휴가 부여 (3일)', effect: { day: 3, techDebt: -10, reputation: 10 } },
      { text: '워크로드 조정', effect: { techDebt: 5, reputation: 5 } },
      { text: '그냥 밀어붙이기', effect: { techDebt: 20, reputation: -15 } }
    ],
    icon: '😰',
    minDay: 30
  },

  // Additional events - Marketing
  {
    id: 'viral_tiktok',
    title: '🎵 TikTok 바이럴',
    description: '서비스 관련 영상이 TikTok에서 화제입니다!',
    choices: [
      { text: '공식 계정 개설 ($300)', effect: { money: -300, users: 1500, reputation: 20 } },
      { text: '크리에이터와 협업', effect: { money: -500, users: 2000, reputation: 25 } },
      { text: '자연스러운 성장 지켜보기', effect: { users: 500, reputation: 10 } }
    ],
    icon: '🎵'
  },
  {
    id: 'influencer_review',
    title: '📹 인플루언서 리뷰',
    description: '유명 테크 인플루언서가 리뷰를 올렸습니다!',
    choices: [
      { text: '긍정적 리뷰였다!', effect: { users: 1000, reputation: 25 } },
      { text: '개선점 언급', effect: { users: 300, reputation: 5, techDebt: -5 } }
    ],
    icon: '📹',
    minDay: 20
  },
  {
    id: 'product_hunt_launch',
    title: '🚀 Product Hunt 런칭',
    description: 'Product Hunt에 런칭할 기회입니다!',
    choices: [
      { text: '대대적 런칭', effect: { money: -200, users: 2000, reputation: 30, day: 1 } },
      { text: '소규모 테스트 런칭', effect: { users: 500, reputation: 10 } },
      { text: '나중에 런칭', effect: {} }
    ],
    icon: '🚀',
    minDay: 15
  },

  // Special rare events
  {
    id: 'lucky_break',
    title: '🌈 대박 기회!',
    description: '유명 기업에서 서비스를 내부 도구로 채택하고 싶어합니다!',
    choices: [
      { text: '계약 체결!', effect: { money: 15000, users: 5000, reputation: 50 } }
    ],
    icon: '🌈',
    minDay: 40
  },
  {
    id: 'disaster_recovery',
    title: '🆘 대규모 장애',
    description: '여러 시스템에서 동시에 장애가 발생했습니다!',
    choices: [
      { text: '올인 복구 모드 ($2000)', effect: { money: -2000, uptime: -20, day: 1 } },
      { text: '우선순위별 복구', effect: { uptime: -35, users: -500, reputation: -20 } },
      { text: '🛡️ DR 플랜 가동 (Pro)', effect: { money: -1000, uptime: -10 }, premium: true }
    ],
    icon: '🆘',
    minDay: 25
  },
  {
    id: 'zero_day_exploit',
    title: '🚨 제로데이 취약점!',
    description: '사용 중인 라이브러리에서 제로데이 취약점이 발견되었습니다!',
    choices: [
      { text: '즉시 패치 (긴급 대응)', effect: { techDebt: 10, uptime: -5 } },
      { text: '대체 라이브러리로 전환 ($500)', effect: { money: -500, day: 2, techDebt: -5 } },
      { text: '🔒 보안팀 긴급 가동 (Pro)', effect: { money: -300, reputation: 10 }, premium: true }
    ],
    icon: '🚨'
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
