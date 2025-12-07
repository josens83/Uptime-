import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, AppWindow, Check, Lock, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card, Badge, Button, Progress } from '../ui';
import { cn, formatNumber, formatMoney } from '../../utils/helpers';
import { Phase } from '../../types';

interface PhaseInfo {
  id: Phase;
  name: string;
  icon: React.ReactNode;
  requirements?: {
    users: number;
    money: number;
    reputation: number;
  };
}

const phases: PhaseInfo[] = [
  {
    id: 'web',
    name: 'Web',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'mobile',
    name: 'Mobile Web',
    icon: <Smartphone className="w-5 h-5" />,
    requirements: {
      users: 1000,
      money: 5000,
      reputation: 30
    }
  },
  {
    id: 'app',
    name: 'Native App',
    icon: <AppWindow className="w-5 h-5" />,
    requirements: {
      users: 5000,
      money: 20000,
      reputation: 60
    }
  }
];

export function PhaseProgress() {
  const phase = useGameStore(state => state.phase);
  const users = useGameStore(state => state.users);
  const money = useGameStore(state => state.money);
  const reputation = useGameStore(state => state.reputation);
  const canAdvancePhase = useGameStore(state => state.canAdvancePhase);
  const advancePhase = useGameStore(state => state.advancePhase);

  const currentPhaseIndex = phases.findIndex(p => p.id === phase);
  const nextPhase = phases[currentPhaseIndex + 1];

  const getPhaseStatus = (phaseInfo: PhaseInfo, index: number) => {
    if (index < currentPhaseIndex) return 'completed';
    if (index === currentPhaseIndex) return 'current';
    return 'locked';
  };

  const getRequirementProgress = (
    current: number,
    required: number
  ): { progress: number; met: boolean } => {
    const progress = Math.min(100, (current / required) * 100);
    return { progress, met: current >= required };
  };

  return (
    <Card>
      {/* Phase timeline */}
      <div className="flex items-center justify-between mb-6">
        {phases.map((phaseInfo, index) => {
          const status = getPhaseStatus(phaseInfo, index);

          return (
            <React.Fragment key={phaseInfo.id}>
              <motion.div
                className={cn(
                  'flex flex-col items-center',
                  status === 'current' && 'scale-110'
                )}
                animate={{ scale: status === 'current' ? 1.1 : 1 }}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors',
                    status === 'completed' && 'bg-success-600 border-success-500 text-white',
                    status === 'current' && 'bg-primary-600 border-primary-500 text-white',
                    status === 'locked' && 'bg-dark-800 border-dark-600 text-dark-500'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : status === 'locked' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    phaseInfo.icon
                  )}
                </div>
                <span className={cn(
                  'mt-2 text-xs font-medium',
                  status === 'current' ? 'text-primary-400' : 'text-dark-400'
                )}>
                  {phaseInfo.name}
                </span>
              </motion.div>

              {index < phases.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2',
                  index < currentPhaseIndex ? 'bg-success-500' : 'bg-dark-700'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Next phase requirements */}
      {nextPhase && nextPhase.requirements && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-dark-100">
              다음 단계: {nextPhase.name}
            </h3>
            {canAdvancePhase() && (
              <Badge variant="success" dot pulse>
                준비 완료!
              </Badge>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            {/* Users */}
            {(() => {
              const req = getRequirementProgress(users, nextPhase.requirements.users);
              return (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-400">사용자</span>
                    <span className={req.met ? 'text-success-400' : 'text-dark-300'}>
                      {formatNumber(users)} / {formatNumber(nextPhase.requirements.users)}
                      {req.met && ' ✓'}
                    </span>
                  </div>
                  <Progress
                    value={req.progress}
                    size="sm"
                    color={req.met ? 'success' : 'primary'}
                  />
                </div>
              );
            })()}

            {/* Money */}
            {(() => {
              const req = getRequirementProgress(money, nextPhase.requirements.money);
              return (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-400">자금</span>
                    <span className={req.met ? 'text-success-400' : 'text-dark-300'}>
                      {formatMoney(money)} / {formatMoney(nextPhase.requirements.money)}
                      {req.met && ' ✓'}
                    </span>
                  </div>
                  <Progress
                    value={req.progress}
                    size="sm"
                    color={req.met ? 'success' : 'primary'}
                  />
                </div>
              );
            })()}

            {/* Reputation */}
            {(() => {
              const req = getRequirementProgress(reputation, nextPhase.requirements.reputation);
              return (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-400">평판</span>
                    <span className={req.met ? 'text-success-400' : 'text-dark-300'}>
                      {reputation} / {nextPhase.requirements.reputation}
                      {req.met && ' ✓'}
                    </span>
                  </div>
                  <Progress
                    value={req.progress}
                    size="sm"
                    color={req.met ? 'success' : 'primary'}
                  />
                </div>
              );
            })()}
          </div>

          {/* Advance button */}
          {canAdvancePhase() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="success"
                fullWidth
                onClick={advancePhase}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {nextPhase.name} 단계로 진입
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Final phase message */}
      {phase === 'app' && (
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl mb-2"
          >
            🎉
          </motion.div>
          <p className="text-success-400 font-medium">최종 단계 달성!</p>
          <p className="text-dark-400 text-sm mt-1">
            이제 앱을 성장시키고 목표를 달성하세요
          </p>
        </div>
      )}
    </Card>
  );
}
