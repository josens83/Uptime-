import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-dark-900/50 backdrop-blur-sm border border-dark-700/50',
    hover: 'bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 hover:border-dark-600 hover:bg-dark-800/50 transition-all duration-200 cursor-pointer',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-dark-100">{title}</h3>
          {subtitle && (
            <p className="text-sm text-dark-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'default',
  className
}: StatCardProps) {
  const colorStyles = {
    default: 'text-dark-100',
    success: 'text-success-400',
    warning: 'text-warning-400',
    danger: 'text-danger-400',
    primary: 'text-primary-400'
  };

  return (
    <Card className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-dark-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-dark-500">{icon}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', colorStyles[color])}>
          {value}
        </span>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend.isPositive ? 'text-success-400' : 'text-danger-400'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </Card>
  );
}
