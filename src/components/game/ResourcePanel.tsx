import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Star,
  Wrench,
  Server,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useGameComputed } from '../../hooks/useGameLoop';
import { Card, StatCard, Progress, Badge } from '../ui';
import {
  cn,
  formatMoney,
  formatNumber,
  getUptimeColor,
  getTechDebtColor,
  getTechDebtBgColor,
  getReputationColor
} from '../../utils/helpers';

export function ResourcePanel() {
  const money = useGameStore(state => state.money);
  const users = useGameStore(state => state.users);
  const reputation = useGameStore(state => state.reputation);
  const techDebt = useGameStore(state => state.techDebt);
  const serverTier = useGameStore(state => state.serverTier);
  const team = useGameStore(state => state.team);

  const { serverCapacity, serverCost, teamSalary, revenuePerHour } = useGameComputed();

  const totalTeamSize = team.developers + team.designers + team.marketers;
  const hourlyCost = (serverCost + teamSalary) / 24;
  const netIncome = revenuePerHour - hourlyCost;
  const capacityUsage = (users / serverCapacity) * 100;

  return (
    <div className="space-y-4">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Money */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-success-400" />
            <span className="text-xs text-dark-400 uppercase">자금</span>
          </div>
          <motion.p
            className={cn(
              'text-xl font-bold',
              money < 0 ? 'text-danger-400' : 'text-success-400'
            )}
            key={Math.floor(money)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatMoney(money)}
          </motion.p>
          <div className="flex items-center gap-1 mt-1 text-xs">
            {netIncome >= 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-success-400" />
                <span className="text-success-400">+{formatMoney(netIncome)}/h</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-danger-400" />
                <span className="text-danger-400">{formatMoney(netIncome)}/h</span>
              </>
            )}
          </div>
        </Card>

        {/* Users */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-dark-400 uppercase">사용자</span>
          </div>
          <motion.p
            className="text-xl font-bold text-primary-400"
            key={Math.floor(users)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatNumber(users)}
          </motion.p>
          <div className="flex items-center gap-1 mt-1 text-xs text-dark-400">
            <span>/ {formatNumber(serverCapacity)} 최대</span>
          </div>
          <Progress
            value={capacityUsage}
            size="sm"
            color={capacityUsage > 90 ? 'danger' : capacityUsage > 70 ? 'warning' : 'primary'}
            className="mt-2"
          />
        </Card>

        {/* Reputation */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-warning-400" />
            <span className="text-xs text-dark-400 uppercase">평판</span>
          </div>
          <p className={cn('text-xl font-bold', getReputationColor(reputation))}>
            {reputation.toFixed(0)}
          </p>
          <Progress
            value={reputation}
            size="sm"
            color={
              reputation >= 80 ? 'success' :
              reputation >= 50 ? 'warning' : 'danger'
            }
            className="mt-2"
          />
        </Card>

        {/* Tech Debt */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-dark-400" />
            <span className="text-xs text-dark-400 uppercase">기술 부채</span>
          </div>
          <p className={cn('text-xl font-bold', getTechDebtColor(techDebt))}>
            {techDebt.toFixed(0)}%
          </p>
          <Progress
            value={techDebt}
            size="sm"
            color={
              techDebt <= 30 ? 'success' :
              techDebt <= 60 ? 'warning' : 'danger'
            }
            className="mt-2"
          />
        </Card>
      </div>

      {/* Server & Team Info */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-dark-100">인프라</span>
          </div>
          <Badge variant="info">Tier {serverTier}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-dark-400">
            <span>서버 용량</span>
            <span className={cn(
              capacityUsage > 90 ? 'text-danger-400' :
              capacityUsage > 70 ? 'text-warning-400' : 'text-dark-200'
            )}>
              {formatNumber(users)} / {formatNumber(serverCapacity)}
            </span>
          </div>
          <div className="flex justify-between text-dark-400">
            <span>일일 서버 비용</span>
            <span className="text-dark-200">${serverCost}/일</span>
          </div>
        </div>
      </Card>

      {/* Team Info */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-dark-100">팀</span>
          </div>
          <Badge variant="default">{totalTeamSize}명</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-dark-800 rounded-lg">
            <p className="text-lg font-bold text-primary-400">{team.developers}</p>
            <p className="text-xs text-dark-400">개발자</p>
          </div>
          <div className="text-center p-2 bg-dark-800 rounded-lg">
            <p className="text-lg font-bold text-success-400">{team.designers}</p>
            <p className="text-xs text-dark-400">디자이너</p>
          </div>
          <div className="text-center p-2 bg-dark-800 rounded-lg">
            <p className="text-lg font-bold text-warning-400">{team.marketers}</p>
            <p className="text-xs text-dark-400">마케터</p>
          </div>
        </div>

        <div className="flex justify-between text-sm text-dark-400">
          <span>일일 인건비</span>
          <span className="text-dark-200">${teamSalary}/일</span>
        </div>
      </Card>

      {/* Warnings */}
      {capacityUsage > 90 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-danger-900/20 border border-danger-700/30"
        >
          <p className="text-sm text-danger-400">
            ⚠️ 서버 용량이 부족합니다! 서버를 업그레이드하세요.
          </p>
        </motion.div>
      )}

      {techDebt > 70 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-warning-900/20 border border-warning-700/30"
        >
          <p className="text-sm text-warning-400">
            ⚠️ 기술 부채가 높습니다! 시스템 안정성이 저하될 수 있습니다.
          </p>
        </motion.div>
      )}

      {money < 500 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-warning-900/20 border border-warning-700/30"
        >
          <p className="text-sm text-warning-400">
            💰 자금이 부족합니다! 지출을 줄이거나 수익을 늘리세요.
          </p>
        </motion.div>
      )}
    </div>
  );
}
