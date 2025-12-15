import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { errorService, ProcessedError } from '../../services/errorService';

/**
 * Global Error Toast Component
 * Displays user-friendly error notifications
 */

interface ToastItem {
  id: string;
  error: ProcessedError;
  visible: boolean;
}

const TOAST_DURATION = 5000; // 5 seconds
const MAX_TOASTS = 3;

export function ErrorToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, visible: false } : t
    ));

    // Actually remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const unsubscribe = errorService.subscribe((error) => {
      // Only show toasts for medium+ severity
      if (error.severity === 'low') return;

      const newToast: ToastItem = {
        id: error.id,
        error,
        visible: true,
      };

      setToasts(prev => {
        const updated = [newToast, ...prev].slice(0, MAX_TOASTS);
        return updated;
      });

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(error.id);
      }, TOAST_DURATION);
    });

    return unsubscribe;
  }, [removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: toast.visible ? 1 : 0, x: toast.visible ? 0 : 100, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ToastCard error={toast.error} onClose={() => removeToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  error: ProcessedError;
  onClose: () => void;
}

function ToastCard({ error, onClose }: ToastCardProps) {
  const severityStyles = {
    low: 'bg-gray-800 border-gray-600',
    medium: 'bg-yellow-900/50 border-yellow-600',
    high: 'bg-orange-900/50 border-orange-600',
    critical: 'bg-red-900/50 border-red-600',
  };

  const severityIcons = {
    low: (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    medium: (
      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    high: (
      <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    critical: (
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`rounded-lg border shadow-lg backdrop-blur-sm p-4 ${severityStyles[error.severity]}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {severityIcons[error.severity]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {error.userMessage}
          </p>
          {error.suggestedAction && (
            <p className="mt-1 text-xs text-gray-400">
              {error.suggestedAction}
            </p>
          )}
          {error.retryable && (
            <button
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
              onClick={() => {
                // Trigger retry logic here if needed
                onClose();
              }}
            >
              다시 시도
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      <motion.div
        className="mt-3 h-0.5 bg-gray-600 rounded-full overflow-hidden"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
      />
    </div>
  );
}

// Export for use in App.tsx
export default ErrorToast;
