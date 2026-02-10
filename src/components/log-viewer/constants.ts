import type { LogLevel, LogLevelColors } from './types'

/**
 * Color configuration for each log level
 * Follows accessibility standards (WCAG AA 4.5:1 for text)
 */
export const LOG_LEVEL_COLORS: Record<LogLevel, LogLevelColors> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  debug: {
    bg: 'bg-gray-50 dark:bg-gray-950',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
  },
  warn: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  trace: {
    bg: 'bg-slate-50 dark:bg-slate-950',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
  },
}

/**
 * Default filter state
 */
export const DEFAULT_FILTER = {
  searchTerm: '',
  levels: ['info', 'debug', 'warn', 'error', 'trace'] as LogLevel[],
  modules: [],
}

/**
 * Log level display labels
 */
export const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  info: 'INFO',
  debug: 'DEBUG',
  warn: 'WARN',
  error: 'ERROR',
  trace: 'TRACE',
}

/**
 * Available log levels for filtering
 */
export const AVAILABLE_LOG_LEVELS: LogLevel[] = ['info', 'debug', 'warn', 'error', 'trace']
