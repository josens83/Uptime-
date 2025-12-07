import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Trophy,
  Crown,
  Star,
  Search,
  Plus,
  Settings,
  LogOut,
  UserPlus,
  ChevronRight,
  Award,
  TrendingUp,
  X
} from 'lucide-react';
import { Button, Card } from '../ui';
import { cn } from '../../utils/helpers';
import {
  Guild,
  GuildMember,
  getGuild,
  getTopGuilds,
  searchGuilds,
  createGuild,
  joinGuild,
  leaveGuild,
  getGuildLevel,
  getGuildLevelProgress
} from '../../services/guildService';
import { useAuthStore } from '../../store/authStore';

interface GuildPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'my-guild' | 'browse' | 'create';

export function GuildPanel({ isOpen, onClose }: GuildPanelProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [topGuilds, setTopGuilds] = useState<Guild[]>([]);
  const [searchResults, setSearchResults] = useState<Guild[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create guild form
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildTag, setNewGuildTag] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [newGuildIcon, setNewGuildIcon] = useState('🏰');

  const guildIcons = ['🏰', '⚔️', '🛡️', '🎮', '🚀', '💎', '🔥', '⭐', '🌟', '👑', '🎯', '💪'];

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    setIsLoading(true);
    const guilds = await getTopGuilds(10);
    setTopGuilds(guilds);

    // Check if user has a guild (demo check)
    if (user?.username) {
      // In real implementation, check user's guildId
      // For demo, show first guild as "my guild"
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    const results = await searchGuilds(searchTerm);
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleCreateGuild = async () => {
    if (!user || !newGuildName.trim() || !newGuildTag.trim()) return;

    setIsLoading(true);
    const guildId = await createGuild(
      user.id || 'demo-user',
      user.username,
      {
        name: newGuildName,
        description: newGuildDesc,
        tag: newGuildTag,
        icon: newGuildIcon
      }
    );

    if (guildId) {
      setShowCreateForm(false);
      setNewGuildName('');
      setNewGuildTag('');
      setNewGuildDesc('');
      await loadGuilds();
      setActiveTab('my-guild');
    }
    setIsLoading(false);
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!user) return;

    setIsLoading(true);
    const success = await joinGuild(guildId, user.id || 'demo-user', user.username);
    if (success) {
      await loadGuilds();
      setActiveTab('my-guild');
    }
    setIsLoading(false);
  };

  const handleLeaveGuild = async () => {
    if (!user || !myGuild) return;

    const success = await leaveGuild(myGuild.id, user.id || 'demo-user');
    if (success) {
      setMyGuild(null);
      setActiveTab('browse');
    }
  };

  const tabs = [
    { id: 'my-guild' as Tab, label: '내 길드', icon: Shield },
    { id: 'browse' as Tab, label: '길드 찾기', icon: Search },
    { id: 'create' as Tab, label: '길드 생성', icon: Plus }
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
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-dark-900 border-l border-dark-700 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">길드</h2>
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
              {/* My Guild Tab */}
              {activeTab === 'my-guild' && (
                <div className="space-y-4">
                  {myGuild ? (
                    <>
                      {/* Guild Header */}
                      <Card className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{myGuild.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold">{myGuild.name}</h3>
                              <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-bold rounded">
                                [{myGuild.tag}]
                              </span>
                            </div>
                            <p className="text-sm text-dark-400 mt-1">{myGuild.description}</p>

                            {/* Level Progress */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-dark-400">레벨 {myGuild.level}</span>
                                <span className="text-dark-500">{myGuild.experience} XP</span>
                              </div>
                              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500"
                                  style={{ width: `${getGuildLevelProgress(myGuild.experience)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Guild Stats */}
                      <Card className="p-4">
                        <h4 className="text-sm font-medium text-dark-300 mb-3">길드 통계</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                              <Trophy className="w-3 h-3" />
                              주간 점수
                            </div>
                            <div className="text-lg font-bold text-yellow-400">
                              {myGuild.stats.weeklyScore.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                              <Award className="w-3 h-3" />
                              길드 순위
                            </div>
                            <div className="text-lg font-bold text-primary-400">
                              #{myGuild.stats.rank}
                            </div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                              <TrendingUp className="w-3 h-3" />
                              평균 업타임
                            </div>
                            <div className="text-lg font-bold text-success-400">
                              {myGuild.stats.averageUptime}%
                            </div>
                          </div>
                          <div className="p-3 bg-dark-800 rounded-lg">
                            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                              <Users className="w-3 h-3" />
                              멤버
                            </div>
                            <div className="text-lg font-bold">
                              {myGuild.members.length}/50
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Members List */}
                      <Card className="p-4">
                        <h4 className="text-sm font-medium text-dark-300 mb-3">멤버 목록</h4>
                        <div className="space-y-2">
                          {myGuild.members.map((member) => (
                            <MemberRow key={member.id} member={member} />
                          ))}
                        </div>
                      </Card>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1"
                          leftIcon={<Settings className="w-4 h-4" />}
                        >
                          설정
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-danger-400"
                          leftIcon={<LogOut className="w-4 h-4" />}
                          onClick={handleLeaveGuild}
                        >
                          탈퇴
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-dark-300 mb-2">
                        소속된 길드가 없습니다
                      </h3>
                      <p className="text-sm text-dark-500 mb-6">
                        길드에 가입하거나 새로운 길드를 만들어보세요!
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => setActiveTab('browse')}
                        >
                          길드 찾기
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setActiveTab('create')}
                        >
                          길드 생성
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Browse Guilds Tab */}
              {activeTab === 'browse' && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="길드 이름 또는 태그 검색..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={handleSearch} disabled={isLoading}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Search Results or Top Guilds */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-400 mb-3">
                      {searchResults.length > 0 ? '검색 결과' : '인기 길드'}
                    </h4>
                    <div className="space-y-2">
                      {(searchResults.length > 0 ? searchResults : topGuilds).map((guild) => (
                        <GuildRow
                          key={guild.id}
                          guild={guild}
                          onJoin={() => handleJoinGuild(guild.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Create Guild Tab */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="text-lg font-medium mb-4">새 길드 만들기</h4>

                    {/* Icon Selection */}
                    <div className="mb-4">
                      <label className="text-sm text-dark-400 mb-2 block">길드 아이콘</label>
                      <div className="flex flex-wrap gap-2">
                        {guildIcons.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewGuildIcon(icon)}
                            className={cn(
                              'w-10 h-10 text-xl rounded-lg transition-all',
                              newGuildIcon === icon
                                ? 'bg-primary-500/20 border-2 border-primary-500'
                                : 'bg-dark-800 border-2 border-transparent hover:border-dark-600'
                            )}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="text-sm text-dark-400 mb-2 block">길드 이름</label>
                      <input
                        type="text"
                        placeholder="길드 이름 입력..."
                        value={newGuildName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuildName(e.target.value)}
                        maxLength={20}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Tag */}
                    <div className="mb-4">
                      <label className="text-sm text-dark-400 mb-2 block">길드 태그 (2-4자)</label>
                      <input
                        type="text"
                        placeholder="예: UPT"
                        value={newGuildTag}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuildTag(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="text-sm text-dark-400 mb-2 block">길드 소개</label>
                      <textarea
                        placeholder="길드 소개를 입력하세요..."
                        value={newGuildDesc}
                        onChange={(e) => setNewGuildDesc(e.target.value)}
                        maxLength={100}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-20"
                      />
                    </div>

                    {/* Preview */}
                    <div className="mb-4 p-4 bg-dark-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{newGuildIcon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{newGuildName || '길드 이름'}</span>
                            <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-bold rounded">
                              [{newGuildTag || 'TAG'}]
                            </span>
                          </div>
                          <p className="text-sm text-dark-400 mt-1">
                            {newGuildDesc || '길드 소개가 여기에 표시됩니다'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleCreateGuild}
                      disabled={isLoading || !newGuildName.trim() || newGuildTag.length < 2}
                    >
                      길드 생성하기
                    </Button>

                    <p className="text-xs text-dark-500 text-center mt-2">
                      길드 생성에는 1,000 코인이 필요합니다
                    </p>
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

// Guild Row Component
function GuildRow({ guild, onJoin }: { guild: Guild; onJoin: () => void }) {
  return (
    <Card className="p-3 hover:bg-dark-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{guild.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{guild.name}</span>
            <span className="px-1.5 py-0.5 bg-dark-700 text-dark-300 text-xs font-bold rounded">
              [{guild.tag}]
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark-500 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {guild.members.length}/50
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Lv.{guild.level}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              #{guild.stats.rank}
            </span>
          </div>
        </div>
        <Button size="sm" onClick={onJoin}>
          가입
        </Button>
      </div>
    </Card>
  );
}

// Member Row Component
function MemberRow({ member }: { member: GuildMember }) {
  const roleColors = {
    leader: 'text-yellow-400',
    officer: 'text-blue-400',
    member: 'text-dark-400'
  };

  const roleIcons = {
    leader: Crown,
    officer: Star,
    member: Users
  };

  const RoleIcon = roleIcons[member.role];

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition-colors">
      <div className={cn('p-1.5 rounded-lg bg-dark-800', roleColors[member.role])}>
        <RoleIcon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{member.name}</div>
        <div className="text-xs text-dark-500">
          기여도: {member.contribution.toLocaleString()}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-dark-600" />
    </div>
  );
}
