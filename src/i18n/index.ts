import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ko' | 'en' | 'ja';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    start: string;
    pause: string;
    resume: string;
    settings: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    username: string;
    forgotPassword: string;
    loginWithGoogle: string;
    loginWithGithub: string;
    guestPlay: string;
    noAccount: string;
    hasAccount: string;
  };
  game: {
    uptime: string;
    money: string;
    users: string;
    reputation: string;
    techDebt: string;
    day: string;
    phase: string;
    tickets: string;
    team: string;
    upgrades: string;
    events: string;
    achievements: string;
    leaderboard: string;
    gameOver: string;
    newGame: string;
    continueGame: string;
  };
  phases: {
    web: string;
    mobile: string;
    app: string;
  };
  tickets: {
    bug: string;
    feature: string;
    security: string;
    performance: string;
    low: string;
    medium: string;
    high: string;
    critical: string;
    resolve: string;
    timeLeft: string;
  };
  subscription: {
    free: string;
    starter: string;
    pro: string;
    enterprise: string;
    subscribe: string;
    currentPlan: string;
    monthly: string;
    yearly: string;
  };
}

const translations: Record<Language, Translations> = {
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '수정',
      close: '닫기',
      back: '뒤로',
      next: '다음',
      start: '시작',
      pause: '일시정지',
      resume: '계속하기',
      settings: '설정'
    },
    auth: {
      login: '로그인',
      register: '회원가입',
      logout: '로그아웃',
      email: '이메일',
      password: '비밀번호',
      username: '닉네임',
      forgotPassword: '비밀번호를 잊으셨나요?',
      loginWithGoogle: 'Google로 계속하기',
      loginWithGithub: 'GitHub로 계속하기',
      guestPlay: '게스트로 플레이하기',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?'
    },
    game: {
      uptime: '업타임',
      money: '자금',
      users: '사용자',
      reputation: '평판',
      techDebt: '기술부채',
      day: '일차',
      phase: '단계',
      tickets: '티켓',
      team: '팀',
      upgrades: '업그레이드',
      events: '이벤트',
      achievements: '업적',
      leaderboard: '리더보드',
      gameOver: '게임 오버',
      newGame: '새 게임',
      continueGame: '이어하기'
    },
    phases: {
      web: '웹',
      mobile: '모바일',
      app: '앱'
    },
    tickets: {
      bug: '버그',
      feature: '기능 요청',
      security: '보안',
      performance: '성능',
      low: '낮음',
      medium: '보통',
      high: '높음',
      critical: '긴급',
      resolve: '해결',
      timeLeft: '남은 시간'
    },
    subscription: {
      free: '무료',
      starter: '스타터',
      pro: '프로',
      enterprise: '엔터프라이즈',
      subscribe: '구독하기',
      currentPlan: '현재 플랜',
      monthly: '월간',
      yearly: '연간'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      settings: 'Settings'
    },
    auth: {
      login: 'Login',
      register: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      forgotPassword: 'Forgot password?',
      loginWithGoogle: 'Continue with Google',
      loginWithGithub: 'Continue with GitHub',
      guestPlay: 'Play as Guest',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?'
    },
    game: {
      uptime: 'Uptime',
      money: 'Money',
      users: 'Users',
      reputation: 'Reputation',
      techDebt: 'Tech Debt',
      day: 'Day',
      phase: 'Phase',
      tickets: 'Tickets',
      team: 'Team',
      upgrades: 'Upgrades',
      events: 'Events',
      achievements: 'Achievements',
      leaderboard: 'Leaderboard',
      gameOver: 'Game Over',
      newGame: 'New Game',
      continueGame: 'Continue'
    },
    phases: {
      web: 'Web',
      mobile: 'Mobile',
      app: 'App'
    },
    tickets: {
      bug: 'Bug',
      feature: 'Feature Request',
      security: 'Security',
      performance: 'Performance',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      resolve: 'Resolve',
      timeLeft: 'Time Left'
    },
    subscription: {
      free: 'Free',
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
      subscribe: 'Subscribe',
      currentPlan: 'Current Plan',
      monthly: 'Monthly',
      yearly: 'Yearly'
    }
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      close: '閉じる',
      back: '戻る',
      next: '次へ',
      start: '開始',
      pause: '一時停止',
      resume: '再開',
      settings: '設定'
    },
    auth: {
      login: 'ログイン',
      register: '新規登録',
      logout: 'ログアウト',
      email: 'メールアドレス',
      password: 'パスワード',
      username: 'ユーザー名',
      forgotPassword: 'パスワードをお忘れですか?',
      loginWithGoogle: 'Googleでログイン',
      loginWithGithub: 'GitHubでログイン',
      guestPlay: 'ゲストでプレイ',
      noAccount: 'アカウントをお持ちでないですか?',
      hasAccount: '既にアカウントをお持ちですか?'
    },
    game: {
      uptime: '稼働率',
      money: '資金',
      users: 'ユーザー',
      reputation: '評判',
      techDebt: '技術的負債',
      day: '日目',
      phase: 'フェーズ',
      tickets: 'チケット',
      team: 'チーム',
      upgrades: 'アップグレード',
      events: 'イベント',
      achievements: '実績',
      leaderboard: 'ランキング',
      gameOver: 'ゲームオーバー',
      newGame: '新規ゲーム',
      continueGame: '続ける'
    },
    phases: {
      web: 'ウェブ',
      mobile: 'モバイル',
      app: 'アプリ'
    },
    tickets: {
      bug: 'バグ',
      feature: '機能リクエスト',
      security: 'セキュリティ',
      performance: 'パフォーマンス',
      low: '低',
      medium: '中',
      high: '高',
      critical: '緊急',
      resolve: '解決',
      timeLeft: '残り時間'
    },
    subscription: {
      free: '無料',
      starter: 'スターター',
      pro: 'プロ',
      enterprise: 'エンタープライズ',
      subscribe: '購読する',
      currentPlan: '現在のプラン',
      monthly: '月額',
      yearly: '年額'
    }
  }
};

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: 'ko',
      t: translations.ko,
      setLanguage: (lang) => {
        set({ language: lang, t: translations[lang] });
      }
    }),
    {
      name: 'uptime-language',
      partialize: (state) => ({ language: state.language })
    }
  )
);

// Initialize with saved language
const savedLang = localStorage.getItem('uptime-language');
if (savedLang) {
  try {
    const parsed = JSON.parse(savedLang);
    if (parsed.state?.language && translations[parsed.state.language as Language]) {
      useI18n.setState({
        language: parsed.state.language,
        t: translations[parsed.state.language as Language]
      });
    }
  } catch {
    // Use default
  }
}

// Language info
export const languageInfo: Record<Language, { name: string; flag: string }> = {
  ko: { name: '한국어', flag: '🇰🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  ja: { name: '日本語', flag: '🇯🇵' }
};

// Helper to get translation
export const t = () => useI18n.getState().t;
