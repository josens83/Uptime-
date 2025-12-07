import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  FastForward,
  Settings,
  Bell,
  Save,
  RotateCcw,
  LogOut,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { Button, Badge, Modal } from '../ui';
import { NotificationCenter } from './Notifications';
import { cn, formatGameTime, getPhaseIcon, getPhaseName } from '../../utils/helpers';

interface GameHeaderProps {
  onOpenSettings?: () => void;
  onOpenPricing?: () => void;
}

export function GameHeader({ onOpenSettings, onOpenPricing }: GameHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isPaused = useGameStore(state => state.isPaused);
  const gameSpeed = useGameStore(state => state.gameSpeed);
  const day = useGameStore(state => state.day);
  const hour = useGameStore(state => state.hour);
  const phase = useGameStore(state => state.phase);
  const notifications = useGameStore(state => state.notifications);
  const startGame = useGameStore(state => state.startGame);
  const pauseGame = useGameStore(state => state.pauseGame);
  const resumeGame = useGameStore(state => state.resumeGame);
  const setGameSpeed = useGameStore(state => state.setGameSpeed);
  const resetGame = useGameStore(state => state.resetGame);
  const exportSave = useGameStore(state => state.exportSave);

  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const isPremium = user?.subscription !== 'free';

  const maxSpeed = isPremium
    ? user?.subscription === 'enterprise' ? 3 : user?.subscription === 'pro' ? 2 : 1.5
    : 1;

  const handlePlayPause = () => {
    if (isPaused) {
      if (day === 1 && hour === 0) {
        startGame();
      } else {
        resumeGame();
      }
    } else {
      pauseGame();
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.5, 2, 3].filter(s => s <= maxSpeed);
    const currentIndex = speeds.indexOf(gameSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setGameSpeed(speeds[nextIndex]);
  };

  const handleExportSave = () => {
    const saveData = exportSave();
    navigator.clipboard.writeText(saveData);
    // You could also trigger a download here
  };

  const handleReset = () => {
    resetGame();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo & Phase */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gradient from-primary-400 to-purple-400 hidden sm:block">
                UPTIME
              </h1>

              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {getPhaseIcon(phase)} {getPhaseName(phase)}
                </Badge>
                <span className="text-sm text-dark-400 hidden sm:inline">
                  {formatGameTime(day, hour)}
                </span>
              </div>
            </div>

            {/* Center: Game controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isPaused ? 'success' : 'warning'}
                size="sm"
                onClick={handlePlayPause}
                leftIcon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">{isPaused ? '시작' : '일시정지'}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleSpeedChange}
                className={cn(!isPremium && gameSpeed >= maxSpeed && 'opacity-50')}
                leftIcon={<FastForward className="w-4 h-4" />}
              >
                {gameSpeed}x
              </Button>

              {!isPremium && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenPricing}
                  leftIcon={<Crown className="w-4 h-4 text-warning-400" />}
                  className="hidden sm:flex"
                >
                  업그레이드
                </Button>
              )}
            </div>

            {/* Right: User actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-danger-500 text-white text-xs rounded-full">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setShowMenu(true)}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors sm:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop menu items */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportSave}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  저장
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSettings}
                  leftIcon={<Settings className="w-4 h-4" />}
                />

                {user && (
                  <div className="flex items-center gap-2 pl-2 border-l border-dark-700">
                    <div className="text-right">
                      <p className="text-sm text-dark-100">{user.displayName}</p>
                      <p className="text-xs text-dark-500">{user.subscription}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      leftIcon={<LogOut className="w-4 h-4" />}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="알림"
        size="sm"
      >
        <NotificationCenter />
      </Modal>

      {/* Mobile Menu Modal */}
      <Modal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        showCloseButton={false}
        size="full"
        className="!rounded-none !max-h-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold">메뉴</h2>
            <button onClick={() => setShowMenu(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {user && (
              <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                <p className="font-medium text-dark-100">{user.displayName}</p>
                <p className="text-sm text-dark-400">{user.email}</p>
                <Badge variant={isPremium ? 'premium' : 'default'} className="mt-2">
                  {user.subscription.toUpperCase()}
                </Badge>
              </div>
            )}

            <Button fullWidth variant="secondary" onClick={handleExportSave}>
              <Save className="w-4 h-4 mr-2" />
              게임 저장
            </Button>

            <Button fullWidth variant="secondary" onClick={onOpenSettings}>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>

            {!isPremium && (
              <Button fullWidth variant="warning" onClick={onOpenPricing}>
                <Crown className="w-4 h-4 mr-2" />
                프리미엄 업그레이드
              </Button>
            )}

            <Button
              fullWidth
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              게임 초기화
            </Button>

            {user && (
              <Button fullWidth variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        size="sm"
      >
        <div className="text-center">
          <RotateCcw className="w-12 h-12 text-danger-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-100 mb-2">
            게임을 초기화하시겠습니까?
          </h3>
          <p className="text-dark-400 mb-6">
            모든 진행 상황이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleReset}>
              초기화
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
