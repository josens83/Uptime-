import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Notification } from '../../types';
import { cn, timeAgo } from '../../utils/helpers';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const icons = {
    info: <Info className="w-4 h-4 text-primary-400" />,
    success: <CheckCircle className="w-4 h-4 text-success-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning-400" />,
    error: <XCircle className="w-4 h-4 text-danger-400" />
  };

  const bgColors = {
    info: 'bg-primary-900/20 border-primary-700/30',
    success: 'bg-success-900/20 border-success-700/30',
    warning: 'bg-warning-900/20 border-warning-700/30',
    error: 'bg-danger-900/20 border-danger-700/30'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={cn(
        'p-3 rounded-lg border backdrop-blur-sm',
        bgColors[notification.type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-100 truncate">
            {notification.title}
          </p>
          <p className="text-xs text-dark-400 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-dark-500 mt-1">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-dark-700 text-dark-500 hover:text-dark-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationToast() {
  const notifications = useGameStore(state => state.notifications);
  const markNotificationRead = useGameStore(state => state.markNotificationRead);

  // Show only the 3 most recent unread notifications
  const unreadNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {unreadNotifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onDismiss={() => markNotificationRead(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationCenter() {
  const notifications = useGameStore(state => state.notifications);
  const clearNotifications = useGameStore(state => state.clearNotifications);
  const markNotificationRead = useGameStore(state => state.markNotificationRead);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-dark-400" />
          <h3 className="font-medium text-dark-100">알림</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-dark-400 hover:text-dark-200"
          >
            모두 지우기
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-dark-500"
            >
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">알림이 없습니다</p>
            </motion.div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={() => markNotificationRead(notification.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
