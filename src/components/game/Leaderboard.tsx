import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star, Clock, Users, DollarSign, Activity, ChevronRight } from 'lucide-react';
import { Card, Badge } from '../ui';
import {
  LeaderboardEntry,
  leaderboardCategories,
  getLeaderboard,
  getWeeklyLeaderboard
} from '../../services/leaderboardService';
import { useAuthStore } from '../../store/authStore';
import { cn, formatNumber, formatMoney } from '../../utils/helpers';

interface LeaderboardProps {
  onClose?: () => void;
}

type TimeFilter = 'all' | 'weekly';

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [category, setCategory] = useState('survival');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    loadLeaderboard();
  }, [category, timeFilter]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = timeFilter === 'weekly'
        ? await getWeeklyLeaderboard(category, 50)
        : await getLeaderboard(category, 50);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'survival': return <Clock className="w-4 h-4" />;
      case 'uptime': return <Activity className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-dark-400 font-mono w-5 text-center">{rank}</span>;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'web': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'mobile': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'app': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-dark-700 text-dark-300';
    }
  };

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'survival': return `Day ${entry.day}`;
      case 'uptime': return `${entry.uptime.toFixed(1)}%`;
      case 'users': return formatNumber(entry.users);
      case 'revenue': return formatMoney(entry.money);
      default: return entry.score.toString();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-100">리더보드</h2>
            <p className="text-sm text-dark-400">최고의 플레이어들을 확인하세요</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {leaderboardCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all',
              category === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200'
            )}
          >
            {getCategoryIcon(cat.id)}
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTimeFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            timeFilter === 'all'
              ? 'bg-dark-700 text-dark-100'
              : 'text-dark-400 hover:text-dark-200'
          )}
        >
          전체
        </button>
        <button
          onClick={() => setTimeFilter('weekly')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm transition-all',
            timeFilter === 'weekly'
              ? 'bg-dark-700 text-dark-100'
              : 'text-dark-400 hover:text-dark-200'
          )}
        >
          이번 주
        </button>
      </div>

      {/* Leaderboard List */}
      <Card className="flex-1 p-0 overflow-hidden">
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-dark-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>아직 기록이 없습니다</p>
              <p className="text-sm mt-1">첫 번째 기록을 세워보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-800">
              <AnimatePresence>
                {entries.map((entry, index) => {
                  const isCurrentUser = user?.id === entry.userId;
                  const rank = index + 1;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'flex items-center gap-4 p-4 hover:bg-dark-800/50 transition-colors',
                        isCurrentUser && 'bg-primary-900/20 border-l-2 border-primary-500',
                        rank <= 3 && 'bg-gradient-to-r from-dark-800/50 to-transparent'
                      )}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium truncate',
                            isCurrentUser ? 'text-primary-400' : 'text-dark-100'
                          )}>
                            {entry.username}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="info" size="sm">나</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full border',
                            getPhaseColor(entry.phase)
                          )}>
                            {entry.phase === 'web' ? 'Web' : entry.phase === 'mobile' ? 'Mobile' : 'App'}
                          </span>
                          <span className="text-xs text-dark-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <div className={cn(
                          'font-bold',
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-gray-300' :
                          rank === 3 ? 'text-amber-600' :
                          'text-dark-200'
                        )}>
                          {getScoreDisplay(entry)}
                        </div>
                        {category !== 'uptime' && (
                          <div className="text-xs text-dark-500">
                            {entry.uptime.toFixed(1)}% uptime
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>

      {/* Current Category Description */}
      <div className="mt-4 p-3 rounded-lg bg-dark-800/50 border border-dark-700">
        <div className="flex items-center gap-2 text-dark-300">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">
            {leaderboardCategories.find(c => c.id === category)?.description}
          </span>
        </div>
      </div>
    </div>
  );
}
