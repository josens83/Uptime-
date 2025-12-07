import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Target,
  Gift,
  ChevronRight,
  Clock,
  Star,
  Zap,
  Crown,
  Medal,
  TrendingUp,
  X,
  Lock,
  CheckCircle
} from 'lucide-react';
import { Button, Card } from '../ui';
import { cn } from '../../utils/helpers';
import {
  Season,
  SeasonPlayer,
  SeasonChallenge,
  SeasonPass,
  getCurrentSeason,
  getSeasonLeaderboard,
  getPlayerSeasonStats,
  getSeasonChallenges,
  getSeasonPass,
  getSeasonTimeRemaining,
  tierInfo,
  SeasonTier
} from '../../services/seasonService';
import { useAuthStore } from '../../store/authStore';

interface SeasonPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'overview' | 'leaderboard' | 'challenges' | 'pass';

export function SeasonPanel({ isOpen, onClose }: SeasonPanelProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [season, setSeason] = useState<Season | null>(null);
  const [leaderboard, setLeaderboard] = useState<SeasonPlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<SeasonPlayer | null>(null);
  const [challenges, setChallenges] = useState<SeasonChallenge[]>([]);
  const [seasonPass, setSeasonPass] = useState<SeasonPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSeasonData();
    }
  }, [isOpen]);

  const loadSeasonData = async () => {
    setIsLoading(true);
    const currentSeason = await getCurrentSeason();
    setSeason(currentSeason);

    if (currentSeason) {
      const [lb, stats, ch, pass] = await Promise.all([
        getSeasonLeaderboard(currentSeason.id, 100),
        getPlayerSeasonStats(currentSeason.id, user?.id || 'demo'),
        getSeasonChallenges(currentSeason.id, user?.id || 'demo'),
        getSeasonPass(currentSeason.id, user?.id || 'demo')
      ]);
      setLeaderboard(lb);
      setPlayerStats(stats);
      setChallenges(ch);
      setSeasonPass(pass);
    }
    setIsLoading(false);
  };

  const tabs = [
    { id: 'overview' as Tab, label: '개요', icon: Trophy },
    { id: 'leaderboard' as Tab, label: '순위', icon: Medal },
    { id: 'challenges' as Tab, label: '챌린지', icon: Target },
    { id: 'pass' as Tab, label: '시즌패스', icon: Gift }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-0 bottom-0 top-16 bg-dark-900 border-t border-dark-700 z-50 overflow-hidden flex flex-col rounded-t-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{season?.name || '시즌'}</h2>
                  {season && (
                    <p className="text-xs text-dark-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getSeasonTimeRemaining(season.endDate)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'text-yellow-400 border-b-2 border-yellow-400 bg-dark-800/50'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && season && (
                    <div className="space-y-4">
                      {/* Season Banner */}
                      <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                        <p className="text-dark-300">{season.description}</p>

                        {/* Active Events */}
                        {season.specialEvents.filter(e => e.active).map(event => (
                          <div key={event.id} className="mt-3 p-3 bg-dark-800/50 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="font-medium text-yellow-400">{event.name}</span>
                              <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                x{event.multiplier}
                              </span>
                            </div>
                            <p className="text-xs text-dark-400 mt-1">{event.description}</p>
                          </div>
                        ))}
                      </Card>

                      {/* Player Stats */}
                      {playerStats && (
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-dark-400 mb-3">내 시즌 현황</h3>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-3xl mb-1">{tierInfo[playerStats.tier].icon}</div>
                              <div className="text-xs" style={{ color: tierInfo[playerStats.tier].color }}>
                                {tierInfo[playerStats.tier].name}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{playerStats.score.toLocaleString()}</span>
                                <span className="text-dark-500 text-sm">점</span>
                              </div>
                              <div className="text-sm text-dark-400">
                                시즌 랭킹 <span className="text-primary-400 font-bold">#{playerStats.rank}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-dark-800 rounded-lg">
                              <div className="text-lg font-bold">{playerStats.gamesPlayed}</div>
                              <div className="text-xs text-dark-500">게임</div>
                            </div>
                            <div className="p-2 bg-dark-800 rounded-lg">
                              <div className="text-lg font-bold text-success-400">{playerStats.bestUptime}%</div>
                              <div className="text-xs text-dark-500">최고 업타임</div>
                            </div>
                            <div className="p-2 bg-dark-800 rounded-lg">
                              <div className="text-lg font-bold">{playerStats.badges.length}</div>
                              <div className="text-xs text-dark-500">배지</div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Season Rewards Preview */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-400 mb-3">시즌 보상</h3>
                        <div className="space-y-2">
                          {season.rewards.slice(0, 5).map((reward, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-dark-800 rounded-lg">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                                idx === 0 && 'bg-yellow-500/20 text-yellow-400',
                                idx === 1 && 'bg-gray-400/20 text-gray-400',
                                idx === 2 && 'bg-orange-500/20 text-orange-400',
                                idx > 2 && 'bg-dark-700 text-dark-400'
                              )}>
                                {typeof reward.rank === 'number' ? `#${reward.rank}` : reward.rank}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{reward.title}</div>
                                <div className="flex items-center gap-2 text-xs text-dark-500">
                                  <span>{reward.rewards.coins.toLocaleString()} 코인</span>
                                  <span>{reward.rewards.gems} 젬</span>
                                  {reward.rewards.badge && <span>{reward.rewards.badge}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Leaderboard Tab */}
                  {activeTab === 'leaderboard' && (
                    <div className="space-y-2">
                      {/* Top 3 */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {leaderboard.slice(0, 3).map((player, idx) => (
                          <Card
                            key={player.id}
                            className={cn(
                              'p-3 text-center',
                              idx === 0 && 'bg-yellow-500/10 border-yellow-500/30',
                              idx === 1 && 'bg-gray-400/10 border-gray-400/30',
                              idx === 2 && 'bg-orange-500/10 border-orange-500/30'
                            )}
                          >
                            <div className="text-2xl mb-1">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </div>
                            <div className="font-bold text-sm truncate">{player.name}</div>
                            <div className="text-xs text-dark-400">{player.score.toLocaleString()}</div>
                            <div className="text-xs mt-1" style={{ color: tierInfo[player.tier].color }}>
                              {tierInfo[player.tier].icon} {tierInfo[player.tier].name}
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Rest of leaderboard */}
                      <div className="space-y-1">
                        {leaderboard.slice(3).map((player) => (
                          <LeaderboardRow key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenges Tab */}
                  {activeTab === 'challenges' && (
                    <div className="space-y-4">
                      {/* Daily */}
                      <div>
                        <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          일일 챌린지
                        </h3>
                        <div className="space-y-2">
                          {challenges.filter(c => c.type === 'daily').map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                          ))}
                        </div>
                      </div>

                      {/* Weekly */}
                      <div>
                        <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          주간 챌린지
                        </h3>
                        <div className="space-y-2">
                          {challenges.filter(c => c.type === 'weekly').map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                          ))}
                        </div>
                      </div>

                      {/* Season */}
                      <div>
                        <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          시즌 챌린지
                        </h3>
                        <div className="space-y-2">
                          {challenges.filter(c => c.type === 'season').map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Season Pass Tab */}
                  {activeTab === 'pass' && seasonPass && (
                    <div className="space-y-4">
                      {/* Pass Header */}
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold">시즌 패스</h3>
                            <p className="text-xs text-dark-400">레벨 {seasonPass.level} / 50</p>
                          </div>
                          {!seasonPass.isPremium && (
                            <Button size="sm" variant="primary">
                              프리미엄 구매
                            </Button>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                            style={{ width: `${(seasonPass.level / 50) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-dark-500 mt-1">
                          <span>{seasonPass.experience.toLocaleString()} XP</span>
                          <span>{((seasonPass.level + 1) * 500).toLocaleString()} XP</span>
                        </div>
                      </Card>

                      {/* Rewards Track */}
                      <div className="space-y-2">
                        {seasonPass.rewards.slice(seasonPass.level - 2, seasonPass.level + 5).map((reward) => (
                          <Card
                            key={reward.level}
                            className={cn(
                              'p-3',
                              reward.level <= seasonPass.level && 'border-primary-500/50 bg-primary-500/5',
                              reward.level === seasonPass.level && 'ring-2 ring-primary-500'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                                reward.level <= seasonPass.level
                                  ? 'bg-primary-500/20 text-primary-400'
                                  : 'bg-dark-700 text-dark-500'
                              )}>
                                {reward.level}
                              </div>

                              <div className="flex-1 grid grid-cols-2 gap-2">
                                {/* Free Reward */}
                                <div className={cn(
                                  'p-2 rounded-lg text-center text-xs',
                                  reward.freeReward ? 'bg-dark-800' : 'bg-dark-800/50'
                                )}>
                                  {reward.freeReward ? (
                                    <>
                                      <div className="font-medium">{reward.freeReward.amount}</div>
                                      <div className="text-dark-500">{reward.freeReward.type}</div>
                                    </>
                                  ) : (
                                    <span className="text-dark-600">-</span>
                                  )}
                                </div>

                                {/* Premium Reward */}
                                <div className={cn(
                                  'p-2 rounded-lg text-center text-xs relative',
                                  seasonPass.isPremium ? 'bg-yellow-500/10' : 'bg-dark-800/50'
                                )}>
                                  {!seasonPass.isPremium && (
                                    <Lock className="w-3 h-3 absolute top-1 right-1 text-dark-600" />
                                  )}
                                  {reward.premiumReward && (
                                    <>
                                      <div className={cn(
                                        'font-medium',
                                        seasonPass.isPremium ? 'text-yellow-400' : 'text-dark-500'
                                      )}>
                                        {reward.premiumReward.amount}
                                      </div>
                                      <div className="text-dark-500">{reward.premiumReward.type}</div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Claim Status */}
                              {reward.level <= seasonPass.level && (
                                reward.claimed ? (
                                  <CheckCircle className="w-5 h-5 text-success-400" />
                                ) : (
                                  <Button size="sm">수령</Button>
                                )
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Leaderboard Row
function LeaderboardRow({ player }: { player: SeasonPlayer }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="w-8 text-center font-bold text-dark-500">
          #{player.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{player.name}</span>
            {player.badges.map((badge, idx) => (
              <span key={idx} className="text-sm">{badge}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span style={{ color: tierInfo[player.tier].color }}>
              {tierInfo[player.tier].icon} {tierInfo[player.tier].name}
            </span>
            <span>|</span>
            <span>{player.gamesPlayed} 게임</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold">{player.score.toLocaleString()}</div>
          <div className="text-xs text-success-400">{player.bestUptime}%</div>
        </div>
      </div>
    </Card>
  );
}

// Challenge Card
function ChallengeCard({ challenge }: { challenge: SeasonChallenge }) {
  const progress = Math.min(100, (challenge.current / challenge.target) * 100);
  const isComplete = challenge.current >= challenge.target;

  return (
    <Card className={cn(
      'p-3',
      isComplete && 'border-success-500/50 bg-success-500/5'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          isComplete ? 'bg-success-500/20' : 'bg-dark-800'
        )}>
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-success-400" />
          ) : (
            <Target className="w-5 h-5 text-dark-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{challenge.title}</div>
          <div className="text-xs text-dark-500 mb-2">{challenge.description}</div>

          {/* Progress Bar */}
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                isComplete ? 'bg-success-500' : 'bg-primary-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>{challenge.current} / {challenge.target}</span>
            <span className="text-yellow-400">+{challenge.reward}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
