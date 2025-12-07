import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Ticket } from '../../types';
import { Card, CardHeader, Badge, Button } from '../ui';
import { cn, formatTime } from '../../utils/helpers';
import { getSeverityBadge, getTypeIcon, getSeverityColor } from '../../data/tickets';

interface TicketCardProps {
  ticket: Ticket;
  onResolve: () => void;
}

function TicketCard({ ticket, onResolve }: TicketCardProps) {
  const progress = (ticket.timeLimit / ticket.maxTime) * 100;
  const isUrgent = ticket.timeLimit < 30;
  const isCritical = ticket.severity === 'critical';

  const getProgressColor = () => {
    if (progress > 50) return 'bg-success-500';
    if (progress > 25) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'p-4 rounded-lg border bg-dark-800/50',
        isCritical ? 'border-danger-600/50' : 'border-dark-700/50',
        isUrgent && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon(ticket.type)}</span>
          <div>
            <h4 className="font-medium text-dark-100 text-sm">{ticket.title}</h4>
            <p className="text-xs text-dark-400 line-clamp-1">{ticket.description}</p>
          </div>
        </div>
        <Badge variant={
          ticket.severity === 'critical' ? 'danger' :
          ticket.severity === 'high' ? 'warning' :
          ticket.severity === 'medium' ? 'info' : 'success'
        } size="sm">
          {ticket.severity.toUpperCase()}
        </Badge>
      </div>

      {/* Time progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={cn(
            'flex items-center gap-1',
            isUrgent ? 'text-danger-400' : 'text-dark-400'
          )}>
            <Clock className="w-3 h-3" />
            {formatTime(ticket.timeLimit)}
          </span>
          <span className="text-dark-500">${ticket.reward}</span>
        </div>
        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', getProgressColor())}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {ticket.uptimePenalty > 0 && (
            <span className="text-danger-400">
              -{ticket.uptimePenalty}% uptime
            </span>
          )}
          {ticket.penalty > 0 && (
            <span className="text-warning-400">
              -${ticket.penalty}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant={isCritical ? 'danger' : 'primary'}
          onClick={onResolve}
        >
          해결하기
        </Button>
      </div>
    </motion.div>
  );
}

export function TicketQueue() {
  const tickets = useGameStore(state => state.tickets);
  const resolveTicket = useGameStore(state => state.resolveTicket);
  const techDebt = useGameStore(state => state.techDebt);
  const team = useGameStore(state => state.team);

  const criticalCount = tickets.filter(t => t.severity === 'critical').length;
  const highCount = tickets.filter(t => t.severity === 'high').length;

  const handleResolve = (ticketId: string) => {
    // Add some tech debt when quickly resolving tickets
    const state = useGameStore.getState();
    if (Math.random() < 0.3) {
      state.updateTechDebt(2);
    }
    resolveTicket(ticketId);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="이슈 티켓"
        subtitle={`${tickets.length}개 대기 중`}
        icon={<AlertTriangle className="w-5 h-5 text-warning-400" />}
        action={
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="danger" dot pulse>
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="warning">
                {highCount} High
              </Badge>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-dark-500"
            >
              <CheckCircle className="w-12 h-12 mb-2" />
              <p className="text-sm">모든 이슈가 해결되었습니다!</p>
            </motion.div>
          ) : (
            tickets
              .sort((a, b) => {
                // Sort by severity first, then by time remaining
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                if (severityDiff !== 0) return severityDiff;
                return a.timeLimit - b.timeLimit;
              })
              .map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onResolve={() => handleResolve(ticket.id)}
                />
              ))
          )}
        </AnimatePresence>
      </div>

      {/* Team efficiency indicator */}
      <div className="mt-4 pt-3 border-t border-dark-700">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>팀 처리 능력</span>
          <span className="text-dark-300">
            {team.developers}명 개발자 | 최대 {3 + Math.floor(team.developers / 2)}개 동시 처리
          </span>
        </div>
        {techDebt > 50 && (
          <div className="mt-2 p-2 rounded bg-warning-900/20 border border-warning-700/30">
            <p className="text-xs text-warning-400">
              ⚠️ 기술 부채가 높아 버그 발생 확률이 증가했습니다
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
