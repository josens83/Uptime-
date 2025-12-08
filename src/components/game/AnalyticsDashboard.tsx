import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Trophy,
  Target,
  Zap,
  Calendar,
  Award,
  ChevronRight,
  Download,
  X,
  Activity,
  PieChart,
  Users
} from 'lucide-react';
import { Button, Card } from '../ui';
import { cn } from '../../utils/helpers';
import {
  UserAnalytics,
  DailyStats,
  PerformanceMetrics,
  LeaderboardPosition,
  getUserAnalytics,
  getDailyStats,
  getPerformanceMetrics,
  getInsights,
  getLeaderboardPositions,
  exportUserData
} from '../../services/analyticsService';
import { useAuthStore } from '../../store/authStore';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'overview' | 'trends' | 'performance' | 'compare';

export function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [positions, setPositions] = useState<LeaderboardPosition[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    const userId = user?.id || 'demo';

    const [analyticsData, dailyData, perfData, posData] = await Promise.all([
      getUserAnalytics(userId),
      getDailyStats(userId, 30),
      getPerformanceMetrics(userId),
      getLeaderboardPositions(userId)
    ]);

    setAnalytics(analyticsData);
    setDailyStats(dailyData);
    setPerformance(perfData);
    setPositions(posData);
    setInsights(getInsights(analyticsData, dailyData));
    setIsLoading(false);
  };

  const handleExport = async () => {
    const data = await exportUserData(user?.id || 'demo');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uptime-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview' as Tab, label: '개요', icon: BarChart3 },
    { id: 'trends' as Tab, label: '추이', icon: TrendingUp },
    { id: 'performance' as Tab, label: '성과', icon: Target },
    { id: 'compare' as Tab, label: '비교', icon: Users }
  ];

  const formatPlayTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 bg-dark-900 border border-dark-700 z-50 overflow-hidden flex flex-col rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">분석 대시보드</h2>
                  <p className="text-xs text-dark-400">게임 통계 및 성과 분석</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" />
                  내보내기
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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
                      ? 'text-primary-400 border-b-2 border-primary-400 bg-dark-800/50'
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
                  {activeTab === 'overview' && analytics && (
                    <div className="space-y-4">
                      {/* Key Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                          icon={Activity}
                          label="총 게임"
                          value={analytics.totalSessions.toString()}
                          color="primary"
                        />
                        <StatCard
                          icon={Clock}
                          label="총 플레이 시간"
                          value={formatPlayTime(analytics.totalPlayTime)}
                          color="purple"
                        />
                        <StatCard
                          icon={Zap}
                          label="평균 업타임"
                          value={`${analytics.averageUptime.toFixed(1)}%`}
                          color="success"
                        />
                        <StatCard
                          icon={Trophy}
                          label="최고 점수"
                          value={analytics.highScore.toLocaleString()}
                          color="warning"
                        />
                      </div>

                      {/* Insights */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success-400" />
                          인사이트
                        </h3>
                        <div className="space-y-2">
                          {insights.map((insight, idx) => (
                            <div key={idx} className="p-3 bg-dark-800 rounded-lg text-sm">
                              {insight}
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Streak & Milestones */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-dark-300 mb-3">연속 플레이</h3>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-primary-400">
                                {analytics.currentStreak}
                              </div>
                              <div className="text-xs text-dark-500">현재</div>
                            </div>
                            <div className="h-12 w-px bg-dark-700" />
                            <div className="text-center">
                              <div className="text-3xl font-bold text-warning-400">
                                {analytics.longestStreak}
                              </div>
                              <div className="text-xs text-dark-500">최장</div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <h3 className="text-sm font-medium text-dark-300 mb-3">최근 마일스톤</h3>
                          <div className="space-y-2">
                            {analytics.milestones.slice(-3).map((milestone) => (
                              <div key={milestone.id} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{milestone.icon}</span>
                                <span className="flex-1">{milestone.name}</span>
                                <span className="text-xs text-dark-500">
                                  {new Date(milestone.achievedAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                      {/* Detailed Stats */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-3">상세 통계</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">해결 티켓</div>
                            <div className="text-lg font-bold">{analytics.totalTicketsResolved.toLocaleString()}</div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">처리 이벤트</div>
                            <div className="text-lg font-bold">{analytics.totalEventsHandled.toLocaleString()}</div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">총 수익</div>
                            <div className="text-lg font-bold text-success-400">
                              ${analytics.totalMoneyEarned.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">최고 업타임</div>
                            <div className="text-lg font-bold text-primary-400">
                              {analytics.bestUptime.toFixed(2)}%
                            </div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">평균 세션</div>
                            <div className="text-lg font-bold">{analytics.averageSessionLength}분</div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-500 mb-1">총 점수</div>
                            <div className="text-lg font-bold">{analytics.totalScore.toLocaleString()}</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Trends Tab */}
                  {activeTab === 'trends' && (
                    <div className="space-y-4">
                      {/* Period Selector */}
                      <div className="flex gap-2">
                        {(['7d', '30d', '90d'] as const).map((period) => (
                          <button
                            key={period}
                            onClick={() => setTrendPeriod(period)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                              trendPeriod === period
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                            )}
                          >
                            {period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}
                          </button>
                        ))}
                      </div>

                      {/* Chart Placeholder */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">업타임 추이</h3>
                        <div className="h-48 flex items-end gap-1">
                          {dailyStats.slice(-(trendPeriod === '7d' ? 7 : trendPeriod === '30d' ? 30 : 90)).map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-primary-500/50 rounded-t hover:bg-primary-500 transition-colors"
                              style={{ height: `${stat.averageUptime}%` }}
                              title={`${stat.date}: ${stat.averageUptime.toFixed(1)}%`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-dark-500 mt-2">
                          <span>{dailyStats[0]?.date}</span>
                          <span>{dailyStats[dailyStats.length - 1]?.date}</span>
                        </div>
                      </Card>

                      {/* Score Trend */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">점수 추이</h3>
                        <div className="h-48 flex items-end gap-1">
                          {dailyStats.slice(-(trendPeriod === '7d' ? 7 : trendPeriod === '30d' ? 30 : 90)).map((stat, idx) => {
                            const maxScore = Math.max(...dailyStats.map(s => s.totalScore));
                            return (
                              <div
                                key={idx}
                                className="flex-1 bg-warning-500/50 rounded-t hover:bg-warning-500 transition-colors"
                                style={{ height: `${(stat.totalScore / maxScore) * 100}%` }}
                                title={`${stat.date}: ${stat.totalScore.toLocaleString()}`}
                              />
                            );
                          })}
                        </div>
                      </Card>

                      {/* Play Sessions */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">플레이 세션</h3>
                        <div className="h-32 flex items-end gap-1">
                          {dailyStats.slice(-30).map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-success-500/50 rounded-t hover:bg-success-500 transition-colors"
                              style={{ height: `${(stat.sessionsPlayed / 5) * 100}%` }}
                              title={`${stat.date}: ${stat.sessionsPlayed} 세션`}
                            />
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Performance Tab */}
                  {activeTab === 'performance' && performance && (
                    <div className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="p-3 text-center">
                          <div className="text-2xl font-bold text-success-400">
                            {performance.eventSuccessRate}%
                          </div>
                          <div className="text-xs text-dark-500">이벤트 성공률</div>
                        </Card>
                        <Card className="p-3 text-center">
                          <div className="text-2xl font-bold text-primary-400">
                            {performance.ticketResolutionRate}%
                          </div>
                          <div className="text-xs text-dark-500">티켓 해결률</div>
                        </Card>
                        <Card className="p-3 text-center">
                          <div className="text-2xl font-bold text-warning-400">
                            {performance.averagePhaseReached.toFixed(1)}
                          </div>
                          <div className="text-xs text-dark-500">평균 도달 단계</div>
                        </Card>
                        <Card className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {performance.improvementRate > 0 ? (
                              <TrendingUp className="w-5 h-5 text-success-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-danger-400" />
                            )}
                            <span className={cn(
                              'text-2xl font-bold',
                              performance.improvementRate > 0 ? 'text-success-400' : 'text-danger-400'
                            )}>
                              {Math.abs(performance.improvementRate)}%
                            </span>
                          </div>
                          <div className="text-xs text-dark-500">주간 향상률</div>
                        </Card>
                      </div>

                      {/* Uptime Distribution */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">업타임 분포</h3>
                        <div className="space-y-2">
                          {performance.uptimeDistribution.map((dist) => (
                            <div key={dist.range} className="flex items-center gap-3">
                              <span className="text-xs text-dark-500 w-20">{dist.range}</span>
                              <div className="flex-1 h-6 bg-dark-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                                  style={{ width: `${(dist.count / 127) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-dark-400 w-8">{dist.count}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Peak Hours */}
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">플레이 시간대</h3>
                        <div className="flex items-end gap-2 h-32">
                          {Array.from({ length: 24 }, (_, hour) => {
                            const data = performance.peakPlayHours.find(p => p.hour === hour);
                            const maxSessions = Math.max(...performance.peakPlayHours.map(p => p.sessions));
                            return (
                              <div
                                key={hour}
                                className={cn(
                                  'flex-1 rounded-t transition-colors',
                                  data ? 'bg-primary-500/50 hover:bg-primary-500' : 'bg-dark-800'
                                )}
                                style={{ height: data ? `${(data.sessions / maxSessions) * 100}%` : '5%' }}
                                title={`${hour}시: ${data?.sessions || 0} 세션`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-dark-500 mt-2">
                          <span>0시</span>
                          <span>12시</span>
                          <span>24시</span>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Compare Tab */}
                  {activeTab === 'compare' && (
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">리더보드 순위</h3>
                        <div className="space-y-3">
                          {positions.map((pos) => (
                            <div key={pos.category} className="p-3 bg-dark-800 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{pos.category}</span>
                                <span className="text-primary-400 font-bold">#{pos.rank}</span>
                              </div>
                              <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-1">
                                <div
                                  className="h-full bg-primary-500"
                                  style={{ width: `${pos.percentile}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-dark-500">
                                <span>상위 {(100 - pos.percentile).toFixed(1)}%</span>
                                <span>{pos.value.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="text-sm font-medium text-dark-300 mb-4">평균 대비 비교</h3>
                        {analytics && (
                          <div className="space-y-3">
                            <CompareBar label="업타임" yours={analytics.averageUptime} average={87.5} unit="%" />
                            <CompareBar label="세션당 점수" yours={analytics.highScore / analytics.totalSessions * 10} average={850} />
                            <CompareBar label="티켓 해결" yours={analytics.totalTicketsResolved / analytics.totalSessions} average={12} unit="/게임" />
                            <CompareBar label="연속 플레이" yours={analytics.longestStreak} average={5} unit="일" />
                          </div>
                        )}
                      </Card>
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

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'warning' | 'purple'
}) {
  const colors = {
    primary: 'text-primary-400 bg-primary-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <Card className="p-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-dark-500">{label}</div>
    </Card>
  );
}

// Compare Bar Component
function CompareBar({
  label,
  yours,
  average,
  unit = ''
}: {
  label: string;
  yours: number;
  average: number;
  unit?: string
}) {
  const max = Math.max(yours, average) * 1.2;
  const isAboveAverage = yours > average;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isAboveAverage ? 'text-success-400' : 'text-dark-400'}>
          {yours.toFixed(1)}{unit} {isAboveAverage ? '↑' : '↓'}
        </span>
      </div>
      <div className="relative h-4 bg-dark-800 rounded-full">
        <div
          className="absolute h-full bg-dark-600 rounded-full"
          style={{ width: `${(average / max) * 100}%` }}
        />
        <div
          className={cn(
            'absolute h-full rounded-full',
            isAboveAverage ? 'bg-success-500' : 'bg-warning-500'
          )}
          style={{ width: `${(yours / max) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
          style={{ left: `${(average / max) * 100}%` }}
        />
      </div>
      <div className="text-xs text-dark-500 text-right mt-0.5">
        평균: {average.toFixed(1)}{unit}
      </div>
    </div>
  );
}
