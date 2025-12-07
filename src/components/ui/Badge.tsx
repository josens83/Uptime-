import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-dark-700 text-dark-300 border-dark-600',
    success: 'bg-success-900/50 text-success-400 border-success-700/50',
    warning: 'bg-warning-900/50 text-warning-400 border-warning-700/50',
    danger: 'bg-danger-900/50 text-danger-400 border-danger-700/50',
    info: 'bg-primary-900/50 text-primary-400 border-primary-700/50',
    premium: 'bg-gradient-to-r from-yellow-600 to-amber-500 text-white border-yellow-500'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const dotColors = {
    default: 'bg-dark-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    info: 'bg-primary-400',
    premium: 'bg-yellow-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'danger' | 'primary';
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = 'danger',
  className
}: CountBadgeProps) {
  const variantStyles = {
    default: 'bg-dark-600 text-dark-100',
    danger: 'bg-danger-600 text-white',
    primary: 'bg-primary-600 text-white'
  };

  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
