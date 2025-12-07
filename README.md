# 🎮 Uptime - 웹사이트 운영 시뮬레이션 게임

웹사이트/앱을 구축하고 운영하는 시뮬레이션 게임입니다. 플레이어는 작은 웹 프로젝트에서 시작해 대규모 앱 서비스까지 성장시키며, 실제 개발/운영에서 겪는 문제들을 해결해 나갑니다.

## ✨ 주요 기능

- 🌐 **Phase 진행 시스템**: Web → Mobile Web → Native App 순차적 성장
- ⚡ **실시간 이슈 대응**: 랜덤 버그, 보안 이슈, 기능 요청 처리
- 👥 **팀 빌딩**: 개발자, 디자이너, 마케터 고용 및 관리
- 📈 **업타임 관리**: 99.9% 가동률 목표 달성
- 💰 **수익화**: 유료 구독 플랜 (Free, Starter, Pro, Enterprise)
- 📱 **PWA 지원**: 모바일 앱처럼 설치 가능

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Build**: Vite
- **PWA**: vite-plugin-pwa

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── game/           # 게임 관련 컴포넌트
│   │   ├── Dashboard.tsx
│   │   ├── UptimeGauge.tsx
│   │   ├── TicketQueue.tsx
│   │   ├── ResourcePanel.tsx
│   │   ├── EventModal.tsx
│   │   ├── PhaseProgress.tsx
│   │   ├── TeamManagement.tsx
│   │   └── UpgradeShop.tsx
│   └── ui/             # 공통 UI 컴포넌트
├── store/
│   ├── gameStore.ts    # 게임 상태 관리
│   └── authStore.ts    # 인증 상태 관리
├── data/
│   ├── events.ts       # 랜덤 이벤트 정의
│   ├── tickets.ts      # 이슈 티켓 종류
│   ├── upgrades.ts     # 업그레이드 목록
│   └── achievements.ts # 업적 시스템
├── hooks/
│   └── useGameLoop.ts  # 게임 틱 로직
├── pages/
│   ├── AuthPage.tsx    # 로그인/회원가입
│   └── PricingPage.tsx # 구독 플랜
├── types/
│   └── index.ts        # TypeScript 타입 정의
└── utils/
    └── helpers.ts      # 유틸리티 함수
```

## 🎯 게임 목표

- 30일 이상 서비스 유지
- Phase 3 (Native App) 달성
- 업타임 99.9% 이상 유지
- 사용자 10,000명 이상 달성

## 💎 구독 플랜

| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| Free | 무료 | 기본 게임플레이, 1개 저장 슬롯 |
| Starter | $4.99/월 | 광고 제거, 3개 저장 슬롯, 1.5x 속도 |
| Pro | $9.99/월 | 무제한 저장, 2x 속도, 프리미엄 이벤트 |
| Enterprise | $29.99/월 | 3x 속도, 팀 기능, API 접근 |

## 📄 라이선스

MIT License

## 🙏 기여

Pull Request와 Issue는 언제나 환영합니다!
