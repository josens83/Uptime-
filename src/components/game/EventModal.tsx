import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Button, Badge } from '../ui';
import { cn } from '../../utils/helpers';
import { Lock, Crown } from 'lucide-react';

export function EventModal() {
  const currentEvent = useGameStore(state => state.currentEvent);
  const handleEventChoice = useGameStore(state => state.handleEventChoice);
  const dismissEvent = useGameStore(state => state.dismissEvent);
  const user = useGameStore(state => state.user);

  const isPremium = user?.subscription !== 'free';

  if (!currentEvent) return null;

  const getEffectText = (effect: Record<string, number>) => {
    const parts: string[] = [];

    if (effect.money) {
      const sign = effect.money > 0 ? '+' : '';
      parts.push(`${sign}$${Math.abs(effect.money)}`);
    }
    if (effect.users) {
      const sign = effect.users > 0 ? '+' : '';
      parts.push(`${sign}${effect.users} 사용자`);
    }
    if (effect.uptime) {
      const sign = effect.uptime > 0 ? '+' : '';
      parts.push(`${sign}${effect.uptime}% 업타임`);
    }
    if (effect.reputation) {
      const sign = effect.reputation > 0 ? '+' : '';
      parts.push(`${sign}${effect.reputation} 평판`);
    }
    if (effect.techDebt) {
      const sign = effect.techDebt > 0 ? '+' : '';
      parts.push(`${sign}${effect.techDebt}% 기술부채`);
    }
    if (effect.day) {
      parts.push(`+${effect.day}일 소요`);
    }

    return parts.join(' | ');
  };

  const getEffectColor = (effect: Record<string, number>) => {
    let score = 0;
    if (effect.money) score += effect.money > 0 ? 1 : -1;
    if (effect.users) score += effect.users > 0 ? 1 : -1;
    if (effect.uptime) score += effect.uptime > 0 ? 2 : -2;
    if (effect.reputation) score += effect.reputation > 0 ? 1 : -1;
    if (effect.techDebt) score += effect.techDebt < 0 ? 1 : -1;
    if (effect.day) score -= 0.5;

    if (score > 1) return 'text-success-400';
    if (score < -1) return 'text-danger-400';
    return 'text-warning-400';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 text-center border-b border-dark-800">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-5xl mb-4 block"
            >
              {currentEvent.icon || '📣'}
            </motion.span>
            <h2 className="text-xl font-bold text-dark-100">
              {currentEvent.title}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-dark-300 text-center mb-6">
              {currentEvent.description}
            </p>

            {/* Choices */}
            <div className="space-y-3">
              {currentEvent.choices.map((choice, index) => {
                const isLocked = choice.premium && !isPremium;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    onClick={() => !isLocked && handleEventChoice(index)}
                    disabled={isLocked}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-200',
                      'border',
                      isLocked
                        ? 'bg-dark-800/30 border-dark-700/30 cursor-not-allowed opacity-60'
                        : 'bg-dark-800/50 border-dark-700/50 hover:border-primary-500/50 hover:bg-dark-800'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark-100">
                            {choice.text}
                          </span>
                          {choice.premium && (
                            <Badge variant="premium" size="sm">
                              <Crown className="w-3 h-3 mr-1" />
                              PRO
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          'text-sm mt-1',
                          getEffectColor(choice.effect)
                        )}>
                          {getEffectText(choice.effect)}
                        </p>
                      </div>
                      {isLocked && (
                        <Lock className="w-4 h-4 text-dark-500" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Premium upsell */}
            {currentEvent.choices.some(c => c.premium) && !isPremium && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-700/30"
              >
                <p className="text-xs text-yellow-400 text-center">
                  💎 Pro 구독으로 업그레이드하면 프리미엄 선택지를 이용할 수 있습니다
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
