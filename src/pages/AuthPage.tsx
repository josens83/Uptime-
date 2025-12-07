import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button, Card } from '../components/ui';
import { cn, isValidEmail } from '../utils/helpers';

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!isValidEmail(email)) {
      newErrors.email = '유효한 이메일을 입력해주세요';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
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
    } else {
      success = await register(email, password, displayName);
    }

    if (success) {
      onSuccess();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
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
          <h2 className="text-xl font-semibold text-dark-100 mb-6 text-center">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

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
              <label className="block text-sm text-dark-400 mb-1">비밀번호</label>
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
              onClick={switchMode}
              className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
            >
              {mode === 'login'
                ? '계정이 없으신가요? 회원가입'
                : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>

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
