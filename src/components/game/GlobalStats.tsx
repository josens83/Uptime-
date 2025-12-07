import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, Users, DollarSign, Trophy, TrendingUp, Calendar, Activity } from 'lucide-react';
import { Card } from '../ui';
import { GlobalStats as GlobalStatsType, getGlobalStats } from '../../services/statsService';
import { formatNumber, formatMoney } from '../../utils/helpers';

interface GlobalStatsProps {
  compact?: boolean;
}

export function GlobalStats({ compact = false }: GlobalStatsProps) {
  const [stats, setStats] = useState<GlobalStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load global stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: <Globe className="w-5 h-5" />,
      label: '총 게임 수',
      value: formatNumber(stats.totalGames),
      color: 'text-blue-400',
      bg: 'bg-blue-500/20'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: '총 플레이 시간',
      value: `${formatNumber(Math.round(stats.totalPlayTime / 60))}시간`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: '평균 생존 일수',
      value: `Day ${stats.averageDay}`,
      color: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: '총 시뮬레이션 사용자',
      value: formatNumber(stats.totalUsers),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: '총 누적 수익',
      value: formatMoney(stats.totalRevenue),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: '최장 생존 기록',
      value: `Day ${stats.highestDay}`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/20'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: '최다 사용자 기록',
      value: formatNumber(stats.highestUsers),
      color: 'text-pink-400',
      bg: 'bg-pink-500/20'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: '최고 업타임',
      value: `${stats.highestUptime.toFixed(2)}%`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20'
    }
  ];

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-dark-100">글로벌 통계</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {statItems.slice(0, 4).map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className={`p-1.5 rounded ${item.bg}`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-dark-400 truncate">{item.label}</p>
                <p className="text-sm font-semibold text-dark-100">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-500/20">
          <Globe className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-100">글로벌 통계</h2>
          <p className="text-sm text-dark-400">전 세계 플레이어들의 기록</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:border-dark-600 transition-colors">
              <div className={`inline-flex p-2 rounded-lg ${item.bg} mb-3`}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <p className="text-xs text-dark-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-dark-100">{item.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-dark-500 px-2">
        <span>이번 주 플레이: {formatNumber(stats.gamesThisWeek)} 게임</span>
        <span>마지막 업데이트: {new Date(stats.lastUpdated).toLocaleString()}</span>
      </div>
    </div>
  );
}
