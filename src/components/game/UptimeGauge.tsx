import React from 'react';
import { motion } from 'framer-motion';
import { cn, getUptimeColor } from '../../utils/helpers';

interface UptimeGaugeProps {
  value: number;
  size?: number;
  className?: string;
}

export function UptimeGauge({ value, size = 200, className }: UptimeGaugeProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Only show 270 degrees of the circle (leave 90 degrees at bottom empty)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (Math.min(100, Math.max(0, value)) / 100) * arcLength;

  const getGaugeColor = () => {
    if (value >= 99.9) return '#22c55e'; // success-500
    if (value >= 99) return '#4ade80'; // success-400
    if (value >= 95) return '#fbbf24'; // warning-400
    if (value >= 90) return '#f59e0b'; // warning-500
    return '#ef4444'; // danger-500
  };

  const getGlowColor = () => {
    if (value >= 99.9) return 'rgba(34, 197, 94, 0.5)';
    if (value >= 99) return 'rgba(74, 222, 128, 0.4)';
    if (value >= 95) return 'rgba(251, 191, 36, 0.4)';
    if (value >= 90) return 'rgba(245, 158, 11, 0.4)';
    return 'rgba(239, 68, 68, 0.5)';
  };

  const getStatusText = () => {
    if (value >= 99.9) return 'EXCELLENT';
    if (value >= 99) return 'GOOD';
    if (value >= 95) return 'WARNING';
    if (value >= 90) return 'CRITICAL';
    return 'EMERGENCY';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform rotate-[135deg]"
      >
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-dark-800"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />

        {/* Progress arc with glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            stroke: getGaugeColor(),
            strokeDasharray: `${arcLength} ${circumference}`,
            filter: `drop-shadow(0 0 8px ${getGlowColor()})`
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick, i) => {
          const angle = (tick / 100) * 270 - 225;
          const rad = (angle * Math.PI) / 180;
          const innerR = radius - strokeWidth / 2 - 4;
          const outerR = radius + strokeWidth / 2 + 4;
          const x1 = size / 2 + innerR * Math.cos(rad);
          const y1 = size / 2 + innerR * Math.sin(rad);
          const x2 = size / 2 + outerR * Math.cos(rad);
          const y2 = size / 2 + outerR * Math.sin(rad);

          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i === 4 ? '#22c55e' : '#475569'}
              strokeWidth={tick === 100 ? 3 : 2}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('text-4xl font-bold font-mono', getUptimeColor(value))}
          key={Math.floor(value * 10)}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {value.toFixed(2)}%
        </motion.span>
        <span className="text-xs text-dark-400 uppercase tracking-wider mt-1">
          UPTIME
        </span>
        <motion.span
          className={cn(
            'text-xs font-medium uppercase tracking-wider mt-2 px-2 py-0.5 rounded',
            value >= 99.9 && 'bg-success-900/50 text-success-400',
            value >= 99 && value < 99.9 && 'bg-success-900/30 text-success-400',
            value >= 95 && value < 99 && 'bg-warning-900/50 text-warning-400',
            value >= 90 && value < 95 && 'bg-warning-900/50 text-warning-500',
            value < 90 && 'bg-danger-900/50 text-danger-400 animate-pulse'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {getStatusText()}
        </motion.span>
      </div>

      {/* Emergency pulse ring */}
      {value < 90 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-danger-500"
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
