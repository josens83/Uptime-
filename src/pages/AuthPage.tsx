import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button, Card } from '../components/ui';
import { cn, isValidEmail } from '../utils/helpers';

interface AuthPageProps {
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState(false);

  const {
    login,
    loginWithGoogle,
    loginWithGithub,
    register,
    resetPassword,
    isLoading,
    error,
    clearError
  } = useAuthStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!isValidEmail(email)) {
      newErrors.email = '유효한 이메일을 입력해주세요';
    }

    if (mode !== 'reset') {
      if (!password) {
        newErrors.password = '비밀번호를 입력해주세요';
      } else if (password.length < 6) {
        newErrors.password = '비밀번호는 6자 이상이어야 합니다';
      }
    }

    if (mode === 'register' && !displayName) {
      newErrors.displayName = '닉네임을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    let success = false;

    if (mode === 'login') {
      success = await login(email, password);
    } else if (mode === 'register') {
      success = await register(email, password, displayName);
    } else if (mode === 'reset') {
      success = await resetPassword(email);
      if (success) {
        setResetSent(true);
        return;
      }
    }

    if (success) {
      onSuccess();
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    clearError();
    let success = false;

    if (provider === 'google') {
      success = await loginWithGoogle();
    } else {
      success = await loginWithGithub();
    }

    if (success) {
      onSuccess();
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetSent(false);
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient from-primary-400 to-purple-400 mb-2">
            UPTIME
          </h1>
          <p className="text-dark-400">
            웹사이트 운영 시뮬레이션 게임
          </p>
        </div>

        <Card className="p-6">
          <AnimatePresence mode="wait">
            {mode === 'reset' ? (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => switchMode('login')}
                  className="flex items-center text-dark-400 hover:text-dark-200 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-sm">로그인으로 돌아가기</span>
                </button>

                <h2 className="text-xl font-semibold text-dark-100 mb-2">
                  비밀번호 재설정
                </h2>
                <p className="text-sm text-dark-400 mb-6">
                  가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>

                {resetSent ? (
                  <div className="p-4 rounded-lg bg-success-900/20 border border-success-700/30">
                    <p className="text-sm text-success-400">
                      비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">이메일</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={cn('input pl-10', errors.email && 'border-danger-500')}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-danger-400 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-danger-900/20 border border-danger-700/30">
                        <p className="text-sm text-danger-400">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isLoading}
                    >
                      재설정 링크 발송
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-xl font-semibold text-dark-100 mb-6 text-center">
                  {mode === 'login' ? '로그인' : '회원가입'}
                </h2>

                {/* Social login buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google로 계속하기
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub로 계속하기
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-900 text-dark-500">또는</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">닉네임</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="게임에서 사용할 닉네임"
                          className={cn('input pl-10', errors.displayName && 'border-danger-500')}
                        />
                      </div>
                      {errors.displayName && (
                        <p className="text-xs text-danger-400 mt-1">{errors.displayName}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-dark-400 mb-1">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={cn('input pl-10', errors.email && 'border-danger-500')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-danger-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm text-dark-400">비밀번호</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          비밀번호를 잊으셨나요?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn('input pl-10 pr-10', errors.password && 'border-danger-500')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-danger-400 mt-1">{errors.password}</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-danger-900/20 border border-danger-700/30">
                      <p className="text-sm text-danger-400">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {mode === 'login' ? '로그인' : '가입하기'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {mode === 'login'
                      ? '계정이 없으신가요? 회원가입'
                      : '이미 계정이 있으신가요? 로그인'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guest play option */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <Button
              variant="ghost"
              fullWidth
              onClick={onSuccess}
            >
              게스트로 플레이하기
            </Button>
          </div>
        </Card>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <span className="text-2xl mb-2 block">🌐</span>
            <p className="text-xs text-dark-400">웹 → 앱 성장</p>
          </div>
          <div className="p-4">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-xs text-dark-400">실시간 이슈 대응</p>
          </div>
          <div className="p-4">
            <span className="text-2xl mb-2 block">👥</span>
            <p className="text-xs text-dark-400">팀 빌딩 & 성장</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
