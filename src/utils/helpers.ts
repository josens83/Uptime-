import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format money
export function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${Math.floor(amount).toLocaleString()}`;
}

// Format number with commas
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return Math.floor(num).toLocaleString();
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format time (seconds to MM:SS)
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format day/hour
export function formatGameTime(day: number, hour: number): string {
  return `Day ${day}, ${hour.toString().padStart(2, '0')}:00`;
}

// Get uptime color class
export function getUptimeColor(uptime: number): string {
  if (uptime >= 99.9) return 'text-success-400';
  if (uptime >= 99) return 'text-success-500';
  if (uptime >= 95) return 'text-warning-400';
  if (uptime >= 90) return 'text-warning-500';
  return 'text-danger-500';
}

// Get uptime background color
export function getUptimeBgColor(uptime: number): string {
  if (uptime >= 99.9) return 'bg-success-500';
  if (uptime >= 99) return 'bg-success-600';
  if (uptime >= 95) return 'bg-warning-500';
  if (uptime >= 90) return 'bg-warning-600';
  return 'bg-danger-500';
}

// Get tech debt color
export function getTechDebtColor(techDebt: number): string {
  if (techDebt <= 20) return 'text-success-400';
  if (techDebt <= 40) return 'text-success-500';
  if (techDebt <= 60) return 'text-warning-400';
  if (techDebt <= 80) return 'text-warning-500';
  return 'text-danger-500';
}

// Get tech debt background color
export function getTechDebtBgColor(techDebt: number): string {
  if (techDebt <= 20) return 'bg-success-500';
  if (techDebt <= 40) return 'bg-success-600';
  if (techDebt <= 60) return 'bg-warning-500';
  if (techDebt <= 80) return 'bg-warning-600';
  return 'bg-danger-500';
}

// Get reputation color
export function getReputationColor(reputation: number): string {
  if (reputation >= 80) return 'text-success-400';
  if (reputation >= 60) return 'text-success-500';
  if (reputation >= 40) return 'text-warning-400';
  if (reputation >= 20) return 'text-warning-500';
  return 'text-danger-500';
}

// Phase display name
export function getPhaseName(phase: string): string {
  switch (phase) {
    case 'web': return 'Web';
    case 'mobile': return 'Mobile Web';
    case 'app': return 'Native App';
    default: return phase;
  }
}

// Phase icon
export function getPhaseIcon(phase: string): string {
  switch (phase) {
    case 'web': return '🌐';
    case 'mobile': return '📱';
    case 'app': return '📲';
    default: return '🌐';
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Random integer
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp value
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Lerp (linear interpolation)
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Calculate progress percentage
export function calculateProgress(current: number, max: number): number {
  return Math.min(100, Math.max(0, (current / max) * 100));
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

// Time ago
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;

  return new Date(timestamp).toLocaleDateString('ko-KR');
}

// Storage helpers
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return defaultValue;
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random color
export function getRandomColor(): string {
  const colors = [
    'bg-primary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
