import { memo } from 'react'
import type { LogEntryItemProps } from './types'
import { LOG_LEVEL_COLORS, LOG_LEVEL_LABELS } from './constants'
import { cn } from '../../lib/utils'

/**
 * Individual log entry item component
 * Memoized for performance with large lists
 */
export const LogEntryItem = memo(function LogEntryItem({
  entry,
  state,
  onClick,
  isClickable,
}: LogEntryItemProps) {
  const level = entry.level as keyof typeof LOG_LEVEL_COLORS
  const colors = LOG_LEVEL_COLORS[level]
  const hasState = Boolean(state)

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 border-b border-border transition-colors',
        'hover:bg-muted/50',
        colors.bg,
        isClickable && 'cursor-pointer hover:shadow-sm',
        isClickable && hasState && 'hover:bg-blue-100/50 dark:hover:bg-blue-900/30'
      )}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : 'listitem'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${LOG_LEVEL_LABELS[level]} log entry at line ${entry.lineNumber}`}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* Line Number */}
      <div className="flex-shrink-0 w-16 text-right text-xs text-muted-foreground font-mono tabular-nums">
        #{entry.lineNumber}
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 w-28 text-xs text-muted-foreground font-mono">
        <time dateTime={entry.timestamp.iso}>
          {formatTime(entry.timestamp)}
        </time>
      </div>

      {/* Log Level Badge */}
      <div className={cn(
        'flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border',
        colors.bg,
        colors.text,
        colors.border
      )}>
        {LOG_LEVEL_LABELS[level]}
      </div>

      {/* Module */}
      <div className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
        {entry.module}
      </div>

      {/* Message */}
      <div className={cn(
        'flex-1 min-w-0 text-sm break-words',
        colors.text
      )}>
        {entry.message}
      </div>

      {/* State Indicator */}
      {hasState && state && (
        <div
          className={cn(
            'flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium',
            'bg-primary/10 text-primary border border-primary/20',
            'group-hover:bg-primary/20 group-hover:scale-105 transition-transform'
          )}
          title={`State ${state.id}${state.isFailure ? ' (failure)' : ''}${state.isLoop ? ' (loop)' : ''}`}
        >
          State {state.id}
        </div>
      )}
    </div>
  )
})

/**
 * Format timestamp for display
 */
function formatTime(timestamp: {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}): string {
  const pad = (n: number, width: number) => String(n).padStart(width, '0')
  return `${pad(timestamp.hours, 2)}:${pad(timestamp.minutes, 2)}:${pad(timestamp.seconds, 2)}.${pad(timestamp.milliseconds, 3)}`
}
