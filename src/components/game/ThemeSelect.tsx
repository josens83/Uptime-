import { motion } from 'framer-motion';
import { Palette, Lock, Check } from 'lucide-react';
import { Card, Badge } from '../ui';
import { useThemeStore, themes, ThemeId } from '../../services/themeService';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/helpers';

interface ThemeSelectProps {
  compact?: boolean;
}

export function ThemeSelect({ compact = false }: ThemeSelectProps) {
  const { currentTheme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const isPremium = user?.subscription && user.subscription !== 'free';

  const handleSelect = (themeId: ThemeId, isPremiumTheme: boolean) => {
    if (isPremiumTheme && !isPremium) {
      alert('이 테마는 Pro 이상 구독자만 사용할 수 있습니다.');
      return;
    }
    setTheme(themeId);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {themes.slice(0, 4).map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id, theme.premium)}
            className={cn(
              'w-8 h-8 rounded-lg border-2 transition-all relative overflow-hidden',
              currentTheme === theme.id
                ? 'border-white ring-2 ring-white/30'
                : 'border-transparent hover:border-dark-600',
              theme.premium && !isPremium && 'opacity-50'
            )}
            style={{ background: theme.preview }}
            title={theme.name}
          >
            {theme.premium && !isPremium && (
              <Lock className="absolute inset-0 m-auto w-3 h-3 text-white/80" />
            )}
            {currentTheme === theme.id && (
              <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary-400" />
        <h3 className="font-semibold text-dark-100">테마</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {themes.map((theme, index) => (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(theme.id, theme.premium)}
            className={cn(
              'relative p-3 rounded-lg border-2 transition-all text-left',
              currentTheme === theme.id
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-700 hover:border-dark-600',
              theme.premium && !isPremium && 'opacity-60'
            )}
          >
            {/* Preview */}
            <div
              className="w-full h-12 rounded-md mb-2"
              style={{ background: theme.preview }}
            />

            {/* Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-200">{theme.name}</p>
                <p className="text-xs text-dark-500">{theme.description}</p>
              </div>

              {theme.premium && (
                isPremium ? (
                  <Badge variant="premium" size="sm">Pro</Badge>
                ) : (
                  <Lock className="w-4 h-4 text-dark-500" />
                )
              )}
            </div>

            {/* Selected indicator */}
            {currentTheme === theme.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-dark-500 text-center mt-4">
        테마는 자동으로 저장됩니다
      </p>
    </Card>
  );
}
