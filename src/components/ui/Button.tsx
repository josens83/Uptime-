import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 active:bg-primary-700',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-dark-100 focus:ring-dark-500 active:bg-dark-800',
    success: 'bg-success-600 hover:bg-success-500 text-white focus:ring-success-500 active:bg-success-700',
    warning: 'bg-warning-600 hover:bg-warning-500 text-white focus:ring-warning-500 active:bg-warning-700',
    danger: 'bg-danger-600 hover:bg-danger-500 text-white focus:ring-danger-500 active:bg-danger-700',
    ghost: 'bg-transparent hover:bg-dark-800 text-dark-300 hover:text-dark-100'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
