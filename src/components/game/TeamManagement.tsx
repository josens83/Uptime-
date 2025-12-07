import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Code,
  Palette,
  Megaphone,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card, CardHeader, Button, Badge, Modal } from '../ui';
import { cn, formatMoney } from '../../utils/helpers';

interface TeamRole {
  type: 'developer' | 'designer' | 'marketer';
  name: string;
  icon: React.ReactNode;
  color: string;
  hireCost: number;
  salary: number;
  description: string;
  benefits: string[];
}

const teamRoles: TeamRole[] = [
  {
    type: 'developer',
    name: '개발자',
    icon: <Code className="w-5 h-5" />,
    color: 'text-primary-400',
    hireCost: 500,
    salary: 100,
    description: '더 많은 티켓을 동시에 처리할 수 있습니다.',
    benefits: [
      '티켓 처리 속도 증가',
      '동시 처리 가능 티켓 수 증가',
      '기술 부채 증가 속도 감소'
    ]
  },
  {
    type: 'designer',
    name: '디자이너',
    icon: <Palette className="w-5 h-5" />,
    color: 'text-success-400',
    hireCost: 400,
    salary: 80,
    description: 'UI/UX 개선으로 사용자 만족도가 올라갑니다.',
    benefits: [
      '평판 상승 속도 증가',
      '사용자 이탈률 감소',
      'Feature 티켓 보상 증가'
    ]
  },
  {
    type: 'marketer',
    name: '마케터',
    icon: <Megaphone className="w-5 h-5" />,
    color: 'text-warning-400',
    hireCost: 300,
    salary: 70,
    description: '마케팅을 통해 더 많은 사용자를 유치합니다.',
    benefits: [
      '사용자 증가 속도 향상',
      '이벤트 효과 증가',
      '수익 배율 증가'
    ]
  }
];

export function TeamManagement() {
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const team = useGameStore(state => state.team);
  const money = useGameStore(state => state.money);
  const hireTeamMember = useGameStore(state => state.hireTeamMember);
  const fireTeamMember = useGameStore(state => state.fireTeamMember);
  const getTeamSalary = useGameStore(state => state.getTeamSalary);

  const totalTeamSize = team.developers + team.designers + team.marketers;
  const dailySalary = getTeamSalary();

  const getTeamCount = (type: 'developer' | 'designer' | 'marketer') => {
    return team[`${type}s` as keyof typeof team];
  };

  const canHire = (role: TeamRole) => {
    return money >= role.hireCost;
  };

  const canFire = (type: 'developer' | 'designer' | 'marketer') => {
    const count = getTeamCount(type);
    // Can't fire last developer
    if (type === 'developer' && count <= 1) return false;
    return count > 0;
  };

  return (
    <>
      <Card>
        <CardHeader
          title="팀 관리"
          subtitle={`${totalTeamSize}명 | 일일 급여 ${formatMoney(dailySalary)}`}
          icon={<Users className="w-5 h-5 text-primary-400" />}
        />

        <div className="space-y-4">
          {teamRoles.map((role) => {
            const count = getTeamCount(role.type);
            const canHireRole = canHire(role);
            const canFireRole = canFire(role.type);

            return (
              <motion.div
                key={role.type}
                className="p-4 rounded-lg bg-dark-800/50 border border-dark-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      'bg-dark-700'
                    )}>
                      <span className={role.color}>{role.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-dark-100">
                          {role.name}
                        </span>
                        <button
                          onClick={() => setShowInfo(role.type)}
                          className="text-dark-500 hover:text-dark-300"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-dark-400">
                        고용비 ${role.hireCost} | 급여 ${role.salary}/일
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fireTeamMember(role.type)}
                      disabled={!canFireRole}
                      className="!p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <span className={cn(
                      'w-8 text-center text-lg font-bold',
                      role.color
                    )}>
                      {count}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => hireTeamMember(role.type)}
                      disabled={!canHireRole}
                      className="!p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick hire buttons */}
                {count === 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => hireTeamMember(role.type)}
                    disabled={!canHireRole}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    첫 {role.name} 고용 (${role.hireCost})
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 rounded-lg bg-dark-800/30 border border-dark-700/30">
          <p className="text-xs text-dark-400">
            💡 <strong className="text-dark-300">팁:</strong> 개발자가 많을수록 더 많은 티켓을
            동시에 처리할 수 있고, 마케터는 사용자 성장에, 디자이너는 평판 관리에 도움이 됩니다.
          </p>
        </div>
      </Card>

      {/* Role info modal */}
      <Modal
        isOpen={showInfo !== null}
        onClose={() => setShowInfo(null)}
        title={teamRoles.find(r => r.type === showInfo)?.name || ''}
        size="sm"
      >
        {showInfo && (() => {
          const role = teamRoles.find(r => r.type === showInfo)!;
          return (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  'bg-dark-800'
                )}>
                  <span className={role.color}>{role.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium text-dark-100">{role.name}</h3>
                  <p className="text-sm text-dark-400">{role.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">고용 비용</span>
                  <span className="text-dark-100">${role.hireCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">일일 급여</span>
                  <span className="text-dark-100">${role.salary}/일</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-dark-100 mb-2">효과</h4>
                <ul className="space-y-1">
                  {role.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-dark-400">
                      <span className="text-success-400">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
