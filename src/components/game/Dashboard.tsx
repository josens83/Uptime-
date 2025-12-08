import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useGameStore } from '../../store/gameStore';
import { GameHeader } from './GameHeader';
import { UptimeGauge } from './UptimeGauge';
import { TicketQueue } from './TicketQueue';
import { ResourcePanel } from './ResourcePanel';
import { EventModal } from './EventModal';
import { PhaseProgress } from './PhaseProgress';
import { TeamManagement } from './TeamManagement';
import { UpgradeShop } from './UpgradeShop';
import { NotificationToast } from './Notifications';
import { GuildPanel } from './GuildPanel';
import { SeasonPanel } from './SeasonPanel';
import { MultiplayerLobby } from './MultiplayerLobby';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AchievementPanel } from './AchievementPanel';
import { Card, Badge, Modal } from '../ui';
import { PricingPage } from '../../pages/PricingPage';
import { Settings, Trophy, BarChart3, Shield, Medal, Users, Award, PieChart } from 'lucide-react';
import { cn } from '../../utils/helpers';

type Tab = 'tickets' | 'team' | 'upgrades' | 'stats';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [showPricing, setShowPricing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showSeason, setShowSeason] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Initialize game loop
  useGameLoop();

  const uptime = useGameStore(state => state.uptime);
  const currentEvent = useGameStore(state => state.currentEvent);
  const achievements = useGameStore(state => state.achievements);
  const resolvedTickets = useGameStore(state => state.resolvedTickets);
  const totalEarnings = useGameStore(state => state.totalEarnings);
  const peakUsers = useGameStore(state => state.peakUsers);

  const tabs: { id: Tab; name: string; icon?: React.ReactNode }[] = [
    { id: 'tickets', name: '티켓' },
    { id: 'team', name: '팀' },
    { id: 'upgrades', name: '업그레이드' },
    { id: 'stats', name: '통계', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <GameHeader
        onOpenSettings={() => setShowSettings(true)}
        onOpenPricing={() => setShowPricing(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Uptime & Resources */}
          <div className="lg:col-span-3 space-y-6">
            {/* Uptime Gauge */}
            <Card className="flex flex-col items-center py-6">
              <UptimeGauge value={uptime} size={180} />
            </Card>

            {/* Phase Progress */}
            <PhaseProgress />

            {/* Quick Access Buttons */}
            <Card className="p-3">
              <h4 className="text-xs text-dark-500 mb-2 uppercase tracking-wider">소셜</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowSeason(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors group"
                >
                  <Medal className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-dark-400">시즌</span>
                </button>
                <button
                  onClick={() => setShowGuild(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors group"
                >
                  <Shield className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-dark-400">길드</span>
                </button>
                <button
                  onClick={() => setShowMultiplayer(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors group"
                >
                  <Users className="w-5 h-5 text-success-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-dark-400">멀티</span>
                </button>
              </div>
            </Card>

            {/* Progress & Stats Buttons */}
            <Card className="p-3">
              <h4 className="text-xs text-dark-500 mb-2 uppercase tracking-wider">진행</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowAchievements(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors group"
                >
                  <Award className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-dark-400">업적</span>
                </button>
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors group"
                >
                  <PieChart className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-dark-400">분석</span>
                </button>
              </div>
            </Card>

            {/* Resources - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <ResourcePanel />
            </div>
          </div>

          {/* Center/Right column - Main content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Resources - Shown on mobile only */}
            <div className="lg:hidden">
              <ResourcePanel />
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                  )}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'tickets' && (
                <div className="h-[500px]">
                  <TicketQueue />
                </div>
              )}

              {activeTab === 'team' && (
                <TeamManagement />
              )}

              {activeTab === 'upgrades' && (
                <div className="h-[500px]">
                  <UpgradeShop />
                </div>
              )}

              {activeTab === 'stats' && (
                <StatsPanel
                  achievements={achievements.length}
                  resolvedTickets={resolvedTickets}
                  totalEarnings={totalEarnings}
                  peakUsers={peakUsers}
                />
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Event Modal */}
      {currentEvent && <EventModal />}

      {/* Notification Toast */}
      <NotificationToast />

      {/* Pricing Modal */}
      <Modal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        title="프리미엄 플랜"
        size="xl"
      >
        <PricingPage onClose={() => setShowPricing(false)} />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="설정"
        size="sm"
      >
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Modal>

      {/* Guild Panel */}
      <GuildPanel isOpen={showGuild} onClose={() => setShowGuild(false)} />

      {/* Season Panel */}
      <SeasonPanel isOpen={showSeason} onClose={() => setShowSeason(false)} />

      {/* Multiplayer Modal */}
      <Modal
        isOpen={showMultiplayer}
        onClose={() => setShowMultiplayer(false)}
        title="멀티플레이어"
        size="lg"
      >
        <MultiplayerLobby />
      </Modal>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

      {/* Achievement Panel */}
      <AchievementPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
    </div>
  );
}

// Stats Panel Component
function StatsPanel({
  achievements,
  resolvedTickets,
  totalEarnings,
  peakUsers
}: {
  achievements: number;
  resolvedTickets: number;
  totalEarnings: number;
  peakUsers: number;
}) {
  const gameState = useGameStore();

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-warning-400" />
        <h3 className="text-lg font-semibold text-dark-100">게임 통계</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
          <p className="text-2xl font-bold text-warning-400">{achievements}</p>
          <p className="text-xs text-dark-400">업적 달성</p>
        </div>
        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
          <p className="text-2xl font-bold text-success-400">{resolvedTickets}</p>
          <p className="text-xs text-dark-400">해결한 티켓</p>
        </div>
        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
          <p className="text-2xl font-bold text-primary-400">
            ${totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-dark-400">총 수익</p>
        </div>
        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {peakUsers.toLocaleString()}
          </p>
          <p className="text-xs text-dark-400">최고 사용자 수</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-dark-100">상세 통계</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">게임 일수</span>
            <span className="text-dark-100">{gameState.day}일</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">실패한 티켓</span>
            <span className="text-dark-100">{gameState.failedTickets}개</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">총 지출</span>
            <span className="text-dark-100">${gameState.totalSpent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">최고 업타임</span>
            <span className="text-dark-100">{gameState.longestUptime.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">팀 규모</span>
            <span className="text-dark-100">
              {gameState.team.developers + gameState.team.designers + gameState.team.marketers}명
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-dark-800/30">
            <span className="text-dark-400">보유 업그레이드</span>
            <span className="text-dark-100">{gameState.purchasedUpgrades.length}개</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Settings Panel Component
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const gameSpeed = useGameStore(state => state.gameSpeed);
  const setGameSpeed = useGameStore(state => state.setGameSpeed);
  const exportSave = useGameStore(state => state.exportSave);
  const importSave = useGameStore(state => state.importSave);

  const [importData, setImportData] = useState('');
  const [showImportResult, setShowImportResult] = useState<'success' | 'error' | null>(null);

  const handleExport = () => {
    const data = exportSave();
    navigator.clipboard.writeText(data);
    alert('저장 데이터가 클립보드에 복사되었습니다!');
  };

  const handleImport = () => {
    const result = importSave(importData);
    setShowImportResult(result ? 'success' : 'error');
    if (result) {
      setImportData('');
      setTimeout(() => {
        setShowImportResult(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-dark-100 mb-3">게임 설정</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">게임 속도</span>
            <select
              value={gameSpeed}
              onChange={(e) => setGameSpeed(Number(e.target.value))}
              className="input w-24 text-sm"
            >
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-dark-100 mb-3">저장 데이터</h4>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full btn-secondary text-sm"
          >
            저장 데이터 내보내기 (복사)
          </button>

          <div>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="저장 데이터를 붙여넣기..."
              className="input text-sm h-24 resize-none"
            />
            <button
              onClick={handleImport}
              disabled={!importData}
              className="w-full mt-2 btn-primary text-sm disabled:opacity-50"
            >
              저장 데이터 불러오기
            </button>
          </div>

          {showImportResult && (
            <p className={cn(
              'text-sm text-center',
              showImportResult === 'success' ? 'text-success-400' : 'text-danger-400'
            )}>
              {showImportResult === 'success' ? '✓ 불러오기 성공!' : '✗ 불러오기 실패'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
