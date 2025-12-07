import React from 'react';
import { cn } from '../../utils/helpers';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'gradient';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  labelPosition = 'outside',
  animated = false,
  className
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorStyles = {
    default: 'bg-dark-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    primary: 'bg-primary-500',
    gradient: 'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between text-xs text-dark-400 mb-1">
          <span>{value.toFixed(1)}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-dark-800 rounded-full overflow-hidden',
        sizeStyles[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colorStyles[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && size === 'lg' && (
            <span className="flex items-center justify-center h-full text-xs text-white font-medium">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'success' | 'warning' | 'danger' | 'primary';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showValue = true,
  label,
  className
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    success: 'stroke-success-500',
    warning: 'stroke-warning-500',
    danger: 'stroke-danger-500',
    primary: 'stroke-primary-500'
  };

  const getColor = () => {
    if (value >= 99.9) return 'success';
    if (value >= 95) return 'warning';
    if (value >= 90) return 'warning';
    return 'danger';
  };

  const dynamicColor = color === 'primary' ? color : getColor();

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-dark-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500',
            colorStyles[dynamicColor]
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-dark-100">
            {value.toFixed(1)}%
          </span>
          {label && (
            <span className="text-xs text-dark-400 uppercase tracking-wider">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
