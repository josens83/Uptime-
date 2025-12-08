import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Shield,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  AlertTriangle,
  Bell,
  Clock,
  DollarSign,
  Activity,
  FileText
} from 'lucide-react';
import { Button, Card, Modal } from '../ui';
import { cn } from '../../utils/helpers';
import {
  UserListItem,
  GameEvent,
  SystemStats,
  PaymentRecord,
  AuditLog,
  GameSettings,
  QuickStat,
  getUsers,
  updateUserStatus,
  getGameEvents,
  createGameEvent,
  deleteGameEvent,
  getSystemStats,
  getPayments,
  refundPayment,
  getAuditLogs,
  getGameSettings,
  updateGameSettings,
  getQuickStats
} from '../../services/adminService';

type Tab = 'dashboard' | 'users' | 'events' | 'payments' | 'settings' | 'logs';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('');

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);

    switch (activeTab) {
      case 'dashboard':
        setQuickStats(await getQuickStats());
        break;
      case 'users':
        const { users: userList } = await getUsers(1, 50, { status: userStatusFilter, search: userSearch });
        setUsers(userList);
        break;
      case 'events':
        setEvents(await getGameEvents());
        break;
      case 'payments':
        const { payments: paymentList } = await getPayments(1, 50);
        setPayments(paymentList);
        break;
      case 'settings':
        setSettings(await getGameSettings());
        break;
      case 'logs':
        setAuditLogs(await getAuditLogs(100));
        break;
    }

    setIsLoading(false);
  };

  const handleUserStatusChange = async (userId: string, status: 'active' | 'banned' | 'suspended') => {
    const success = await updateUserStatus(userId, status);
    if (success) {
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
    }
  };

  const handleCreateEvent = async (event: Omit<GameEvent, 'id' | 'createdAt'>) => {
    await createGameEvent(event);
    setShowEventModal(false);
    setEditingEvent(null);
    loadData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      await deleteGameEvent(eventId);
      loadData();
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (confirm('정말로 환불 처리하시겠습니까?')) {
      await refundPayment(paymentId);
      loadData();
    }
  };

  const handleSettingsUpdate = async (updates: Partial<GameSettings>) => {
    const success = await updateGameSettings(updates);
    if (success && settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: '대시보드', icon: LayoutDashboard },
    { id: 'users' as Tab, label: '사용자', icon: Users },
    { id: 'events' as Tab, label: '이벤트', icon: Calendar },
    { id: 'payments' as Tab, label: '결제', icon: CreditCard },
    { id: 'settings' as Tab, label: '설정', icon: Settings },
    { id: 'logs' as Tab, label: '로그', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-400" />
            <div>
              <h1 className="text-xl font-bold">관리자 패널</h1>
              <p className="text-xs text-dark-400">Uptime Game Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost">
              <Bell className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-dark-900 border-r border-dark-700 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">대시보드</h2>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickStats.slice(0, 4).map((stat, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="text-sm text-dark-400 mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {stat.change !== undefined && (
                          <div className={cn(
                            'text-xs flex items-center gap-1 mt-1',
                            stat.change >= 0 ? 'text-success-400' : 'text-danger-400'
                          )}>
                            {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(stat.change)}% {stat.changeLabel}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickStats.slice(4).map((stat, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="text-xs text-dark-500">{stat.label}</div>
                        <div className="text-lg font-bold">{stat.value}</div>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">빠른 작업</h3>
                    <div className="flex gap-3 flex-wrap">
                      <Button onClick={() => { setActiveTab('events'); setShowEventModal(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        새 이벤트
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveTab('users')}>
                        <Users className="w-4 h-4 mr-2" />
                        사용자 관리
                      </Button>
                      <Button variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        리포트 다운로드
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">사용자 관리</h2>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                          type="text"
                          placeholder="검색..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm"
                        />
                      </div>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm"
                      >
                        <option value="">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="suspended">정지</option>
                        <option value="banned">차단</option>
                      </select>
                      <Button onClick={loadData}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Card className="overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-dark-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">사용자</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">상태</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">프리미엄</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">게임 수</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">결제액</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">가입일</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-dark-800/50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-xs text-dark-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="px-4 py-3">
                              {user.isPremium ? (
                                <span className="text-yellow-400">★</span>
                              ) : (
                                <span className="text-dark-600">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">{user.totalGames}</td>
                            <td className="px-4 py-3">${user.totalSpent}</td>
                            <td className="px-4 py-3 text-sm text-dark-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {user.status === 'active' && (
                                  <button
                                    onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                    className="p-1 hover:bg-dark-700 rounded"
                                    title="정지"
                                  >
                                    <AlertTriangle className="w-4 h-4 text-warning-400" />
                                  </button>
                                )}
                                {user.status !== 'banned' && (
                                  <button
                                    onClick={() => handleUserStatusChange(user.id, 'banned')}
                                    className="p-1 hover:bg-dark-700 rounded"
                                    title="차단"
                                  >
                                    <Ban className="w-4 h-4 text-danger-400" />
                                  </button>
                                )}
                                {user.status !== 'active' && (
                                  <button
                                    onClick={() => handleUserStatusChange(user.id, 'active')}
                                    className="p-1 hover:bg-dark-700 rounded"
                                    title="활성화"
                                  >
                                    <CheckCircle className="w-4 h-4 text-success-400" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">이벤트 관리</h2>
                    <Button onClick={() => setShowEventModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      새 이벤트
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {events.map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              event.type === 'announcement' && 'bg-primary-500/10 text-primary-400',
                              event.type === 'event' && 'bg-success-500/10 text-success-400',
                              event.type === 'maintenance' && 'bg-warning-500/10 text-warning-400',
                              event.type === 'update' && 'bg-purple-500/10 text-purple-400'
                            )}>
                              {event.type === 'announcement' && <Bell className="w-5 h-5" />}
                              {event.type === 'event' && <Calendar className="w-5 h-5" />}
                              {event.type === 'maintenance' && <AlertTriangle className="w-5 h-5" />}
                              {event.type === 'update' && <Activity className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{event.title}</h3>
                                {event.active && (
                                  <span className="px-2 py-0.5 bg-success-500/20 text-success-400 text-xs rounded">활성</span>
                                )}
                              </div>
                              <p className="text-sm text-dark-400 mt-1">{event.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(event.startAt).toLocaleString()}
                                </span>
                                {event.endAt && (
                                  <span>~ {new Date(event.endAt).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                              className="p-2 hover:bg-dark-700 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 hover:bg-dark-700 rounded text-danger-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">결제 관리</h2>

                  <Card className="overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-dark-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">사용자</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">상품</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">금액</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">상태</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">일시</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-dark-800/50">
                            <td className="px-4 py-3 text-sm font-mono">{payment.id}</td>
                            <td className="px-4 py-3 text-sm">{payment.userEmail}</td>
                            <td className="px-4 py-3 text-sm">{payment.productName}</td>
                            <td className="px-4 py-3 text-sm font-medium">${payment.amount}</td>
                            <td className="px-4 py-3">
                              <PaymentStatusBadge status={payment.status} />
                            </td>
                            <td className="px-4 py-3 text-sm text-dark-400">
                              {new Date(payment.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              {payment.status === 'completed' && (
                                <Button size="sm" variant="ghost" onClick={() => handleRefund(payment.id)}>
                                  환불
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && settings && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">게임 설정</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">시스템</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">점검 모드</div>
                            <div className="text-sm text-dark-500">서버 점검 시 활성화</div>
                          </div>
                          <button
                            onClick={() => handleSettingsUpdate({ maintenanceMode: !settings.maintenanceMode })}
                            className={cn(
                              'w-12 h-6 rounded-full transition-colors relative',
                              settings.maintenanceMode ? 'bg-danger-500' : 'bg-dark-700'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                              settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                            )} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">회원가입</div>
                            <div className="text-sm text-dark-500">신규 회원가입 허용</div>
                          </div>
                          <button
                            onClick={() => handleSettingsUpdate({ registrationEnabled: !settings.registrationEnabled })}
                            className={cn(
                              'w-12 h-6 rounded-full transition-colors relative',
                              settings.registrationEnabled ? 'bg-success-500' : 'bg-dark-700'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                              settings.registrationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            )} />
                          </button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">게임 밸런스</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-dark-400">이벤트 배율</label>
                          <input
                            type="number"
                            value={settings.eventMultiplier}
                            onChange={(e) => handleSettingsUpdate({ eventMultiplier: parseFloat(e.target.value) })}
                            step="0.1"
                            min="0.1"
                            max="10"
                            className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-dark-400">프리미엄 보너스 배율</label>
                          <input
                            type="number"
                            value={settings.premiumBonusMultiplier}
                            onChange={(e) => handleSettingsUpdate({ premiumBonusMultiplier: parseFloat(e.target.value) })}
                            step="0.1"
                            min="1"
                            max="5"
                            className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-dark-400">방 최대 인원</label>
                          <input
                            type="number"
                            value={settings.maxPlayersPerRoom}
                            onChange={(e) => handleSettingsUpdate({ maxPlayersPerRoom: parseInt(e.target.value) })}
                            min="2"
                            max="20"
                            className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">감사 로그</h2>

                  <Card className="overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-dark-800 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">시간</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">관리자</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">작업</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">대상</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-dark-400">상세</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-dark-800/50">
                              <td className="px-4 py-3 text-sm text-dark-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm">{log.adminEmail}</td>
                              <td className="px-4 py-3">
                                <ActionBadge action={log.action} />
                              </td>
                              <td className="px-4 py-3 text-sm">{log.target}</td>
                              <td className="px-4 py-3 text-sm text-dark-400">{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        title={editingEvent ? '이벤트 수정' : '새 이벤트'}
      >
        <EventForm
          event={editingEvent}
          onSubmit={handleCreateEvent}
          onCancel={() => { setShowEventModal(false); setEditingEvent(null); }}
        />
      </Modal>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-success-500/20 text-success-400',
    suspended: 'bg-warning-500/20 text-warning-400',
    banned: 'bg-danger-500/20 text-danger-400'
  };

  return (
    <span className={cn('px-2 py-1 text-xs rounded', styles[status as keyof typeof styles])}>
      {status === 'active' ? '활성' : status === 'suspended' ? '정지' : '차단'}
    </span>
  );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-success-500/20 text-success-400',
    pending: 'bg-warning-500/20 text-warning-400',
    failed: 'bg-danger-500/20 text-danger-400',
    refunded: 'bg-purple-500/20 text-purple-400'
  };

  const labels = {
    completed: '완료',
    pending: '대기',
    failed: '실패',
    refunded: '환불'
  };

  return (
    <span className={cn('px-2 py-1 text-xs rounded', styles[status as keyof typeof styles])}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

// Action Badge
function ActionBadge({ action }: { action: string }) {
  const getStyle = () => {
    if (action.includes('banned') || action.includes('delete')) return 'bg-danger-500/20 text-danger-400';
    if (action.includes('created') || action.includes('activated')) return 'bg-success-500/20 text-success-400';
    if (action.includes('updated')) return 'bg-primary-500/20 text-primary-400';
    return 'bg-dark-700 text-dark-400';
  };

  return (
    <span className={cn('px-2 py-1 text-xs rounded', getStyle())}>
      {action}
    </span>
  );
}

// Event Form
function EventForm({
  event,
  onSubmit,
  onCancel
}: {
  event: GameEvent | null;
  onSubmit: (event: Omit<GameEvent, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<GameEvent['type']>(event?.type || 'announcement');
  const [title, setTitle] = useState(event?.title || '');
  const [content, setContent] = useState(event?.content || '');
  const [startAt, setStartAt] = useState(
    event?.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : ''
  );
  const [endAt, setEndAt] = useState(
    event?.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : ''
  );
  const [active, setActive] = useState(event?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      title,
      content,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : undefined,
      active,
      createdBy: 'admin'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-dark-400">유형</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as GameEvent['type'])}
          className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
        >
          <option value="announcement">공지사항</option>
          <option value="event">이벤트</option>
          <option value="maintenance">점검</option>
          <option value="update">업데이트</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-dark-400">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm text-dark-400">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-dark-400">시작 시간</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm text-dark-400">종료 시간 (선택)</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="text-sm">활성화</label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>취소</Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
