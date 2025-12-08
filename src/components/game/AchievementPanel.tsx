import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Lock,
  CheckCircle,
  Clock,
  Gift,
  ChevronRight,
  X,
  Filter
} from 'lucide-react';
import { Button, Card } from '../ui';
import { cn } from '../../utils/helpers';
import {
  Achievement,
  Challenge,
  AchievementCategory,
  AchievementTier,
  achievements,
  tierInfo,
  categoryInfo,
  useAchievementStore,
  getAchievementsByCategory,
  getAchievementProgress,
  GameStats
} from '../../services/achievementService';
import { useGameStore } from '../../store/gameStore';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'achievements' | 'challenges' | 'rewards';

export function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const { unlockedAchievements, activeChallenges, totalPoints, claimChallenge, generateDailyChallenges } = useAchievementStore();
  const gameState = useGameStore();

  // Generate challenges on first open
  useEffect(() => {
    if (isOpen && activeChallenges.length === 0) {
      generateDailyChallenges();
    }
  }, [isOpen]);

  // Create game stats object
  const phaseMap: Record<string, number> = { 'web': 1, 'mobile': 2, 'app': 3 };
  const stats: GameStats = {
    uptime: gameState.uptime,
    ticketsResolved: gameState.resolvedTickets,
    moneyEarned: gameState.totalEarnings,
    eventsHandled: Math.floor(gameState.day / 2), // Estimate from days played
    teamSize: gameState.team.developers + gameState.team.designers + gameState.team.marketers,
    teamDevelopers: gameState.team.developers,
    teamDesigners: gameState.team.designers,
    teamMarketers: gameState.team.marketers,
    upgradesPurchased: gameState.purchasedUpgrades.length,
    gamesPlayed: Math.max(1, Math.floor(gameState.day / 30)), // Estimate
    streakDays: 1, // Default streak
    phaseReached: phaseMap[gameState.phase] || 1,
    playTime: 0
  };

  // Filter achievements
  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && a.tier !== selectedTier) return false;
    if (showUnlockedOnly && !unlockedAchievements.includes(a.id)) return false;
    if (a.hidden && !unlockedAchievements.includes(a.id)) return false;
    return true;
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.filter(a => !a.hidden).length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const handleClaimChallenge = (id: string) => {
    const reward = claimChallenge(id);
    if (reward) {
      // In a real implementation, apply rewards to game state
      console.log('Challenge reward claimed:', reward);
    }
  };

  const tabs = [
    { id: 'achievements' as Tab, label: '업적', icon: Trophy },
    { id: 'challenges' as Tab, label: '도전과제', icon: Star },
    { id: 'rewards' as Tab, label: '보상', icon: Gift }
  ];

  const categories = Object.entries(categoryInfo) as [AchievementCategory, { name: string; icon: string }][];

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
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-lg bg-dark-900 border-r border-dark-700 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">업적 & 도전</h2>
                  <p className="text-xs text-dark-400">
                    {unlockedCount}/{totalCount} 달성 ({completionPercentage}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">{totalPoints}</div>
                  <div className="text-xs text-dark-500">포인트</div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-3 border-b border-dark-700">
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
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
              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as AchievementCategory | 'all')}
                      className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm"
                    >
                      <option value="all">모든 카테고리</option>
                      {categories.map(([key, { name, icon }]) => (
                        <option key={key} value={key}>{icon} {name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as AchievementTier | 'all')}
                      className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm"
                    >
                      <option value="all">모든 등급</option>
                      {Object.entries(tierInfo).map(([key, { name }]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-colors',
                        showUnlockedOnly
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-dark-400'
                      )}
                    >
                      달성만
                    </button>
                  </div>

                  {/* Achievement List */}
                  <div className="space-y-2">
                    {filteredAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={unlockedAchievements.includes(achievement.id)}
                        progress={getAchievementProgress(achievement, stats)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges Tab */}
              {activeTab === 'challenges' && (
                <div className="space-y-4">
                  {/* Daily Challenges */}
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      일일 도전
                    </h3>
                    <div className="space-y-2">
                      {activeChallenges
                        .filter(c => c.type === 'daily')
                        .map((challenge) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onClaim={() => handleClaimChallenge(challenge.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Weekly Challenges */}
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      주간 도전
                    </h3>
                    <div className="space-y-2">
                      {activeChallenges
                        .filter(c => c.type === 'weekly')
                        .map((challenge) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onClaim={() => handleClaimChallenge(challenge.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Special Challenges */}
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      특별 도전
                    </h3>
                    <div className="space-y-2">
                      {activeChallenges
                        .filter(c => c.type === 'special')
                        .map((challenge) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onClaim={() => handleClaimChallenge(challenge.id)}
                          />
                        ))}
                      {activeChallenges.filter(c => c.type === 'special').length === 0 && (
                        <p className="text-sm text-dark-500 text-center py-4">
                          현재 진행 중인 특별 도전이 없습니다
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="space-y-4">
                  {/* Stats */}
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-dark-300 mb-3">업적 통계</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-dark-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-400">{unlockedCount}</div>
                        <div className="text-xs text-dark-500">달성 업적</div>
                      </div>
                      <div className="p-3 bg-dark-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary-400">{totalPoints}</div>
                        <div className="text-xs text-dark-500">총 포인트</div>
                      </div>
                    </div>
                  </Card>

                  {/* Tier Progress */}
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-dark-300 mb-3">등급별 달성</h3>
                    <div className="space-y-3">
                      {Object.entries(tierInfo).map(([tier, info]) => {
                        const tierAchievements = achievements.filter(a => a.tier === tier as AchievementTier);
                        const unlockedTier = tierAchievements.filter(a => unlockedAchievements.includes(a.id));
                        const progress = (unlockedTier.length / tierAchievements.length) * 100;

                        return (
                          <div key={tier}>
                            <div className="flex justify-between text-sm mb-1">
                              <span style={{ color: info.color }}>{info.name}</span>
                              <span className="text-dark-400">{unlockedTier.length}/{tierAchievements.length}</span>
                            </div>
                            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{ width: `${progress}%`, backgroundColor: info.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Recent Unlocks */}
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-dark-300 mb-3">최근 달성</h3>
                    <div className="space-y-2">
                      {unlockedAchievements.slice(-5).reverse().map(id => {
                        const achievement = achievements.find(a => a.id === id);
                        if (!achievement) return null;
                        return (
                          <div key={id} className="flex items-center gap-3 p-2 bg-dark-800 rounded-lg">
                            <span className="text-xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{achievement.name}</div>
                              <div className="text-xs text-dark-500">{achievement.description}</div>
                            </div>
                          </div>
                        );
                      })}
                      {unlockedAchievements.length === 0 && (
                        <p className="text-sm text-dark-500 text-center py-4">
                          아직 달성한 업적이 없습니다
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Titles */}
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-dark-300 mb-3">획득한 칭호</h3>
                    <div className="flex flex-wrap gap-2">
                      {achievements
                        .filter(a => unlockedAchievements.includes(a.id) && a.reward.title)
                        .map(a => (
                          <span
                            key={a.id}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-full text-sm"
                          >
                            {a.reward.title}
                          </span>
                        ))}
                      {achievements.filter(a => unlockedAchievements.includes(a.id) && a.reward.title).length === 0 && (
                        <p className="text-sm text-dark-500">아직 획득한 칭호가 없습니다</p>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Achievement Card Component
function AchievementCard({
  achievement,
  isUnlocked,
  progress
}: {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
}) {
  const tierColor = tierInfo[achievement.tier].color;

  return (
    <Card className={cn(
      'p-3 transition-all',
      isUnlocked ? 'border-yellow-500/30 bg-yellow-500/5' : 'opacity-75'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
          isUnlocked ? 'bg-yellow-500/20' : 'bg-dark-800'
        )}>
          {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-dark-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{achievement.name}</span>
            <span
              className="px-1.5 py-0.5 text-xs font-bold rounded"
              style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
            >
              {tierInfo[achievement.tier].name}
            </span>
            {isUnlocked && <CheckCircle className="w-4 h-4 text-success-400" />}
          </div>
          <p className="text-xs text-dark-500 mt-0.5">{achievement.description}</p>

          {/* Progress bar for locked achievements */}
          {!isUnlocked && (
            <div className="mt-2">
              <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-dark-500 mt-0.5">{progress.toFixed(0)}%</div>
            </div>
          )}

          {/* Rewards */}
          {isUnlocked && achievement.reward && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              {achievement.reward.coins && (
                <span className="text-yellow-400">+{achievement.reward.coins} 코인</span>
              )}
              {achievement.reward.gems && (
                <span className="text-purple-400">+{achievement.reward.gems} 젬</span>
              )}
              {achievement.reward.title && (
                <span className="text-primary-400">"{achievement.reward.title}"</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Challenge Card Component
function ChallengeCard({
  challenge,
  onClaim
}: {
  challenge: Challenge;
  onClaim: () => void;
}) {
  const timeRemaining = challenge.expiresAt.getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const progress = (challenge.progress / challenge.requirement.target) * 100;

  return (
    <Card className={cn(
      'p-3',
      challenge.completed && 'border-success-500/30 bg-success-500/5'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
          challenge.completed ? 'bg-success-500/20' : 'bg-dark-800'
        )}>
          {challenge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{challenge.name}</span>
            <span className="text-xs text-dark-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {hoursRemaining}시간
            </span>
          </div>
          <p className="text-xs text-dark-500 mt-0.5">{challenge.description}</p>

          {/* Progress */}
          <div className="mt-2">
            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  challenge.completed ? 'bg-success-500' : 'bg-primary-500'
                )}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-dark-500 mt-0.5">
              <span>{challenge.progress}/{challenge.requirement.target}</span>
              <span className="text-yellow-400">
                +{challenge.reward.coins} 코인
                {challenge.reward.gems && ` +${challenge.reward.gems} 젬`}
              </span>
            </div>
          </div>

          {/* Claim button */}
          {challenge.completed && !challenge.claimed && (
            <Button size="sm" variant="primary" className="mt-2" onClick={onClaim}>
              보상 받기
            </Button>
          )}
          {challenge.claimed && (
            <span className="text-xs text-success-400 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              수령 완료
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
