import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  RefreshCw,
  Play,
  Crown,
  Check,
  X,
  Clock,
  Swords,
  Trophy,
  Settings
} from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import {
  MultiplayerRoom,
  RoomSettings,
  getAvailableRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  setPlayerReady,
  startMatch,
  subscribeToRoom
} from '../../services/multiplayerService';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/helpers';

interface MultiplayerLobbyProps {
  onStartMatch?: (roomId: string) => void;
  onClose?: () => void;
}

type View = 'list' | 'create' | 'room';

export function MultiplayerLobby({ onStartMatch, onClose }: MultiplayerLobbyProps) {
  const [view, setView] = useState<View>('list');
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create room form
  const [roomName, setRoomName] = useState('');
  const [settings, setSettings] = useState<RoomSettings>({
    duration: 10,
    startingMoney: 1000,
    startingUsers: 100,
    difficulty: 'normal',
    allowSpectators: true
  });

  const { user } = useAuthStore();

  useEffect(() => {
    if (view === 'list') {
      loadRooms();
    }
  }, [view]);

  useEffect(() => {
    if (currentRoom?.id) {
      const unsubscribe = subscribeToRoom(currentRoom.id, (room) => {
        if (room) {
          setCurrentRoom(room);
          if (room.status === 'playing') {
            onStartMatch?.(room.id);
          }
        } else {
          setCurrentRoom(null);
          setView('list');
        }
      });
      return unsubscribe;
    }
  }, [currentRoom?.id]);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const availableRooms = await getAvailableRooms();
      setRooms(availableRooms);
    } catch (err) {
      setError('방 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !roomName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const roomId = await createRoom(
        user.id,
        user.username || user.email,
        roomName.trim(),
        settings
      );

      if (roomId) {
        setCurrentRoom({
          id: roomId,
          name: roomName,
          hostId: user.id,
          hostName: user.username || user.email,
          status: 'waiting',
          maxPlayers: settings.difficulty === 'easy' ? 4 : 6,
          players: [{
            id: user.id,
            name: user.username || user.email,
            isHost: true,
            isReady: true,
            score: 0,
            uptime: 100,
            day: 0,
            status: 'waiting',
            lastUpdate: new Date()
          }],
          settings,
          createdAt: new Date()
        });
        setView('room');
      }
    } catch (err) {
      setError('방 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (room: MultiplayerRoom) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await joinRoom(room.id, user.id, user.username || user.email);
      if (success) {
        setCurrentRoom(room);
        setView('room');
      } else {
        setError('방에 참가할 수 없습니다.');
      }
    } catch (err) {
      setError('방 참가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !user) return;

    await leaveRoom(currentRoom.id, user.id);
    setCurrentRoom(null);
    setView('list');
  };

  const handleToggleReady = async () => {
    if (!currentRoom || !user) return;

    const player = currentRoom.players.find(p => p.id === user.id);
    if (player) {
      await setPlayerReady(currentRoom.id, user.id, !player.isReady);
    }
  };

  const handleStartGame = async () => {
    if (!currentRoom) return;

    const success = await startMatch(currentRoom.id);
    if (!success) {
      setError('모든 플레이어가 준비되어야 합니다.');
    }
  };

  const isHost = currentRoom?.hostId === user?.id;
  const currentPlayer = currentRoom?.players.find(p => p.id === user?.id);
  const allReady = currentRoom?.players.every(p => p.isReady) ?? false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Swords className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-100">멀티플레이어</h2>
            <p className="text-sm text-dark-400">
              {view === 'list' && '다른 플레이어와 경쟁하세요'}
              {view === 'create' && '새로운 방 만들기'}
              {view === 'room' && currentRoom?.name}
            </p>
          </div>
        </div>

        {view !== 'list' && (
          <Button variant="ghost" size="sm" onClick={() => {
            if (view === 'room') handleLeaveRoom();
            else setView('list');
          }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-900/20 border border-danger-700/30">
          <p className="text-sm text-danger-400">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Room List View */}
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setView('create')}
              >
                방 만들기
              </Button>
              <Button
                variant="ghost"
                leftIcon={<RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />}
                onClick={loadRooms}
                disabled={isLoading}
              >
                새로고침
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rooms.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                  <p className="text-dark-400">열린 방이 없습니다</p>
                  <p className="text-sm text-dark-500 mt-1">새로운 방을 만들어보세요!</p>
                </Card>
              ) : (
                rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="p-4 hover:border-dark-600 cursor-pointer transition-all"
                    onClick={() => handleJoinRoom(room)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-dark-100">{room.name}</h3>
                          <Badge
                            variant={room.settings.difficulty === 'easy' ? 'success' : room.settings.difficulty === 'hard' ? 'danger' : 'info'}
                            size="sm"
                          >
                            {room.settings.difficulty === 'easy' ? '쉬움' : room.settings.difficulty === 'hard' ? '어려움' : '보통'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-dark-400">
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            {room.hostName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {room.settings.duration}분
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-dark-200">
                          <Users className="w-4 h-4" />
                          <span>{room.players.length}/{room.maxPlayers}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          참가
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Create Room View */}
        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">방 이름</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="방 이름을 입력하세요"
                  className="input w-full"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-2">난이도</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'normal', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSettings({ ...settings, difficulty: diff })}
                      className={cn(
                        'p-2 rounded-lg border text-sm transition-all',
                        settings.difficulty === diff
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-dark-700 text-dark-400 hover:border-dark-600'
                      )}
                    >
                      {diff === 'easy' ? '쉬움' : diff === 'hard' ? '어려움' : '보통'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-400 mb-1">
                  게임 시간: {settings.duration}분
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={settings.duration}
                  onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setView('list')} className="flex-1">
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || isLoading}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  방 만들기
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Room View */}
        {view === 'room' && currentRoom && (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Room Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-400">게임 설정</span>
                </div>
                <Badge variant="info">{currentRoom.settings.duration}분</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-dark-500">시작 자금</p>
                  <p className="text-dark-200">${currentRoom.settings.startingMoney}</p>
                </div>
                <div>
                  <p className="text-dark-500">시작 사용자</p>
                  <p className="text-dark-200">{currentRoom.settings.startingUsers}명</p>
                </div>
                <div>
                  <p className="text-dark-500">난이도</p>
                  <p className="text-dark-200">
                    {currentRoom.settings.difficulty === 'easy' ? '쉬움' : currentRoom.settings.difficulty === 'hard' ? '어려움' : '보통'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Players */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-dark-400">플레이어</span>
                <span className="text-sm text-dark-400">
                  {currentRoom.players.length}/{currentRoom.maxPlayers}
                </span>
              </div>
              <div className="space-y-2">
                {currentRoom.players.map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      player.id === user?.id ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-800'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                      <span className="text-dark-100">{player.name}</span>
                      {player.id === user?.id && (
                        <Badge variant="info" size="sm">나</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isReady ? (
                        <Badge variant="success" size="sm">
                          <Check className="w-3 h-3 mr-1" />
                          준비완료
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">대기중</Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center justify-center p-3 rounded-lg bg-dark-800/50 border border-dashed border-dark-700">
                    <span className="text-sm text-dark-500">빈 슬롯</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleLeaveRoom} className="flex-1">
                나가기
              </Button>
              {isHost ? (
                <Button
                  variant="success"
                  onClick={handleStartGame}
                  disabled={!allReady || currentRoom.players.length < 2}
                  leftIcon={<Play className="w-4 h-4" />}
                  className="flex-1"
                >
                  게임 시작
                </Button>
              ) : (
                <Button
                  variant={currentPlayer?.isReady ? 'warning' : 'primary'}
                  onClick={handleToggleReady}
                  className="flex-1"
                >
                  {currentPlayer?.isReady ? '준비 취소' : '준비 완료'}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {onClose && (
        <Button variant="ghost" fullWidth onClick={onClose}>
          닫기
        </Button>
      )}
    </div>
  );
}
